package com.jalkrishi.engine;

import java.util.List;

public class WaterBudgetEngine {

    private final SuitabilityThresholds thresholds;

    public WaterBudgetEngine(SuitabilityThresholds thresholds) {
        this.thresholds = thresholds;
    }

    public WaterBudgetResult compute(WaterBudgetInput input) {
        if (input.areaHa() <= 0) {
            throw new IllegalArgumentException("areaHa must be > 0");
        }
        if (input.horizonDays() <= 0) {
            throw new IllegalArgumentException("horizonDays must be > 0");
        }
        if (input.stages() == null || input.stages().isEmpty()) {
            throw new IllegalArgumentException("stages must not be empty");
        }

        double et0 = Et0Calculator.et0(input.tmax(), input.tmin(), input.ra());
        
        // Calculate demand
        double demand = calculateDemand(input, et0);
        
        if (demand <= 0) {
            throw new IllegalArgumentException("demand must be > 0");
        }

        // Calculate supply
        double supply = calculateSupply(input);

        double balance = supply - demand;
        double ratio = supply / demand;

        Suitability suitability = classify(ratio);
        Stress stress = stressFor(suitability);

        return new WaterBudgetResult(supply, demand, balance, ratio, suitability, stress, et0);
    }

    private double calculateDemand(WaterBudgetInput input, double et0) {
        List<StageInput> stages = input.stages();
        int horizonDays = input.horizonDays();
        double areaHa = input.areaHa();

        double totalKcDays = 0.0;
        int day = 1;
        int stageIndex = 0;
        int daysInCurrentStage = 0;
        StageInput currentStage = stages.get(0);

        while (day <= horizonDays) {
            if (stageIndex < stages.size()) {
                currentStage = stages.get(stageIndex);
                if (daysInCurrentStage >= currentStage.days()) {
                    stageIndex++;
                    daysInCurrentStage = 0;
                    if (stageIndex < stages.size()) {
                        currentStage = stages.get(stageIndex);
                    }
                }
            }
            // After last stage, keep using the last stage
            
            totalKcDays += currentStage.kc();
            daysInCurrentStage++;
            day++;
        }

        return totalKcDays * et0 * areaHa * 10000;
    }

    private double calculateSupply(WaterBudgetInput input) {
        double peffDailyMm = input.peffDailyMm();
        int horizonDays = input.horizonDays();
        double areaHa = input.areaHa();
        double storedWaterLitres = input.storedWaterLitres();
        double groundwaterLitres = input.groundwaterLitres();

        double effectiveRainfallLitres = (peffDailyMm * horizonDays) * areaHa * 10000;
        return effectiveRainfallLitres + storedWaterLitres + groundwaterLitres;
    }

    public Suitability classify(double ratio) {
        if (ratio >= thresholds.excellent()) {
            return Suitability.EXCELLENT;
        } else if (ratio >= thresholds.good()) {
            return Suitability.GOOD;
        } else if (ratio >= thresholds.risky()) {
            return Suitability.RISKY;
        } else {
            return Suitability.NOT_RECOMMENDED;
        }
    }

    public Stress stressFor(Suitability suitability) {
        return switch (suitability) {
            case EXCELLENT -> Stress.LOW;
            case GOOD -> Stress.LOW_MODERATE;
            case RISKY -> Stress.MODERATE;
            case NOT_RECOMMENDED -> Stress.HIGH;
        };
    }
}