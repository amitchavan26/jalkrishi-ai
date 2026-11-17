package com.jalkrishi.engine;

    /**
     * Hargreaves-Samani reference evapotranspiration (FAO-56 equation 52).
     * @param tmax daily maximum temperature in degrees Celsius
     * @param tmin daily minimum temperature in degrees Celsius
     * @param ra extraterrestrial radiation as equivalent evaporation in mm/day
     *           (a value in MJ/m2/day must be multiplied by 0.408 first)
     * @return ET0 in mm/day
     */

public class Et0Calculator {

    public static double et0(double tmax, double tmin, double ra) {
        if (tmax < tmin) {
            throw new IllegalArgumentException("tmax must be >= tmin");
        }
        if (tmax == tmin) {
            return 0.0;
        }
        double tmean = (tmax + tmin) / 2.0;
        return 0.0023 * (tmean + 17.8) * Math.sqrt(tmax - tmin) * ra;
    }
}