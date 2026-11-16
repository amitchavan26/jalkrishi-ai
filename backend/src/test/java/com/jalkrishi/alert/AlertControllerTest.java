package com.jalkrishi.alert;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jalkrishi.TestAuth;
import com.jalkrishi.assessment.AssessmentRepository;
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
class AlertControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private FarmRepository farmRepository;
    @Autowired private UserRepository userRepository;

    @MockitoBean private DataService dataService;

    private String user1Token;
    private String user2Token;
    private String user1Id;
    private String farmId;
    private String cropId;

    private static WeatherData fallbackWeather() {
        return new WeatherData(32, 21, 15.0, 0.0, WeatherSource.FALLBACK);
    }

    @BeforeEach
    void setUp() throws Exception {
        // Clean ONLY assessments, farms and users (never crops)
        assessmentRepository.deleteAll();
        farmRepository.deleteAll();
        userRepository.deleteAll();
        
        when(dataService.getWeather(anyDouble(), anyDouble())).thenReturn(fallbackWeather());

        TestAuth testAuth = new TestAuth(mockMvc, objectMapper);
        user1Token = testAuth.registerAndGetToken("User One", "user1@example.com", "password123");
        user2Token = testAuth.registerAndGetToken("User Two", "user2@example.com", "password123");

        // Extract user IDs from /api/auth/me
        user1Id = extractUserId(user1Token);

        // Create farm with storedWaterLitres 0 and groundwaterLitres 0 and areaHa 5 so stress is HIGH
        farmId = createFarm(user1Token, "Test Farm", 0.0, 0.0, 5.0);

        // Get a crop
        MvcResult cropsResult = mockMvc.perform(get("/api/crops")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();
        List<Map<String, Object>> crops =
                objectMapper.readValue(cropsResult.getResponse().getContentAsString(), List.class);
        assertFalse(crops.isEmpty(), "Crops should be seeded");
        cropId = (String) crops.get(0).get("id");
    }

    private String extractUserId(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        Map<String, Object> body = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) body.get("id");
    }

    private String createFarm(String token, String name, double storedWaterLitres, double groundwaterLitres, double areaHa) throws Exception {
        Map<String, Object> farm = Map.of(
                "name", name,
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", areaHa,
                "soilType", "Loam",
                "storedWaterLitres", storedWaterLitres,
                "groundwaterLitres", groundwaterLitres);
        MvcResult result = mockMvc.perform(post("/api/farms")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(farm)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> body = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) body.get("id");
    }

    private String createAssessment(String token, String farm, String crop, int horizon) throws Exception {
        Map<String, Object> request = Map.of("farmId", farm, "cropId", crop, "horizonDays", horizon);
        MvcResult result = mockMvc.perform(post("/api/assessments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> body = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) body.get("id");
    }

    @Test
    void highStressAssessmentAppearsInAlerts() throws Exception {
        String assessmentId = createAssessment(user1Token, farmId, cropId, 30);

        MvcResult result = mockMvc.perform(get("/api/alerts")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> alerts = objectMapper.readValue(result.getResponse().getContentAsString(), List.class);
        
        assertEquals(1, alerts.size());
        assertEquals(assessmentId, alerts.get(0).get("assessmentId"));
        String message = (String) alerts.get(0).get("message");
        assertTrue(message.startsWith("NOT_RECOMMENDED"), "Message should start with NOT_RECOMMENDED, got: " + message);
    }

    @Test
    void otherUsersAlertsAreEmpty() throws Exception {
        // User 1 creates an assessment
        createAssessment(user1Token, farmId, cropId, 30);

        // User 2 calls GET /api/alerts
        MvcResult result = mockMvc.perform(get("/api/alerts")
                        .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> alerts = objectMapper.readValue(result.getResponse().getContentAsString(), List.class);
        assertTrue(alerts.isEmpty());
    }

    @Test
    void noTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isUnauthorized());
    }
}