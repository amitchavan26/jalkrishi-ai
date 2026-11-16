package com.jalkrishi;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jalkrishi.farm.FarmRepository;
import com.jalkrishi.user.UserRepository;
import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ErrorHandlingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private UserRepository userRepository;

    private TestAuth testAuth;
    private String token;

    @BeforeEach
    void setup() throws Exception {
        farmRepository.deleteAll();
        userRepository.deleteAll();
        testAuth = new TestAuth(mockMvc, objectMapper);
        token = testAuth.registerAndGetToken("Test User", "test@example.com", "password123");
    }

    @Test
    void validationErrorHasJsonShape() throws Exception {
        String requestBody = "{\"name\":\"Test Farm\",\"lat\":10.0,\"lon\":20.0,\"areaHa\":0,\"soilType\":\"LOAM\",\"storedWaterLitres\":1000,\"groundwaterLitres\":500}";
        
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/farms")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
        
        assertTrue(responseMap.containsKey("timestamp"));
        assertTrue(responseMap.containsKey("status"));
        assertTrue(responseMap.containsKey("error"));
        assertTrue(responseMap.containsKey("message"));
        assertEquals(400, responseMap.get("status"));
    }

    @Test
    void notFoundHasJsonShape() throws Exception {
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get("/api/farms/does-not-exist")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
        
        assertTrue(responseMap.containsKey("timestamp"));
        assertTrue(responseMap.containsKey("status"));
        assertTrue(responseMap.containsKey("error"));
        assertTrue(responseMap.containsKey("message"));
        assertEquals(404, responseMap.get("status"));
    }

    @Test
    void corsPreflightAllowsConfiguredOrigin() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.options("/api/farms")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}

