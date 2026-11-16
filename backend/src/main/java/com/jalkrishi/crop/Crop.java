package com.jalkrishi.crop;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "crops")
public class Crop {
    @Id
    private String id;
    private String name;
    private List<Stage> stages;

    public Crop() {}

    public Crop(String name, List<Stage> stages) {
        this.name = name;
        this.stages = stages;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Stage> getStages() { return stages; }
    public void setStages(List<Stage> stages) { this.stages = stages; }

    public static class Stage {
        private String name;
        private int days;
        private double kc;

        public Stage() {}

        public Stage(String name, int days, double kc) {
            this.name = name;
            this.days = days;
            this.kc = kc;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public int getDays() { return days; }
        public void setDays(int days) { this.days = days; }

        public double getKc() { return kc; }
        public void setKc(double kc) { this.kc = kc; }
    }
}