package com.jalkrishi.crop;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CropSeeder implements CommandLineRunner {

    private final CropRepository cropRepository;

    public CropSeeder(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
    }

    @Override
    public void run(String... args) {
        if (cropRepository.count() == 0) {
            List<Crop> crops = List.of(
                new Crop("Rice", List.of(
                    new Crop.Stage("Initial", 30, 1.05),
                    new Crop.Stage("Development", 30, 1.15),
                    new Crop.Stage("Mid", 60, 1.20),
                    new Crop.Stage("Late", 30, 0.90)
                )),
                new Crop("Wheat", List.of(
                    new Crop.Stage("Initial", 20, 0.40),
                    new Crop.Stage("Development", 30, 0.80),
                    new Crop.Stage("Mid", 50, 1.15),
                    new Crop.Stage("Late", 30, 0.30)
                )),
                new Crop("Cotton", List.of(
                    new Crop.Stage("Initial", 30, 0.35),
                    new Crop.Stage("Development", 50, 0.65),
                    new Crop.Stage("Mid", 55, 1.15),
                    new Crop.Stage("Late", 45, 0.60)
                )),
                new Crop("Sugarcane", List.of(
                    new Crop.Stage("Initial", 30, 0.40),
                    new Crop.Stage("Development", 60, 1.00),
                    new Crop.Stage("Mid", 150, 1.25),
                    new Crop.Stage("Late", 60, 0.75)
                )),
                new Crop("Maize", List.of(
                    new Crop.Stage("Initial", 25, 0.30),
                    new Crop.Stage("Development", 35, 0.75),
                    new Crop.Stage("Mid", 40, 1.20),
                    new Crop.Stage("Late", 30, 0.60)
                )),
                new Crop("Soybean", List.of(
                    new Crop.Stage("Initial", 20, 0.40),
                    new Crop.Stage("Development", 30, 0.80),
                    new Crop.Stage("Mid", 50, 1.10),
                    new Crop.Stage("Late", 30, 0.45)
                )),
                new Crop("Tomato", List.of(
                    new Crop.Stage("Initial", 30, 0.60),
                    new Crop.Stage("Development", 40, 0.95),
                    new Crop.Stage("Mid", 50, 1.15),
                    new Crop.Stage("Late", 30, 0.80)
                )),
                new Crop("Onion", List.of(
                    new Crop.Stage("Initial", 25, 0.70),
                    new Crop.Stage("Development", 40, 0.95),
                    new Crop.Stage("Mid", 50, 1.05),
                    new Crop.Stage("Late", 25, 0.75)
                ))
            );
            cropRepository.saveAll(crops);
        }
    }
}