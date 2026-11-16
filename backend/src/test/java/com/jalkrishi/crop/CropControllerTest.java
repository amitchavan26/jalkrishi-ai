package com.jalkrishi.crop;

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
public class CropControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserRepository userRepository;

    private TestAuth testAuth;
    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        testAuth = new TestAuth(mockMvc, objectMapper);
        userToken = testAuth.registerAndGetToken("Test User", "test@example.com", "password123");
    }

    @Test
    void listReturns200WithAtLeast8Crops() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/crops")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        List<Map<String, Object>> crops = objectMapper.readValue(responseBody, List.class);
        assertTrue(crops.size() >= 8, "Expected at least 8 crops, got " + crops.size());
    }

    @Test
    void everyStageHasValidDaysAndKc() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/crops")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        List<Map<String, Object>> crops = objectMapper.readValue(responseBody, List.class);

        for (Map<String, Object> crop : crops) {
            List<Map<String, Object>> stages = (List<Map<String, Object>>) crop.get("stages");
            assertNotNull(stages);
            assertEquals(4, stages.size(), "Each crop should have exactly 4 stages");
            
            for (Map<String, Object> stage : stages) {
                Integer days = (Integer) stage.get("days");
                Double kc = (Double) stage.get("kc");
                assertNotNull(days, "Stage days must not be null");
                assertNotNull(kc, "Stage kc must not be null");
                assertTrue(days > 0, "Stage days must be > 0, got " + days);
                assertTrue(kc >= 0.1 && kc <= 1.5, "Stage kc must be between 0.1 and 1.5, got " + kc);
            }
        }
    }

    @Test
    void seederDoesNotCreateDuplicatesOnSecondCall() throws Exception {
        // First call
        MvcResult result1 = mockMvc.perform(get("/api/crops")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();
        String responseBody1 = result1.getResponse().getContentAsString();
        List<Map<String, Object>> crops1 = objectMapper.readValue(responseBody1, List.class);
        int firstCount = crops1.size();

        // Second call
        MvcResult result2 = mockMvc.perform(get("/api/crops")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();
        String responseBody2 = result2.getResponse().getContentAsString();
        List<Map<String, Object>> crops2 = objectMapper.readValue(responseBody2, List.class);
        int secondCount = crops2.size();

        assertEquals(firstCount, secondCount, "Crop count should not change on second call");
        assertEquals(8, firstCount, "Expected exactly 8 crops");
    }

    @Test
    void noTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/crops"))
                .andExpect(status().isUnauthorized());
    }
}