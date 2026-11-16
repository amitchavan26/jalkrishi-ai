package com.jalkrishi.assessment;

import jakarta.validation.constraints.NotBlank;

public record AssessmentRequest(
    @NotBlank(message = "farmId must not be blank") String farmId,
    @NotBlank(message = "cropId must not be blank") String cropId,
    int horizonDays
) {}