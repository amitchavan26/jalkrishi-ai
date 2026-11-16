package com.jalkrishi.assessment;

import com.jalkrishi.engine.Suitability;
import com.jalkrishi.engine.Stress;
import java.time.Instant;

public record AssessmentResponse(
    String id,
    String farmId,
    String cropId,
    int horizonDays,
    double supplyLitres,
    double demandLitres,
    double balanceLitres,
    double ratio,
    Suitability suitability,
    Stress stress,
    Confidence confidence,
    String advice,
    boolean mlUsed,
    String mlSuitability,
    WeatherSnapshot weather,
    Instant createdAt
) {
    public static AssessmentResponse from(Assessment assessment) {
        return new AssessmentResponse(
                assessment.getId(),
                assessment.getFarmId(),
                assessment.getCropId(),
                assessment.getHorizonDays(),
                assessment.getSupplyLitres(),
                assessment.getDemandLitres(),
                assessment.getBalanceLitres(),
                assessment.getRatio(),
                assessment.getSuitability(),
                assessment.getStress(),
                assessment.getConfidence(),
                assessment.getAdvice(),
                assessment.isMlUsed(),
                assessment.getMlSuitability(),
                assessment.getWeather(),
                assessment.getCreatedAt()
        );
    }
}