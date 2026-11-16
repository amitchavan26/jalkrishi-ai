package com.jalkrishi.auth;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private final String secret = "super-secret-key-that-is-at-least-32-bytes-long!";
    private final long expiryMinutes = 120;

    @Test
    public void generateThenValid() {
        JwtService jwtService = new JwtService(secret, expiryMinutes);
        String token = jwtService.generate("user123", "test@example.com");
        assertNotNull(token);
        assertTrue(jwtService.isValid(token));
    }

    @Test
    public void userIdRoundTrip() {
        JwtService jwtService = new JwtService(secret, expiryMinutes);
        String token = jwtService.generate("user123", "test@example.com");
        assertEquals("user123", jwtService.userId(token));
    }

    @Test
    public void tamperedTokenInvalid() {
        JwtService jwtService = new JwtService(secret, expiryMinutes);
        String token = jwtService.generate("user123", "test@example.com");
        String tamperedToken = token + "xyz";
        assertFalse(jwtService.isValid(tamperedToken));
        assertNull(jwtService.userId(tamperedToken));
    }

    @Test
    public void tokenWithExpiryMinutesMinusOneInvalid() {
        JwtService jwtService = new JwtService(secret, -1);
        String token = jwtService.generate("user123", "test@example.com");
        assertFalse(jwtService.isValid(token));
    }
}