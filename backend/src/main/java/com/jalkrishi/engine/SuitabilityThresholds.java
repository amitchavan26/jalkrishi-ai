package com.jalkrishi.engine;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jalkrishi.suitability")
public record SuitabilityThresholds(double excellent, double good, double risky) {}