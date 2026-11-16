package com.jalkrishi.engine;

import java.util.List;

public record WaterBudgetInput(
    double tmax,
    double tmin,
    double ra,
    double peffDailyMm,
    double areaHa,
    double storedWaterLitres,
    double groundwaterLitres,
    List<StageInput> stages,
    int horizonDays
) {}