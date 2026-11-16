package com.jalkrishi.engine;

public record WaterBudgetResult(
    double supplyLitres,
    double demandLitres,
    double balanceLitres,
    double ratio,
    Suitability suitability,
    Stress stress,
    double et0
) {}