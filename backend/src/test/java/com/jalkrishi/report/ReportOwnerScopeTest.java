package com.jalkrishi.report;

import com.jalkrishi.TestAuth;
import com.jalkrishi.assessment.Assessment;
import com.jalkrishi.assessment.AssessmentRepository;
import com.jalkrishi.assessment.Confidence;
import com.jalkrishi.assessment.WeatherSnapshot;
import com.jalkrishi.crop.Crop;
import com.jalkrishi.crop.CropRepository;
import com.jalkrishi.engine.Suitability;
import com.jalkrishi.engine.Stress;
import com.jalkrishi.farm.Farm;
import com.jalkrishi.farm.FarmRepository;
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
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReportOwnerScopeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserRepository userRepository;

    private TestAuth testAuth;
    private String user1Token;
    private String user2Token;
    private String user1Id;
    private String user2Id;
    private String cropId;

    @BeforeEach
    void setUp() throws Exception {
        assessmentRepository.deleteAll();
        farmRepository.deleteAll();
        userRepository.deleteAll();

        testAuth = new TestAuth(mockMvc, objectMapper);

        user1Token = testAuth.registerAndGetToken("User One", "user1@example.com", "password123");
        user2Token = testAuth.registerAndGetToken("User Two", "user2@example.com", "password123");

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

        // Get a valid crop ID
        List<Crop> crops = cropRepository.findAll();
        assertFalse(crops.isEmpty());
        cropId = crops.get(0).getId();
    }

    @Test
    void reportIsNotReturnedWhenTheFarmBelongsToAnotherUser() throws Exception {
        // User 2 creates a farm
        Map<String, Object> farmRequest = Map.of(
                "name", "User2 Farm",
                "lat", 12.9716,
                "lon", 77.5946,
                "areaHa", 2.5,
                "soilType", "Loam",
                "storedWaterLitres", 10000.0,
                "groundwaterLitres", 50000.0
        );
        MvcResult farmResult = mockMvc.perform(post("/api/farms")
                .header("Authorization", "Bearer " + user2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(farmRequest)))
                .andExpect(status().isCreated())
                .andReturn();
        Map<String, Object> farmMap = objectMapper.readValue(farmResult.getResponse().getContentAsString(), Map.class);
        String farmId = (String) farmMap.get("id");

        // Save an Assessment directly with AssessmentRepository for user 1
        // (ownerId = user 1's id, farmId = user 2's farm id)
        Assessment assessment = new Assessment(
                user1Id,
                farmId,
                cropId,
                30,
                1000.0,
                2000.0,
                -1000.0,
                0.5,
                Suitability.RISKY,
                Stress.MODERATE,
                Confidence.HIGH,
                "Test advice",
                false,
                null,
                new WeatherSnapshot(32.0, 21.0, 15.0, 1.5, "FALLBACK")
        );
        assessment = assessmentRepository.save(assessment);
        String assessmentId = assessment.getId();

        // GET /api/reports/{that assessment id} with user 1's token returns 404
        mockMvc.perform(get("/api/reports/" + assessmentId)
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isNotFound());
    }
}