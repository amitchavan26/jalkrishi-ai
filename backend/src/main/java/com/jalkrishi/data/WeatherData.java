package com.jalkrishi.data;

public record WeatherData(
    double tmax,
    double tmin,
    double ra,
    double peffDailyMm,
    WeatherSource source
) {}