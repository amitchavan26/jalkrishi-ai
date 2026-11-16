package com.jalkrishi.assessment;

import com.jalkrishi.crop.Crop;
import com.jalkrishi.crop.CropRepository;
import com.jalkrishi.data.DataService;
import com.jalkrishi.data.WeatherData;
import com.jalkrishi.farm.Farm;
import com.jalkrishi.farm.FarmRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final AssessmentRepository assessmentRepository;
    private final FarmRepository farmRepository;
    private final CropRepository cropRepository;
    private final DataService dataService;

    public AssessmentController(AssessmentService assessmentService,
            AssessmentRepository assessmentRepository,
            FarmRepository farmRepository,
            CropRepository cropRepository,
            DataService dataService) {
        this.assessmentService = assessmentService;
        this.assessmentRepository = assessmentRepository;
        this.farmRepository = farmRepository;
        this.cropRepository = cropRepository;
        this.dataService = dataService;
    }

    private String getUserId(Authentication authentication) {
        return (String) authentication.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody AssessmentRequest request,
            Authentication authentication) {
        String userId = getUserId(authentication);
        Assessment assessment = assessmentService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(AssessmentResponse.from(assessment));
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication authentication) {
        String userId = getUserId(authentication);
        List<Assessment> assessments = assessmentRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(assessments.stream().map(AssessmentResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id, Authentication authentication) {
        String userId = getUserId(authentication);
        Assessment assessment = assessmentRepository.findByIdAndOwnerId(id, userId);
        if (assessment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found");
        }
        return ResponseEntity.ok(AssessmentResponse.from(assessment));
    }

    @PostMapping("/compare")
    public ResponseEntity<?> compare(@Valid @RequestBody CompareRequest request,
            Authentication authentication) {
        String userId = getUserId(authentication);

        // Validate horizonDays
        if (request.horizonDays() != 30 && request.horizonDays() != 60 && request.horizonDays() != 90) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "horizonDays must be 30, 60, or 90");
        }

        // Load farm (must belong to user)
        Farm farm = farmRepository.findByIdAndOwnerId(request.farmId(), userId);
        if (farm == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Farm not found");
        }

        // Load all crops (must all exist)
        List<Crop> crops = new java.util.ArrayList<>();
        for (String cropId : request.cropIds()) {
            Crop crop = cropRepository.findById(cropId).orElse(null);
            if (crop == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Crop not found: " + cropId);
            }
            crops.add(crop);
        }

        // Fetch weather ONCE
        WeatherData weather = dataService.getWeather(farm.getLat(), farm.getLon());

        // Compute one Assessment per crop (not saved)
        List<Assessment> assessments = crops.stream()
                .map(crop -> assessmentService.compute(userId, farm, crop, request.horizonDays(), weather))
                .collect(Collectors.toList());

        // Sort by ratio descending
        assessments.sort((a, b) -> Double.compare(b.getRatio(), a.getRatio()));

        // Convert to response
        List<AssessmentResponse> responses = assessments.stream()
                .map(AssessmentResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
}