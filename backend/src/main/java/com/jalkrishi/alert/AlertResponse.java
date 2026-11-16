package com.jalkrishi.alert;

import java.time.Instant;

public record AlertResponse(
    String assessmentId,
    String farmId,
    String cropId,
    String message,
    Instant createdAt
) {}