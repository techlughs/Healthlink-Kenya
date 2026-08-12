package com.healthlink.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginRateLimiterTest {

    private LoginRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new LoginRateLimiter();
    }

    @Test
    void notBlockedInitially() {
        assertFalse(rateLimiter.isBlocked("mary@healthlink.com"));
    }

    @Test
    void blocksAfterFiveFailures() {
        String email = "mary@healthlink.com";
        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailure(email);
        }
        assertTrue(rateLimiter.isBlocked(email));
    }

    @Test
    void notBlockedAfterFourFailures() {
        String email = "mary@healthlink.com";
        for (int i = 0; i < 4; i++) {
            rateLimiter.recordFailure(email);
        }
        assertFalse(rateLimiter.isBlocked(email));
    }

    @Test
    void successResetsFailureCount() {
        String email = "mary@healthlink.com";
        for (int i = 0; i < 4; i++) {
            rateLimiter.recordFailure(email);
        }
        rateLimiter.recordSuccess(email);
        assertFalse(rateLimiter.isBlocked(email));

        rateLimiter.recordFailure(email);
        assertFalse(rateLimiter.isBlocked(email)); // only 1 failure since reset
    }

    @Test
    void emailIsCaseInsensitive() {
        rateLimiter.recordFailure("Mary@HealthLink.com");
        assertTrue(rateLimiter.isBlocked("mary@healthlink.com") ||
                   !rateLimiter.isBlocked("mary@healthlink.com")); // sanity: no crash across case
        for (int i = 0; i < 4; i++) {
            rateLimiter.recordFailure("MARY@healthlink.com");
        }
        assertTrue(rateLimiter.isBlocked("mary@healthlink.com"));
    }
}