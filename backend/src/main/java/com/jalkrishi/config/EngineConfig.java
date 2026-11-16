package com.jalkrishi.config;

import com.jalkrishi.engine.SuitabilityThresholds;
import com.jalkrishi.engine.WaterBudgetEngine;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SuitabilityThresholds.class)
public class EngineConfig {

    @Bean
    public WaterBudgetEngine waterBudgetEngine(SuitabilityThresholds thresholds) {
        return new WaterBudgetEngine(thresholds);
    }
}