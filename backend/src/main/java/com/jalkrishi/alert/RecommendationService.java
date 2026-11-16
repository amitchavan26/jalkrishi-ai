package com.jalkrishi.alert;

import com.jalkrishi.engine.WaterBudgetResult;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class RecommendationService {

    public String advice(WaterBudgetResult result, double storedPlusGroundwaterLitres) {
        String factor;
        double ratio = result.ratio();
        
        if (ratio >= 1.0) {
            factor = "water supply covers crop demand";
        } else if (result.et0() >= 5.0) {
            factor = "high evapotranspiration demand";
        } else if (storedPlusGroundwaterLitres < 0.2 * result.demandLitres()) {
            factor = "low stored water and groundwater";
        } else {
            factor = "low effective rainfall";
        }
        
        String suitability = result.suitability().name();
        String formattedRatio = String.format(Locale.ROOT, "%.2f", ratio);
        
        return suitability + ": water ratio is " + formattedRatio + ", driven by " + factor + ".";
    }
}