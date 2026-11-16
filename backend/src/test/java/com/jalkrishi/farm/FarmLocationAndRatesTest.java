package com.jalkrishi.farm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jalkrishi.TestAuth;
import com.jalkrishi.assessment.AssessmentRepository;
import com.jalkrishi.crop.CropRepository;
import com.jalkrishi.data.DataService;
import com.jalkrishi.data.WeatherData;
import com.jalkrishi.data.WeatherSource;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FarmLocationAndRatesTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CropRepository cropRepository;

    @MockitoBean
    private DataService dataService;

    private String user1Token;
    private String user1Id;
    private String cropId;

    @BeforeEach
    void setUp() throws Exception {
        assessmentRepository.deleteAll();
        farmRepository.deleteAll();
        userRepository.deleteAll();
        when(dataService.getWeather(anyDouble(), anyDouble())).thenReturn(new WeatherData(32, 21, 15.0, 1.5, WeatherSource.FALLBACK));

        TestAuth testAuth = new TestAuth(mockMvc, objectMapper);
        user1Token = testAuth.registerAndGetToken("User One", "user1@example.com", "password123");

        MvcResult result1 = mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();
        Map<String, Object> user1Map = objectMapper.readValue(result1.getResponse().getContentAsString(), Map.class);
        user1Id = (String) user1Map.get("id");

        MvcResult cropsResult = mockMvc.perform(get("/api/crops")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();
        List<Map<String, Object>> crops =
                objectMapper.readValue(cropsResult.getResponse().getContentAsString(), List.class);
        cropId = (String) crops.get(0).get("id");
    }

    @Test
    void farmStoresLocationAndRates() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("name", "Test Farm");
        request.put("lat", 12.9716);
        request.put("lon", 77.5946);
        request.put("areaHa", 2.5);
        request.put("soilType", "Loam");
        request.put("storedWaterLitres", 10000.0);
        request.put("groundwaterLitres", 50000.0);
        request.put("country", "India");
        request.put("state", "Maharashtra");
        request.put("district", "Nashik");
        request.put("taluka", "Niphad");
        request.put("village", "Pimpalgaon");
        request.put("storedWaterLitresPerDay", 5000.0);
        request.put("groundwaterLitresPerDay", 20000.0);

        MvcResult result = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> response = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        assertNotNull(response.get("id"));
        assertEquals("India", response.get("country"));
        assertEquals("Maharashtra", response.get("state"));
        assertEquals("Nashik", response.get("district"));
        assertEquals("Niphad", response.get("taluka"));
        assertEquals("Pimpalgaon", response.get("village"));
        assertEquals(5000.0, response.get("storedWaterLitresPerDay"));
        assertEquals(20000.0, response.get("groundwaterLitresPerDay"));

        // GET /api/farms/{id}
        String farmId = (String) response.get("id");
        MvcResult getResult = mockMvc.perform(get("/api/farms/" + farmId)
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> getResponse = objectMapper.readValue(getResult.getResponse().getContentAsString(), Map.class);
        assertEquals("India", getResponse.get("country"));
        assertEquals("Maharashtra", getResponse.get("state"));
        assertEquals("Nashik", getResponse.get("district"));
        assertEquals("Niphad", getResponse.get("taluka"));
        assertEquals("Pimpalgaon", getResponse.get("village"));
        assertEquals(5000.0, getResponse.get("storedWaterLitresPerDay"));
        assertEquals(20000.0, getResponse.get("groundwaterLitresPerDay"));
    }

    @Test
    void blankLocationFieldsAreNull() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("name", "Test Farm");
        request.put("lat", 12.9716);
        request.put("lon", 77.5946);
        request.put("areaHa", 2.5);
        request.put("soilType", "Loam");
        request.put("storedWaterLitres", 10000.0);
        request.put("groundwaterLitres", 50000.0);
        request.put("country", "India");
        request.put("state", "Maharashtra");
        request.put("district", "Nashik");
        request.put("taluka", "Niphad");
        request.put("village", "");
        request.put("storedWaterLitresPerDay", 5000.0);
        request.put("groundwaterLitresPerDay", 20000.0);

        MvcResult result = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> response = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        assertNull(response.get("village"));
    }

    @Test
    void negativePerDayReturns400() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("name", "Test Farm");
        request.put("lat", 12.9716);
        request.put("lon", 77.5946);
        request.put("areaHa", 2.5);
        request.put("soilType", "Loam");
        request.put("storedWaterLitres", 10000.0);
        request.put("groundwaterLitres", 50000.0);
        request.put("country", "India");
        request.put("state", "Maharashtra");
        request.put("district", "Nashik");
        request.put("taluka", "Niphad");
        request.put("village", "Pimpalgaon");
        request.put("storedWaterLitresPerDay", 5000.0);
        request.put("groundwaterLitresPerDay", -1.0);

        mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void perDayWaterIsMultipliedByHorizon() throws Exception {
        // Farm A: no stored or groundwater water of any kind
        Map<String, Object> requestA = new HashMap<>();
        requestA.put("name", "Farm A");
        requestA.put("lat", 12.9716);
        requestA.put("lon", 77.5946);
        requestA.put("areaHa", 2.5);
        requestA.put("soilType", "Loam");
        requestA.put("storedWaterLitres", 0.0);
        requestA.put("groundwaterLitres", 0.0);
        requestA.put("storedWaterLitresPerDay", 0.0);
        requestA.put("groundwaterLitresPerDay", 0.0);

        MvcResult resultA = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestA)))
                .andExpect(status().isCreated())
                .andReturn();
        String farmAId = (String) objectMapper.readValue(resultA.getResponse().getContentAsString(), Map.class).get("id");

        // Farm B: identical plus groundwaterLitresPerDay 1000 and storedWaterLitresPerDay 500
        Map<String, Object> requestB = new HashMap<>();
        requestB.put("name", "Farm B");
        requestB.put("lat", 12.9716);
        requestB.put("lon", 77.5946);
        requestB.put("areaHa", 2.5);
        requestB.put("soilType", "Loam");
        requestB.put("storedWaterLitres", 0.0);
        requestB.put("groundwaterLitres", 0.0);
        requestB.put("storedWaterLitresPerDay", 500.0);
        requestB.put("groundwaterLitresPerDay", 1000.0);

        MvcResult resultB = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestB)))
                .andExpect(status().isCreated())
                .andReturn();
        String farmBId = (String) objectMapper.readValue(resultB.getResponse().getContentAsString(), Map.class).get("id");

        // Create assessments for both farms with horizonDays 30
        Map<String, Object> assessRequest30A = new HashMap<>();
        assessRequest30A.put("farmId", farmAId);
        assessRequest30A.put("cropId", cropId);
        assessRequest30A.put("horizonDays", 30);

        MvcResult assessResult30A = mockMvc.perform(post("/api/assessments")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assessRequest30A)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> assess30A = objectMapper.readValue(assessResult30A.getResponse().getContentAsString(), Map.class);

        Map<String, Object> assessRequest30B = new HashMap<>();
        assessRequest30B.put("farmId", farmBId);
        assessRequest30B.put("cropId", cropId);
        assessRequest30B.put("horizonDays", 30);

        MvcResult assessResult30B = mockMvc.perform(post("/api/assessments")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assessRequest30B)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> assess30B = objectMapper.readValue(assessResult30B.getResponse().getContentAsString(), Map.class);

        double supplyA30 = ((Number) assess30A.get("supplyLitres")).doubleValue();
        double supplyB30 = ((Number) assess30B.get("supplyLitres")).doubleValue();
        double delta30 = supplyB30 - supplyA30;
        assertEquals(45000.0, delta30, 0.01, "Delta for horizon 30 should be 45000");

        // Create assessments for both farms with horizonDays 60
        Map<String, Object> assessRequest60A = new HashMap<>();
        assessRequest60A.put("farmId", farmAId);
        assessRequest60A.put("cropId", cropId);
        assessRequest60A.put("horizonDays", 60);

        MvcResult assessResult60A = mockMvc.perform(post("/api/assessments")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assessRequest60A)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> assess60A = objectMapper.readValue(assessResult60A.getResponse().getContentAsString(), Map.class);

        Map<String, Object> assessRequest60B = new HashMap<>();
        assessRequest60B.put("farmId", farmBId);
        assessRequest60B.put("cropId", cropId);
        assessRequest60B.put("horizonDays", 60);

        MvcResult assessResult60B = mockMvc.perform(post("/api/assessments")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assessRequest60B)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> assess60B = objectMapper.readValue(assessResult60B.getResponse().getContentAsString(), Map.class);

        double supplyA60 = ((Number) assess60A.get("supplyLitres")).doubleValue();
        double supplyB60 = ((Number) assess60B.get("supplyLitres")).doubleValue();
        double delta60 = supplyB60 - supplyA60;
        assertEquals(90000.0, delta60, 0.01, "Delta for horizon 60 should be 90000");
    }

    @Test
    void totalsStillWork() throws Exception {
        // Farm A: no stored or groundwater water of any kind
        Map<String, Object> requestA = new HashMap<>();
        requestA.put("name", "Farm A");
        requestA.put("lat", 12.9716);
        requestA.put("lon", 77.5946);
        requestA.put("areaHa", 2.5);
        requestA.put("soilType", "Loam");
        requestA.put("storedWaterLitres", 0.0);
        requestA.put("groundwaterLitres", 0.0);
        requestA.put("storedWaterLitresPerDay", 0.0);
        requestA.put("groundwaterLitresPerDay", 0.0);

        MvcResult resultA = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestA)))
                .andExpect(status().isCreated())
                .andReturn();
        String farmAId = (String) objectMapper.readValue(resultA.getResponse().getContentAsString(), Map.class).get("id");

        // Farm C: identical to A plus groundwaterLitres 45000 (no per-day fields)
        Map<String, Object> requestC = new HashMap<>();
        requestC.put("name", "Farm C");
        requestC.put("lat", 12.9716);
        requestC.put("lon", 77.5946);
        requestC.put("areaHa", 2.5);
        requestC.put("soilType", "Loam");
        requestC.put("storedWaterLitres", 0.0);
        requestC.put("groundwaterLitres", 45000.0);
        requestC.put("storedWaterLitresPerDay", 0.0);
        requestC.put("groundwaterLitresPerDay", 0.0);

        MvcResult resultC = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestC)))
                .andExpect(status().isCreated())
                .andReturn();
        String farmCId = (String) objectMapper.readValue(resultC.getResponse().getContentAsString(), Map.class).get("id");

        // Create assessments for both farms with horizonDays 30
        Map<String, Object> assessRequest30A = new HashMap<>();
        assessRequest30A.put("farmId", farmAId);
        assessRequest30A.put("cropId", cropId);
        assessRequest30A.put("horizonDays", 30);

        MvcResult assessResult30A = mockMvc.perform(post("/api/assessments")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assessRequest30A)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> assess30A = objectMapper.readValue(assessResult30A.getResponse().getContentAsString(), Map.class);

        Map<String, Object> assessRequest30C = new HashMap<>();
        assessRequest30C.put("farmId", farmCId);
        assessRequest30C.put("cropId", cropId);
        assessRequest30C.put("horizonDays", 30);

        MvcResult assessResult30C = mockMvc.perform(post("/api/assessments")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assessRequest30C)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> assess30C = objectMapper.readValue(assessResult30C.getResponse().getContentAsString(), Map.class);

        double supplyA30 = ((Number) assess30A.get("supplyLitres")).doubleValue();
        double supplyC30 = ((Number) assess30C.get("supplyLitres")).doubleValue();
        double delta30 = supplyC30 - supplyA30;
        assertEquals(45000.0, delta30, 0.01, "Delta for horizon 30 should be 45000");
    }
}