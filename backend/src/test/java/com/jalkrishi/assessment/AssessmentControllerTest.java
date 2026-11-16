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
public class AssessmentControllerTest {

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
    private String cropId;

    private static WeatherData fallbackWeather() {
        return new WeatherData(32, 21, 15.0, 1.5, WeatherSource.FALLBACK);
    }

    private static WeatherData liveWeather() {
        return new WeatherData(30, 20, 15.0, 2.0, WeatherSource.LIVE);
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
        List<Map<String, Object>> crops =
                objectMapper.readValue(cropsResult.getResponse().getContentAsString(), List.class);
        assertFalse(crops.isEmpty(), "Crops should be seeded");
        cropId = (String) crops.get(0).get("id");
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

    private MvcResult postAssessment(String token, String farm, String crop, int horizon, int expectedStatus)
            throws Exception {
        Map<String, Object> request = Map.of("farmId", farm, "cropId", crop, "horizonDays", horizon);
        var builder = post("/api/assessments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request));
        if (token != null) {
            builder = builder.header("Authorization", "Bearer " + token);
        }
        return mockMvc.perform(builder).andExpect(status().is(expectedStatus)).andReturn();
    }

    private Map<String, Object> body(MvcResult result) throws Exception {
        return objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
    }

    @Test
    void createReturns201AndConsistentNumbers() throws Exception {
        Map<String, Object> created = body(postAssessment(user1Token, farmId, cropId, 30, 201));
        double supply = ((Number) created.get("supplyLitres")).doubleValue();
        double demand = ((Number) created.get("demandLitres")).doubleValue();
        double balance = ((Number) created.get("balanceLitres")).doubleValue();
        double ratio = ((Number) created.get("ratio")).doubleValue();
        assertEquals(supply - demand, balance, 0.01);
        assertEquals(supply / demand, ratio, 1e-9);

        String id = (String) created.get("id");
        mockMvc.perform(get("/api/assessments/" + id).header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk());
    }

    @Test
    void liveWeatherGivesHighConfidence() throws Exception {
        when(dataService.getWeather(anyDouble(), anyDouble())).thenReturn(liveWeather());
        Map<String, Object> created = body(postAssessment(user1Token, farmId, cropId, 30, 201));
        assertEquals("HIGH", created.get("confidence"));
    }

    @Test
    void fallbackWeatherGivesLowConfidence() throws Exception {
        when(dataService.getWeather(anyDouble(), anyDouble())).thenReturn(fallbackWeather());
        Map<String, Object> created = body(postAssessment(user1Token, farmId, cropId, 30, 201));
        assertEquals("LOW", created.get("confidence"));
    }

    @Test
    void listShowsOnlyOwnAssessments() throws Exception {
        postAssessment(user1Token, farmId, cropId, 30, 201);
        String farm2 = createFarm(user2Token, "User2 Farm");
        postAssessment(user2Token, farm2, cropId, 60, 201);

        MvcResult list = mockMvc.perform(get("/api/assessments")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();
        List<Map<String, Object>> items =
                objectMapper.readValue(list.getResponse().getContentAsString(), List.class);
        assertEquals(1, items.size());
        assertEquals(farmId, items.get(0).get("farmId"));
    }

    @Test
    void getOtherUsersAssessmentReturns404() throws Exception {
        String id = (String) body(postAssessment(user1Token, farmId, cropId, 30, 201)).get("id");
        mockMvc.perform(get("/api/assessments/" + id).header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isNotFound());
    }

    @Test
    void invalidHorizonReturns400() throws Exception {
        postAssessment(user1Token, farmId, cropId, 45, 400);
    }

    @Test
    void unknownFarmReturns404() throws Exception {
        postAssessment(user1Token, "non-existent-farm-id", cropId, 30, 404);
    }

    @Test
    void noTokenReturns401() throws Exception {
        postAssessment(null, farmId, cropId, 30, 401);
    }
}