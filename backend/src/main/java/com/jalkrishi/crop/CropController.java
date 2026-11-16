package com.jalkrishi.crop;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    private final CropRepository cropRepository;

    public CropController(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication authentication) {
        List<Crop> crops = cropRepository.findAll();
        List<Map<String, Object>> response = crops.stream().map(crop -> Map.of(
                "id", crop.getId(),
                "name", crop.getName(),
                "stages", crop.getStages().stream().map(stage -> Map.of(
                        "name", stage.getName(),
                        "days", stage.getDays(),
                        "kc", stage.getKc()
                )).collect(Collectors.toList())
        )).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}