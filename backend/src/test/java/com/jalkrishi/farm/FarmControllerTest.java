package com.jalkrishi.farm;

import com.jalkrishi.TestAuth;
import com.jalkrishi.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = com.jalkrishi.BackendApplication.class)
@AutoConfigureMockMvc
public class FarmControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private UserRepository userRepository;

    private TestAuth testAuth;
    private String user1Token;
    private String user2Token;
    private String user1Id;
    private String user2Id;

    @BeforeEach
    void setUp() throws Exception {
        farmRepository.deleteAll();
        userRepository.deleteAll();
        testAuth = new TestAuth(mockMvc, objectMapper);

        user1Token = testAuth.registerAndGetToken("User One", "user1@example.com", "password123");
        user2Token = testAuth.registerAndGetToken("User Two", "user2@example.com", "password123");

        // Extract user IDs from /api/auth/me
        MvcResult result1 = mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();
        Map<String, Object> user1Map = objectMapper.readValue(result1.getResponse().getContentAsString(), Map.class);
        user1Id = (String) user1Map.get("id");

        MvcResult result2 = mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isOk())
                .andReturn();
        Map<String, Object> user2Map = objectMapper.readValue(result2.getResponse().getContentAsString(), Map.class);
        user2Id = (String) user2Map.get("id");
    }

    @Test
    void createFarmReturns201() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Test Farm",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 2.5,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );

        MvcResult result = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<String, Object> response = objectMapper.readValue(responseBody, Map.class);
        assertNotNull(response.get("id"));
        assertEquals("Test Farm", response.get("name"));
        assertEquals(user1Id, response.get("ownerId"));
        assertEquals(12.9716, response.get("lat"));
        assertEquals(77.5946, response.get("lon"));
        assertEquals(2.5, response.get("areaHa"));
        assertEquals("Loam", response.get("soilType"));
        assertEquals(10000.0, response.get("storedWaterLitres"));
        assertEquals(50000.0, response.get("groundwaterLitres"));
        assertNotNull(response.get("createdAt"));
    }

    @Test
    void listShowsOnlyOwnFarms() throws Exception {
        // Create farm for user1
        Map<String, Object> request1 = Map.of(
                "name", "User1 Farm",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 2.5,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );
        MvcResult result1 = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> farm1 = objectMapper.readValue(result1.getResponse().getContentAsString(), Map.class);

        // Create farm for user2
        Map<String, Object> request2 = Map.of(
                "name", "User2 Farm",
                "lat", 13.0827,
                "lon", 80.2707,
                "areaHa", 3.0,
                "soilType", "Clay",
                "storedWaterLitres", 20000.0,
                "groundwaterLitres", 60000.0
        );
        mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());

        // List farms for user1 - should only see their own
        MvcResult listResult = mockMvc.perform(get("/api/farms")
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> farms = objectMapper.readValue(listResult.getResponse().getContentAsString(), List.class);
        assertEquals(1, farms.size());
        assertEquals("User1 Farm", farms.get(0).get("name"));
    }

    @Test
    void getOwnFarmReturns200() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "My Farm",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 2.5,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );
        MvcResult createResult = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> farm = objectMapper.readValue(createResult.getResponse().getContentAsString(), Map.class);
        String farmId = (String) farm.get("id");

        MvcResult getResult = mockMvc.perform(get("/api/farms/" + farmId)
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> response = objectMapper.readValue(getResult.getResponse().getContentAsString(), Map.class);
        assertEquals(farmId, response.get("id"));
        assertEquals("My Farm", response.get("name"));
    }

    @Test
    void getAnotherUsersFarmReturns404() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "User1 Farm",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 2.5,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );
        MvcResult createResult = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> farm = objectMapper.readValue(createResult.getResponse().getContentAsString(), Map.class);
        String farmId = (String) farm.get("id");

        mockMvc.perform(get("/api/farms/" + farmId)
                .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateFarmReturns200() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Original Farm",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 2.5,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );
        MvcResult createResult = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> farm = objectMapper.readValue(createResult.getResponse().getContentAsString(), Map.class);
        String farmId = (String) farm.get("id");

        Map<String, Object> updateRequest = Map.of(
                "name", "Updated Farm",
                "lat", 13.0827,
                "lon", 80.2707,
                "areaHa", 3.0,
                "soilType", "Sandy",
                "storedWaterLitres", 20000.0,
                "groundwaterLitres", 60000.0
        );
        MvcResult updateResult = mockMvc.perform(put("/api/farms/" + farmId)
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> response = objectMapper.readValue(updateResult.getResponse().getContentAsString(), Map.class);
        assertEquals("Updated Farm", response.get("name"));
        assertEquals(13.0827, response.get("lat"));
        assertEquals(80.2707, response.get("lon"));
        assertEquals(3.0, response.get("areaHa"));
        assertEquals("Sandy", response.get("soilType"));
        assertEquals(20000.0, response.get("storedWaterLitres"));
        assertEquals(60000.0, response.get("groundwaterLitres"));
    }

    @Test
    void deleteFarmReturns204() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Farm to Delete",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 2.5,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );
        MvcResult createResult = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> farm = objectMapper.readValue(createResult.getResponse().getContentAsString(), Map.class);
        String farmId = (String) farm.get("id");

        mockMvc.perform(delete("/api/farms/" + farmId)
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isNoContent());

        // Verify it's gone
        mockMvc.perform(get("/api/farms/" + farmId)
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isNotFound());
    }

    @Test
    void areaHaZeroReturns400() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Test Farm",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 0,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );

        mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void noTokenReturns401() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Test Farm",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 2.5,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );

        mockMvc.perform(post("/api/farms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}