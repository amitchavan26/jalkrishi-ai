package com.jalkrishi.engine;

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