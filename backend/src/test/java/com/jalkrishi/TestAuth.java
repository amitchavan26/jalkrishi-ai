package com.jalkrishi;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public class TestAuth {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    public TestAuth(MockMvc mockMvc, ObjectMapper objectMapper) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
    }

    public String registerAndGetToken(String name, String email, String password) throws Exception {
        Map<String, String> registerRequest = Map.of(
                "name", name,
                "email", email,
                "password", password
        );

        MvcResult registerResult = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andReturn();

        if (registerResult.getResponse().getStatus() != 201) {
            throw new RuntimeException("Registration failed: " + registerResult.getResponse().getContentAsString());
        }

        Map<String, String> loginRequest = Map.of(
                "email", email,
                "password", password
        );

        MvcResult loginResult = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        if (loginResult.getResponse().getStatus() != 200) {
            throw new RuntimeException("Login failed: " + loginResult.getResponse().getContentAsString());
        }

        String responseBody = loginResult.getResponse().getContentAsString();
        Map<String, String> responseMap = objectMapper.readValue(responseBody, Map.class);
        return responseMap.get("token");
    }
}