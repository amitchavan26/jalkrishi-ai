package com.jalkrishi.alert;

import com.jalkrishi.assessment.Assessment;
import com.jalkrishi.assessment.AssessmentRepository;
import com.jalkrishi.engine.Stress;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AssessmentRepository assessmentRepository;

    public AlertController(AssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts(
            @AuthenticationPrincipal String userId) {
        List<Assessment> assessments = assessmentRepository.findByOwnerIdAndStressOrderByCreatedAtDesc(userId, Stress.HIGH);
        
        List<AlertResponse> responses = assessments.stream()
                .map(a -> new AlertResponse(
                        a.getId(),
                        a.getFarmId(),
                        a.getCropId(),
                        a.getAdvice(),
                        a.getCreatedAt()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
}