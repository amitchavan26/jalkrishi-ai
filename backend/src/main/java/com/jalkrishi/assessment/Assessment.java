package com.jalkrishi.assessment;

import com.jalkrishi.engine.Suitability;
import com.jalkrishi.engine.Stress;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "assessments")
public class Assessment {
    @Id
    private String id;

    @Indexed
    private String ownerId;

    private String farmId;
    private String cropId;
    private int horizonDays;
    private double supplyLitres;
    private double demandLitres;
    private double balanceLitres;
    private double ratio;
    private Suitability suitability;
    private Stress stress;
    private Confidence confidence;
    private String advice;
    private boolean mlUsed;
    private String mlSuitability;
    private WeatherSnapshot weather;
    private Instant createdAt = Instant.now();

    public Assessment() {}

    public Assessment(String ownerId, String farmId, String cropId, int horizonDays,
            double supplyLitres, double demandLitres, double balanceLitres, double ratio,
            Suitability suitability, Stress stress, Confidence confidence,
            String advice, boolean mlUsed, String mlSuitability,
            WeatherSnapshot weather) {
        this.ownerId = ownerId;
        this.farmId = farmId;
        this.cropId = cropId;
        this.horizonDays = horizonDays;
        this.supplyLitres = supplyLitres;
        this.demandLitres = demandLitres;
        this.balanceLitres = balanceLitres;
        this.ratio = ratio;
        this.suitability = suitability;
        this.stress = stress;
        this.confidence = confidence;
        this.advice = advice;
        this.mlUsed = mlUsed;
        this.mlSuitability = mlSuitability;
        this.weather = weather;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getFarmId() { return farmId; }
    public void setFarmId(String farmId) { this.farmId = farmId; }

    public String getCropId() { return cropId; }
    public void setCropId(String cropId) { this.cropId = cropId; }

    public int getHorizonDays() { return horizonDays; }
    public void setHorizonDays(int horizonDays) { this.horizonDays = horizonDays; }

    public double getSupplyLitres() { return supplyLitres; }
    public void setSupplyLitres(double supplyLitres) { this.supplyLitres = supplyLitres; }

    public double getDemandLitres() { return demandLitres; }
    public void setDemandLitres(double demandLitres) { this.demandLitres = demandLitres; }

    public double getBalanceLitres() { return balanceLitres; }
    public void setBalanceLitres(double balanceLitres) { this.balanceLitres = balanceLitres; }

    public double getRatio() { return ratio; }
    public void setRatio(double ratio) { this.ratio = ratio; }

    public Suitability getSuitability() { return suitability; }
    public void setSuitability(Suitability suitability) { this.suitability = suitability; }

    public Stress getStress() { return stress; }
    public void setStress(Stress stress) { this.stress = stress; }

    public Confidence getConfidence() { return confidence; }
    public void setConfidence(Confidence confidence) { this.confidence = confidence; }

    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }

    public boolean isMlUsed() { return mlUsed; }
    public void setMlUsed(boolean mlUsed) { this.mlUsed = mlUsed; }

    public String getMlSuitability() { return mlSuitability; }
    public void setMlSuitability(String mlSuitability) { this.mlSuitability = mlSuitability; }

    public WeatherSnapshot getWeather() { return weather; }
    public void setWeather(WeatherSnapshot weather) { this.weather = weather; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}