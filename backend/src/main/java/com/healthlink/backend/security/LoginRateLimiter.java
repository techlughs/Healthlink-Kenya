package com.healthlink.backend.security;

import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000; // 15 minutes

    private final ConcurrentHashMap<String, Attempts> attemptsByEmail = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        Attempts a = attemptsByEmail.get(normalize(email));
        if (a == null) return false;
        if (Instant.now().toEpochMilli() - a.windowStart > WINDOW_MILLIS) {
            attemptsByEmail.remove(normalize(email));
            return false;
        }
        return a.count.get() >= MAX_ATTEMPTS;
    }

    public void recordFailure(String email) {
        attemptsByEmail.compute(normalize(email), (key, existing) -> {
            long now = Instant.now().toEpochMilli();
            if (existing == null || now - existing.windowStart > WINDOW_MILLIS) {
                return new Attempts(now);
            }
            existing.count.incrementAndGet();
            return existing;
        });
    }

    public void recordSuccess(String email) {
        attemptsByEmail.remove(normalize(email));
    }

    private String normalize(String email) {
        return email == null ? "" : email.toLowerCase();
    }

    private static class Attempts {
        final long windowStart;
        final AtomicInteger count = new AtomicInteger(1);

        Attempts(long windowStart) {
            this.windowStart = windowStart;
        }
    }
}