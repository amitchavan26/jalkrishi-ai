package com.jalkrishi.farm;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class FarmRequest {
    @NotBlank(message = "name must not be blank")
    private String name;

    @NotNull(message = "lat must not be null")
    @Min(value = -90, message = "lat must be >= -90")
    @Max(value = 90, message = "lat must be <= 90")
    private Double lat;

    @NotNull(message = "lon must not be null")
    @Min(value = -180, message = "lon must be >= -180")
    @Max(value = 180, message = "lon must be <= 180")
    private Double lon;

    @NotNull(message = "areaHa must not be null")
    @Positive(message = "areaHa must be > 0")
    private Double areaHa;

    private String soilType;

    @NotNull(message = "storedWaterLitres must not be null")
    @PositiveOrZero(message = "storedWaterLitres must be >= 0")
    private Double storedWaterLitres;

    @NotNull(message = "groundwaterLitres must not be null")
    @PositiveOrZero(message = "groundwaterLitres must be >= 0")
    private Double groundwaterLitres;

    @Size(max = 100, message = "country must be at most 100 characters")
    private String country;
    @Size(max = 100, message = "state must be at most 100 characters")
    private String state;
    @Size(max = 100, message = "district must be at most 100 characters")
    private String district;
    @Size(max = 100, message = "taluka must be at most 100 characters")
    private String taluka;
    @Size(max = 100, message = "village must be at most 100 characters")
    private String village;

    @NotNull(message = "storedWaterLitresPerDay must not be null")
    @PositiveOrZero(message = "storedWaterLitresPerDay must be >= 0")
    private Double storedWaterLitresPerDay = 0.0;

    @NotNull(message = "groundwaterLitresPerDay must not be null")
    @PositiveOrZero(message = "groundwaterLitresPerDay must be >= 0")
    private Double groundwaterLitresPerDay = 0.0;

    public FarmRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLon() { return lon; }
    public void setLon(Double lon) { this.lon = lon; }

    public Double getAreaHa() { return areaHa; }
    public void setAreaHa(Double areaHa) { this.areaHa = areaHa; }

    public String getSoilType() { return soilType; }
    public void setSoilType(String soilType) { this.soilType = soilType; }

    public Double getStoredWaterLitres() { return storedWaterLitres; }
    public void setStoredWaterLitres(Double storedWaterLitres) { this.storedWaterLitres = storedWaterLitres; }

    public Double getGroundwaterLitres() { return groundwaterLitres; }
    public void setGroundwaterLitres(Double groundwaterLitres) { this.groundwaterLitres = groundwaterLitres; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getTaluka() { return taluka; }
    public void setTaluka(String taluka) { this.taluka = taluka; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public Double getStoredWaterLitresPerDay() { return storedWaterLitresPerDay; }
    public void setStoredWaterLitresPerDay(Double storedWaterLitresPerDay) { this.storedWaterLitresPerDay = storedWaterLitresPerDay; }

    public Double getGroundwaterLitresPerDay() { return groundwaterLitresPerDay; }
    public void setGroundwaterLitresPerDay(Double groundwaterLitresPerDay) { this.groundwaterLitresPerDay = groundwaterLitresPerDay; }
}