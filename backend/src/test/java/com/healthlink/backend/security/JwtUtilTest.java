package com.healthlink.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // Matches the Base64-encoded secret format your JwtUtil expects
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "8f3a9c2e7b1d4f6a0e5c8b2d9f1a4e7c3b6d9f2a5e8c1b4d7f0a3e6c9b2d5f8a");
    }

    @Test
    void generatedTokenIsValid() {
        String token = jwtUtil.generateToken("mary@healthlink.com", "PATIENT");
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void extractsCorrectEmailAndRole() {
        String token = jwtUtil.generateToken("miriam.njoroge@healthlink.com", "DOCTOR");
        assertEquals("miriam.njoroge@healthlink.com", jwtUtil.extractEmail(token));
        assertEquals("DOCTOR", jwtUtil.extractRole(token));
    }

    @Test
    void tamperedTokenIsInvalid() {
        String token = jwtUtil.generateToken("mary@healthlink.com", "PATIENT");
        String tampered = token.substring(0, token.length() - 5) + "xxxxx";
        assertFalse(jwtUtil.isTokenValid(tampered));
    }

    @Test
    void accessTokenIsIdentifiedCorrectly() {
        String token = jwtUtil.generateToken("mary@healthlink.com", "PATIENT");
        assertTrue(jwtUtil.isAccessToken(token));
        assertFalse(jwtUtil.isRefreshToken(token));
    }

    @Test
    void refreshTokenIsIdentifiedCorrectly() {
        String token = jwtUtil.generateRefreshToken("mary@healthlink.com");
        assertTrue(jwtUtil.isRefreshToken(token));
        assertFalse(jwtUtil.isAccessToken(token));
    }

    @Test
    void refreshTokenHasNoRoleClaim() {
        String token = jwtUtil.generateRefreshToken("mary@healthlink.com");
        assertNull(jwtUtil.extractRole(token));
    }
}