package com.jalkrishi.engine;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class WaterBudgetEngineTest {

    private final SuitabilityThresholds thresholds = new SuitabilityThresholds(1.0, 0.8, 0.6);
    private final WaterBudgetEngine engine = new WaterBudgetEngine(thresholds);

    @Test
    void classifyBoundaries() {
        assertEquals(Suitability.EXCELLENT, engine.classify(1.0));
        assertEquals(Stress.LOW, engine.stressFor(Suitability.EXCELLENT));

        assertEquals(Suitability.GOOD, engine.classify(0.9));
        assertEquals(Stress.LOW_MODERATE, engine.stressFor(Suitability.GOOD));

        assertEquals(Suitability.GOOD, engine.classify(0.8));
        assertEquals(Stress.LOW_MODERATE, engine.stressFor(Suitability.GOOD));

        assertEquals(Suitability.RISKY, engine.classify(0.79));
        assertEquals(Stress.MODERATE, engine.stressFor(Suitability.RISKY));

        assertEquals(Suitability.RISKY, engine.classify(0.6));
        assertEquals(Stress.MODERATE, engine.stressFor(Suitability.RISKY));

        assertEquals(Suitability.NOT_RECOMMENDED, engine.classify(0.59));
        assertEquals(Stress.HIGH, engine.stressFor(Suitability.NOT_RECOMMENDED));
    }

    @Test
    void singleStageDemandMatchesFormula() {
        double et0 = Et0Calculator.et0(34, 22, 15);
        WaterBudgetInput input = new WaterBudgetInput(
                34, 22, 15, 0, 1, 0, 0,
                List.of(new StageInput("stage1", 30, 1.0)),
                30
        );
        WaterBudgetResult result = engine.compute(input);
        double expectedDemand = et0 * 30 * 10000;
        assertEquals(expectedDemand, result.demandLitres(), expectedDemand * 0.01);
    }

    @Test
    void twoStagesDemand() {
        double et0 = Et0Calculator.et0(34, 22, 15);
        WaterBudgetInput input = new WaterBudgetInput(
                34, 22, 15, 0, 1, 0, 0,
                List.of(
                        new StageInput("stage1", 10, 0.5),
                        new StageInput("stage2", 20, 1.0)
                ),
                30
        );
        WaterBudgetResult result = engine.compute(input);
        double expectedDemand = et0 * (0.5 * 10 + 1.0 * 20) * 10000;
        assertEquals(expectedDemand, result.demandLitres(), expectedDemand * 0.01);
    }

    @Test
    void horizonBeyondStagesUsesLastKc() {
        double et0 = Et0Calculator.et0(34, 22, 15);
        WaterBudgetInput input = new WaterBudgetInput(
                34, 22, 15, 0, 1, 0, 0,
                List.of(
                        new StageInput("stage1", 10, 0.5),
                        new StageInput("stage2", 20, 1.0)
                ),
                60
        );
        WaterBudgetResult result = engine.compute(input);
        double expectedDemand = et0 * (0.5 * 10 + 1.0 * 50) * 10000;
        assertEquals(expectedDemand, result.demandLitres(), expectedDemand * 0.01);
    }

    @Test
    void supplyFormula() {
        WaterBudgetInput input = new WaterBudgetInput(
                34, 22, 15, 2.0, 2, 1000, 500,
                List.of(new StageInput("stage1", 30, 1.0)),
                30
        );
        WaterBudgetResult result = engine.compute(input);
        double expectedSupply = 1201500;
        assertEquals(expectedSupply, result.supplyLitres(), 0.001);
    }

    @Test
    void balanceAndRatioConsistent() {
        WaterBudgetInput input = new WaterBudgetInput(
                34, 22, 15, 2.0, 2, 1000, 500,
                List.of(new StageInput("stage1", 30, 1.0)),
                30
        );
        WaterBudgetResult result = engine.compute(input);
        assertEquals(result.supplyLitres() - result.demandLitres(), result.balanceLitres(), 0.001);
        assertEquals(result.supplyLitres() / result.demandLitres(), result.ratio(), 0.001);
    }

    @Test
    void zeroAreaThrows() {
        WaterBudgetInput input = new WaterBudgetInput(
                34, 22, 15, 2.0, 0, 1000, 500,
                List.of(new StageInput("stage1", 30, 1.0)),
                30
        );
        assertThrows(IllegalArgumentException.class, () -> engine.compute(input));
    }
}