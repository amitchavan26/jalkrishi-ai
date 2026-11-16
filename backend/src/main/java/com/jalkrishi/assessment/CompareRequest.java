package com.jalkrishi.assessment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CompareRequest(
    @NotBlank(message = "farmId must not be blank") String farmId,
    @NotEmpty(message = "cropIds must not be empty") List<String> cropIds,
    int horizonDays
) {}