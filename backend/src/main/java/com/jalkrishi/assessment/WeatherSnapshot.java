package com.jalkrishi.assessment;

public record WeatherSnapshot(
    double tmax,
    double tmin,
    double ra,
    double peffDailyMm,
    String source
) {}