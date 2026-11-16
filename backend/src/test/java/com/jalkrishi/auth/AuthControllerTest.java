package com.jalkrishi.auth;

import com.jalkrishi.user.UserRepository;
import com.jalkrishi.TestAuth;
import java.util.Map;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.jalkrishi.BackendApplication.class)
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private TestAuth testAuth;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        testAuth = new TestAuth(mockMvc, objectMapper);
    }

    @Test
    public void registerSuccess() throws Exception {
        Map<String, String> request = Map.of(
                "name", "Test User",
                "email", "test@example.com",
                "password", "password123"
        );

        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<String, String> response = objectMapper.readValue(responseBody, Map.class);
        assertNotNull(response.get("id"));
        assertEquals("Test User", response.get("name"));
        assertEquals("test@example.com", response.get("email"));
    }

    @Test
    public void duplicateEmailReturns400() throws Exception {
        Map<String, String> request = Map.of(
                "name", "Test User",
                "email", "test@example.com",
                "password", "password123"
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void passwordUnder8CharsReturns400() throws Exception {
        Map<String, String> request = Map.of(
                "name", "Test User",
                "email", "test@example.com",
                "password", "short"
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void loginSuccessReturnsToken() throws Exception {
        String email = "test@example.com";
        String password = "password123";

        testAuth.registerAndGetToken("Test User", email, password);

        Map<String, String> loginRequest = Map.of(
                "email", email,
                "password", password
        );

        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<String, String> response = objectMapper.readValue(responseBody, Map.class);
        assertNotNull(response.get("token"));
    }

    @Test
    public void wrongPasswordReturns401() throws Exception {
        String email = "test@example.com";
        String password = "password123";

        testAuth.registerAndGetToken("Test User", email, password);

        Map<String, String> loginRequest = Map.of(
                "email", email,
                "password", "wrongpassword"
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void meWithTokenReturns200() throws Exception {
        String email = "test@example.com";
        String password = "password123";
        String token = testAuth.registerAndGetToken("Test User", email, password);

        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get("/api/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<String, String> response = objectMapper.readValue(responseBody, Map.class);
        assertEquals("Test User", response.get("name"));
        assertEquals(email, response.get("email"));
        assertNotNull(response.get("id"));
    }

    @Test
    public void meWithoutTokenReturns401() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}

