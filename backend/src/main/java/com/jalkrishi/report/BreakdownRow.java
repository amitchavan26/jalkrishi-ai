package com.jalkrishi.report;

import com.jalkrishi.engine.Suitability;

public record BreakdownRow(
    int horizonDays,
    double supplyLitres,
    double demandLitres,
    double ratio,
    Suitability suitability
) {}