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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AssessmentMlIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private FarmRepository farmRepository;
    @Autowired private CropRepository cropRepository;
    @Autowired private UserRepository userRepository;

    @MockitoBean private DataService dataService;
    @MockitoBean private MlClient mlClient;

    private String userToken;
    private String farmId;
    private String cropId;

    private static WeatherData fallbackWeather() {
        return new WeatherData(32, 21, 15.0, 1.5, WeatherSource.FALLBACK);
    }

    @BeforeEach
    void setUp() throws Exception {
        assessmentRepository.deleteAll();
        farmRepository.deleteAll();
        userRepository.deleteAll();
        // Never delete crops - they are seeded
        
        when(dataService.getWeather(anyDouble(), anyDouble())).thenReturn(fallbackWeather());
        when(mlClient.predict(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(Optional.empty());

        TestAuth testAuth = new TestAuth(mockMvc, objectMapper);
        userToken = testAuth.registerAndGetToken("Test User", "test@example.com", "password123");

        farmId = createFarm(userToken, "Test Farm");

        MvcResult cropsResult = mockMvc.perform(MockMvcRequestBuilders.get("/api/crops")
                        .header("Authorization", "Bearer " + userToken))
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
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/farms")
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
        var builder = MockMvcRequestBuilders.post("/api/assessments")
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
    void mlSuggestionIsStoredWhenAvailable() throws Exception {
        when(mlClient.predict(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Optional.of("GOOD"));

        Map<String, Object> created = body(postAssessment(userToken, farmId, cropId, 30, 201));

        assertTrue((Boolean) created.get("mlUsed"));
        assertEquals("GOOD", created.get("mlSuitability"));
        assertNotNull(created.get("suitability"), "Rule-based suitability must be present");
    }

    @Test
    void mlFailureStillCreatesAssessment() throws Exception {
        when(mlClient.predict(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Optional.empty());

        Map<String, Object> created = body(postAssessment(userToken, farmId, cropId, 30, 201));

        assertFalse((Boolean) created.get("mlUsed"));
        assertNull(created.get("mlSuitability"));
        assertNotNull(created.get("suitability"), "Rule-based suitability must be present");
    }
}
