package com.jalkrishi.assessment;

import com.jalkrishi.alert.RecommendationService;
import com.jalkrishi.crop.Crop;
import com.jalkrishi.crop.CropRepository;
import com.jalkrishi.data.DataService;
import com.jalkrishi.data.WeatherData;
import com.jalkrishi.data.WeatherSource;
import com.jalkrishi.engine.StageInput;
import com.jalkrishi.engine.Suitability;
import com.jalkrishi.engine.Stress;
import com.jalkrishi.engine.WaterBudgetEngine;
import com.jalkrishi.engine.WaterBudgetInput;
import com.jalkrishi.engine.WaterBudgetResult;
import com.jalkrishi.farm.Farm;
import com.jalkrishi.farm.FarmRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    private final FarmRepository farmRepository;
    private final CropRepository cropRepository;
    private final DataService dataService;
    private final WaterBudgetEngine waterBudgetEngine;
    private final AssessmentRepository assessmentRepository;
    private final RecommendationService recommendationService;
    private final MlClient mlClient;

    public AssessmentService(FarmRepository farmRepository,
            CropRepository cropRepository,
            DataService dataService,
            WaterBudgetEngine waterBudgetEngine,
            AssessmentRepository assessmentRepository,
            RecommendationService recommendationService,
            MlClient mlClient) {
        this.farmRepository = farmRepository;
        this.cropRepository = cropRepository;
        this.dataService = dataService;
        this.waterBudgetEngine = waterBudgetEngine;
        this.assessmentRepository = assessmentRepository;
        this.recommendationService = recommendationService;
        this.mlClient = mlClient;
    }

    public Assessment create(String userId, AssessmentRequest req) {
        // Load farm
        Farm farm = farmRepository.findByIdAndOwnerId(req.farmId(), userId);
        if (farm == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Farm not found");
        }

        // Load crop
        Crop crop = cropRepository.findById(req.cropId()).orElse(null);
        if (crop == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Crop not found");
        }

        // Validate horizonDays
        if (req.horizonDays() != 30 && req.horizonDays() != 60 && req.horizonDays() != 90) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "horizonDays must be 30, 60, or 90");
        }

        // Get weather
        WeatherData weather = dataService.getWeather(farm.getLat(), farm.getLon());

        // Compute assessment without saving
        Assessment assessment = compute(userId, farm, crop, req.horizonDays(), weather);

        // Call ML service only in create (not in compute)
        Optional<String> mlSuitabilityOpt = mlClient.predict(assessment.getRatio(), weather.tmax(), weather.tmin(), weather.peffDailyMm());
        if (mlSuitabilityOpt.isPresent()) {
            assessment.setMlUsed(true);
            assessment.setMlSuitability(mlSuitabilityOpt.get());
        } else {
            assessment.setMlUsed(false);
            assessment.setMlSuitability(null);
        }

        // Save and return
        return assessmentRepository.save(assessment);
    }

    public Assessment compute(String userId, Farm farm, Crop crop, int horizonDays, WeatherData weather) {
        // Build WaterBudgetInput
        List<StageInput> stageInputs = crop.getStages().stream()
                .map(s -> new StageInput(s.getName(), s.getDays(), s.getKc()))
                .collect(Collectors.toList());

        double storedWaterLitres = farm.getStoredWaterLitres();
        double groundwaterLitres = farm.getGroundwaterLitres();
        Double storedWaterLitresPerDay = farm.getStoredWaterLitresPerDay();
        Double groundwaterLitresPerDay = farm.getGroundwaterLitresPerDay();
        
        if (storedWaterLitresPerDay == null) storedWaterLitresPerDay = 0.0;
        if (groundwaterLitresPerDay == null) groundwaterLitresPerDay = 0.0;
        
        storedWaterLitres += storedWaterLitresPerDay * horizonDays;
        groundwaterLitres += groundwaterLitresPerDay * horizonDays;

        WaterBudgetInput input = new WaterBudgetInput(
                weather.tmax(),
                weather.tmin(),
                weather.ra(),
                weather.peffDailyMm(),
                farm.getAreaHa(),
                storedWaterLitres,
                groundwaterLitres,
                stageInputs,
                horizonDays
        );

        // Compute water budget
        WaterBudgetResult result;
        try {
            result = waterBudgetEngine.compute(input);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        // Determine confidence
        Confidence confidence = weather.source() == WeatherSource.LIVE ? Confidence.HIGH : Confidence.LOW;

        // Build WeatherSnapshot
        WeatherSnapshot weatherSnapshot = new WeatherSnapshot(
                weather.tmax(),
                weather.tmin(),
                weather.ra(),
                weather.peffDailyMm(),
                weather.source().name()
        );

        // Create assessment (not saved)
        Assessment assessment = new Assessment(
                userId,
                farm.getId(),
                crop.getId(),
                horizonDays,
                result.supplyLitres(),
                result.demandLitres(),
                result.balanceLitres(),
                result.ratio(),
                result.suitability(),
                result.stress(),
                confidence,
                null, // advice
                false, // mlUsed
                null, // mlSuitability
                weatherSnapshot
        );

        // Set advice
        double storedPlusGroundwater = storedWaterLitres + groundwaterLitres;
        assessment.setAdvice(recommendationService.advice(result, storedPlusGroundwater));

        return assessment;
    }
}