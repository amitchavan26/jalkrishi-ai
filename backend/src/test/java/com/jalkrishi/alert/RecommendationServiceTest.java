package com.jalkrishi.alert;

import com.jalkrishi.engine.Suitability;
import com.jalkrishi.engine.Stress;
import com.jalkrishi.engine.WaterBudgetResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RecommendationServiceTest {

    private final RecommendationService service = new RecommendationService();

    @Test
    void ratioAbove1_returnsWaterSupplyCoversCropDemand() {
        WaterBudgetResult result = new WaterBudgetResult(
                1200000.0,  // supplyLitres
                1000000.0,  // demandLitres
                200000.0,   // balanceLitres
                1.2,        // ratio
                Suitability.EXCELLENT,
                Stress.LOW,
                4.0         // et0
        );
        
        String advice = service.advice(result, 500000.0);
        
        assertTrue(advice.startsWith("EXCELLENT: water ratio is 1.20"));
        assertTrue(advice.contains("water supply covers crop demand"));
    }

    @Test
    void ratioBelow1_highEt0_returnsHighEvapotranspirationDemand() {
        WaterBudgetResult result = new WaterBudgetResult(
                500000.0,   // supplyLitres
                1000000.0,  // demandLitres
                -500000.0,  // balanceLitres
                0.5,        // ratio
                Suitability.NOT_RECOMMENDED,
                Stress.HIGH,
                6.0         // et0 >= 5.0
        );
        
        String advice = service.advice(result, 500000.0);
        
        assertTrue(advice.contains("high evapotranspiration demand"));
    }

    @Test
    void ratioBelow1_et0Below5_lowStoredPlusGroundwater_returnsLowStoredWaterAndGroundwater() {
        WaterBudgetResult result = new WaterBudgetResult(
                500000.0,   // supplyLitres
                1000000.0,  // demandLitres
                -500000.0,  // balanceLitres
                0.5,        // ratio
                Suitability.NOT_RECOMMENDED,
                Stress.HIGH,
                4.0         // et0 < 5.0
        );
        // storedPlusGroundwater = 100000, which is < 0.2 * 1000000 = 200000
        
        String advice = service.advice(result, 100000.0);
        
        assertTrue(advice.contains("low stored water and groundwater"));
    }

    @Test
    void ratioBelow1_et0Below5_storedPlusGroundwaterNotLow_returnsLowEffectiveRainfall() {
        WaterBudgetResult result = new WaterBudgetResult(
                500000.0,   // supplyLitres
                1000000.0,  // demandLitres
                -500000.0,  // balanceLitres
                0.5,        // ratio
                Suitability.NOT_RECOMMENDED,
                Stress.HIGH,
                4.0         // et0 < 5.0
        );
        // storedPlusGroundwater = 500000, which is >= 0.2 * 1000000 = 200000
        
        String advice = service.advice(result, 500000.0);
        
        assertTrue(advice.contains("low effective rainfall"));
    }
}