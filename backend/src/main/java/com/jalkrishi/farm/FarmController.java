package com.jalkrishi.farm;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farms")
public class FarmController {

    private final FarmRepository farmRepository;

    public FarmController(FarmRepository farmRepository) {
        this.farmRepository = farmRepository;
    }

    private String getUserId(Authentication authentication) {
        return (String) authentication.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody FarmRequest request, Authentication authentication) {
        String userId = getUserId(authentication);
        Farm farm = new Farm(userId, request.getName(), request.getLat(), request.getLon(),
                request.getAreaHa(), request.getSoilType(), request.getStoredWaterLitres(),
                request.getGroundwaterLitres());
        farm.setCountry(normalizeString(request.getCountry()));
        farm.setState(normalizeString(request.getState()));
        farm.setDistrict(normalizeString(request.getDistrict()));
        farm.setTaluka(normalizeString(request.getTaluka()));
        farm.setVillage(normalizeString(request.getVillage()));
        farm.setStoredWaterLitresPerDay(request.getStoredWaterLitresPerDay());
        farm.setGroundwaterLitresPerDay(request.getGroundwaterLitresPerDay());
        Farm saved = farmRepository.save(farm);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication authentication) {
        String userId = getUserId(authentication);
        List<Farm> farms = farmRepository.findByOwnerId(userId);
        return ResponseEntity.ok(farms.stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id, Authentication authentication) {
        String userId = getUserId(authentication);
        Farm farm = farmRepository.findByIdAndOwnerId(id, userId);
        if (farm == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Farm not found");
        }
        return ResponseEntity.ok(toResponse(farm));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody FarmRequest request, Authentication authentication) {
        String userId = getUserId(authentication);
        Farm farm = farmRepository.findByIdAndOwnerId(id, userId);
        if (farm == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Farm not found");
        }
        farm.setName(request.getName());
        farm.setLat(request.getLat());
        farm.setLon(request.getLon());
        farm.setAreaHa(request.getAreaHa());
        farm.setSoilType(request.getSoilType());
        farm.setStoredWaterLitres(request.getStoredWaterLitres());
        farm.setGroundwaterLitres(request.getGroundwaterLitres());
        farm.setCountry(normalizeString(request.getCountry()));
        farm.setState(normalizeString(request.getState()));
        farm.setDistrict(normalizeString(request.getDistrict()));
        farm.setTaluka(normalizeString(request.getTaluka()));
        farm.setVillage(normalizeString(request.getVillage()));
        farm.setStoredWaterLitresPerDay(request.getStoredWaterLitresPerDay());
        farm.setGroundwaterLitresPerDay(request.getGroundwaterLitresPerDay());
        Farm saved = farmRepository.save(farm);
        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication authentication) {
        String userId = getUserId(authentication);
        Farm farm = farmRepository.findByIdAndOwnerId(id, userId);
        if (farm == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Farm not found");
        }
        farmRepository.delete(farm);
        return ResponseEntity.noContent().build();
    }

    private String normalizeString(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s;
    }

    private Map<String, Object> toResponse(Farm farm) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", farm.getId());
        map.put("ownerId", farm.getOwnerId());
        map.put("name", farm.getName());
        map.put("lat", farm.getLat());
        map.put("lon", farm.getLon());
        map.put("areaHa", farm.getAreaHa());
        map.put("soilType", farm.getSoilType());
        map.put("storedWaterLitres", farm.getStoredWaterLitres());
        map.put("groundwaterLitres", farm.getGroundwaterLitres());
        map.put("country", farm.getCountry());
        map.put("state", farm.getState());
        map.put("district", farm.getDistrict());
        map.put("taluka", farm.getTaluka());
        map.put("village", farm.getVillage());
        map.put("storedWaterLitresPerDay", farm.getStoredWaterLitresPerDay());
        map.put("groundwaterLitresPerDay", farm.getGroundwaterLitresPerDay());
        map.put("createdAt", farm.getCreatedAt());
        return map;
    }
}