package com.jalkrishi.report;

import com.jalkrishi.assessment.Assessment;
import com.jalkrishi.assessment.AssessmentRepository;
import com.jalkrishi.assessment.AssessmentResponse;
import com.jalkrishi.assessment.WeatherSnapshot;
import com.jalkrishi.crop.Crop;
import com.jalkrishi.crop.CropRepository;
import com.jalkrishi.data.DataService;
import com.jalkrishi.data.WeatherData;
import com.jalkrishi.data.WeatherSource;
import com.jalkrishi.engine.StageInput;
import com.jalkrishi.engine.WaterBudgetEngine;
import com.jalkrishi.engine.WaterBudgetInput;
import com.jalkrishi.engine.WaterBudgetResult;
import com.jalkrishi.farm.Farm;
import com.jalkrishi.farm.FarmRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final AssessmentRepository assessmentRepository;
    private final FarmRepository farmRepository;
    private final CropRepository cropRepository;
    private final WaterBudgetEngine waterBudgetEngine;
    private final DataService dataService;

    public ReportController(AssessmentRepository assessmentRepository,
            FarmRepository farmRepository,
            CropRepository cropRepository,
            WaterBudgetEngine waterBudgetEngine,
            DataService dataService) {
        this.assessmentRepository = assessmentRepository;
        this.farmRepository = farmRepository;
        this.cropRepository = cropRepository;
        this.waterBudgetEngine = waterBudgetEngine;
        this.dataService = dataService;
    }

    private String getUserId(Authentication authentication) {
        return (String) authentication.getPrincipal();
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<?> getReport(@PathVariable String assessmentId, Authentication authentication) {
        String userId = getUserId(authentication);

        // Load assessment (owner only)
        Assessment assessment = assessmentRepository.findByIdAndOwnerId(assessmentId, userId);
        if (assessment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found");
        }

        // Load farm (must exist)
        Farm farm = farmRepository.findByIdAndOwnerId(assessment.getFarmId(), userId);
        if (farm == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Farm not found");
        }

        // Load crop (must exist)
        Crop crop = cropRepository.findById(assessment.getCropId()).orElse(null);
        if (crop == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Crop not found");
        }

        // Reconstruct WeatherData from stored weather snapshot
        WeatherSnapshot snapshot = assessment.getWeather();
        WeatherData weather = new WeatherData(
                snapshot.tmax(),
                snapshot.tmin(),
                snapshot.ra(),
                snapshot.peffDailyMm(),
                WeatherSource.valueOf(snapshot.source())
        );

        // Build stage inputs from crop
        List<StageInput> stageInputs = crop.getStages().stream()
                .map(s -> new StageInput(s.getName(), s.getDays(), s.getKc()))
                .collect(Collectors.toList());

        // Compute breakdown for 30, 60, 90
        int[] horizons = {30, 60, 90};
        List<BreakdownRow> breakdown = new ArrayList<>();

        for (int horizonDays : horizons) {
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

            WaterBudgetResult result = waterBudgetEngine.compute(input);
            breakdown.add(new BreakdownRow(
                    horizonDays,
                    result.supplyLitres(),
                    result.demandLitres(),
                    result.ratio(),
                    result.suitability()
            ));
        }

        ReportResponse response = new ReportResponse(
                AssessmentResponse.from(assessment),
                breakdown
        );

        return ResponseEntity.ok(response);
    }
}