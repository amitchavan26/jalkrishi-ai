package com.jalkrishi.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jalkrishi.TestAuth;
import com.jalkrishi.crop.CropRepository;
import com.jalkrishi.data.DataService;
import com.jalkrishi.data.WeatherData;
import com.jalkrishi.data.WeatherSource;
import com.jalkrishi.farm.FarmRepository;
import com.jalkrishi.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AssessmentCompareReportTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private FarmRepository farmRepository;
    @Autowired private CropRepository cropRepository;
    @Autowired private UserRepository userRepository;

    @MockitoBean private DataService dataService;

    private String user1Token;
    private String user2Token;
    private String farmId;
    private List<String> cropIds;

    private static WeatherData fallbackWeather() {
        return new WeatherData(32, 21, 15.0, 1.5, WeatherSource.FALLBACK);
    }

    @BeforeEach
    void setUp() throws Exception {
        assessmentRepository.deleteAll();
        farmRepository.deleteAll();
        userRepository.deleteAll();
        when(dataService.getWeather(anyDouble(), anyDouble())).thenReturn(fallbackWeather());

        TestAuth testAuth = new TestAuth(mockMvc, objectMapper);
        user1Token = testAuth.registerAndGetToken("User One", "user1@example.com", "password123");
        user2Token = testAuth.registerAndGetToken("User Two", "user2@example.com", "password123");

        farmId = createFarm(user1Token, "Test Farm");

        MvcResult cropsResult = mockMvc.perform(get("/api/crops")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();
        List<Map<String, Object>> crops = objectMapper.readValue(cropsResult.getResponse().getContentAsString(), List.class);
        assertFalse(crops.isEmpty(), "Crops should be seeded");
        cropIds = crops.stream().map(c -> (String) c.get("id")).toList();
        assertTrue(cropIds.size() >= 3, "Need at least 3 crops");
    }

    private String createFarm(String token, String name) throws Exception {
        Map<String, Object> farm = Map.of(
                "name", name, "lat", 12.9716, "lon", 77.5946, "areaHa", 2.5,
                "soilType", "Loam", "storedWaterLitres", 10000.0, "groundwaterLitres", 50000.0);
        MvcResult result = mockMvc.perform(post("/api/farms")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(farm)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> body = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) body.get("id");
    }

    @Test
    void compareReturnsSortedByRatioDescending() throws Exception {
        // Use first 3 crop IDs
        List<String> threeCrops = cropIds.subList(0, 3);
        
        Map<String, Object> request = Map.of(
                "farmId", farmId,
                "cropIds", threeCrops,
                "horizonDays", 30);

        MvcResult result = mockMvc.perform(post("/api/assessments/compare")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> assessments = objectMapper.readValue(
                result.getResponse().getContentAsString(), List.class);

        assertEquals(3, assessments.size());
        
        // Check ratios are non-increasing (descending)
        for (int i = 0; i < assessments.size() - 1; i++) {
            double ratio1 = ((Number) assessments.get(i).get("ratio")).doubleValue();
            double ratio2 = ((Number) assessments.get(i + 1).get("ratio")).doubleValue();
            assertTrue(ratio1 >= ratio2 - 1e-9, "Ratios should be non-increasing");
        }
    }

    @Test
    void compareDoesNotSaveAssessments() throws Exception {
        List<String> threeCrops = cropIds.subList(0, 3);
        
        Map<String, Object> request = Map.of(
                "farmId", farmId,
                "cropIds", threeCrops,
                "horizonDays", 30);

        mockMvc.perform(post("/api/assessments/compare")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // GET /api/assessments should return empty list
        MvcResult listResult = mockMvc.perform(get("/api/assessments")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> assessments = objectMapper.readValue(
                listResult.getResponse().getContentAsString(), List.class);
        assertTrue(assessments.isEmpty(), "Compare should not save assessments");
    }

    @Test
    void compareUnknownCropReturns404() throws Exception {
        List<String> cropIdsWithUnknown = new java.util.ArrayList<>(cropIds.subList(0, 2));
        cropIdsWithUnknown.add("non-existent-crop-id");

        Map<String, Object> request = Map.of(
                "farmId", farmId,
                "cropIds", cropIdsWithUnknown,
                "horizonDays", 30);

        mockMvc.perform(post("/api/assessments/compare")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void reportHasThreeBreakdownRows() throws Exception {
        // First create an assessment
        String cropId = cropIds.get(0);
        Map<String, Object> createRequest = Map.of(
                "farmId", farmId,
                "cropId", cropId,
                "horizonDays", 60);

        MvcResult createResult = mockMvc.perform(post("/api/assessments")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> assessment = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), Map.class);
        String assessmentId = (String) assessment.get("id");

        // Get report
        MvcResult reportResult = mockMvc.perform(get("/api/reports/" + assessmentId)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> report = objectMapper.readValue(
                reportResult.getResponse().getContentAsString(), Map.class);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> breakdown = (List<Map<String, Object>>) report.get("breakdown");
        assertNotNull(breakdown);
        assertEquals(3, breakdown.size());
        
        // Check horizonDays values are 30, 60, 90 in that order
        assertEquals(30, ((Number) breakdown.get(0).get("horizonDays")).intValue());
        assertEquals(60, ((Number) breakdown.get(1).get("horizonDays")).intValue());
        assertEquals(90, ((Number) breakdown.get(2).get("horizonDays")).intValue());
    }

    @Test
    void reportOfOtherUserReturns404() throws Exception {
        // Create assessment as user1
        String cropId = cropIds.get(0);
        Map<String, Object> createRequest = Map.of(
                "farmId", farmId,
                "cropId", cropId,
                "horizonDays", 60);

        MvcResult createResult = mockMvc.perform(post("/api/assessments")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> assessment = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), Map.class);
        String assessmentId = (String) assessment.get("id");

        // Try to get report as user2
        mockMvc.perform(get("/api/reports/" + assessmentId)
                        .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isNotFound());
    }

    @Test
    void reportWithoutTokenReturns401() throws Exception {
        // Create assessment as user1
        String cropId = cropIds.get(0);
        Map<String, Object> createRequest = Map.of(
                "farmId", farmId,
                "cropId", cropId,
                "horizonDays", 60);

        MvcResult createResult = mockMvc.perform(post("/api/assessments")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> assessment = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), Map.class);
        String assessmentId = (String) assessment.get("id");

        // Try to get report without token
        mockMvc.perform(get("/api/reports/" + assessmentId))
                .andExpect(status().isUnauthorized());
    }
}