package com.healthlink.backend.controller;

import com.healthlink.backend.security.JwtUtil;
import com.healthlink.backend.security.LoginRateLimiter;
import com.healthlink.backend.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LoginRateLimiter rateLimiter;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private AuditService auditService;

    @Value("${COOKIE_SECURE:false}")
    private boolean cookieSecure;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> credentials,
            HttpServletRequest request) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String ip = getClientIp(request);

        if (rateLimiter.isBlocked(email)) {
            auditService.log(email, "LOGIN_BLOCKED", "Blocked due to too many failed attempts", ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many login attempts. Try again in 15 minutes."));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            rateLimiter.recordSuccess(email);

            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse("PATIENT");

            String accessToken = jwtUtil.generateToken(userDetails.getUsername(), role);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails.getUsername());

            auditService.log(email, "LOGIN_SUCCESS", "Logged in as " + role, ip);

            ResponseCookie refreshCookie = buildRefreshCookie(refreshToken, Duration.ofDays(7));

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(Map.of(
                            "token", accessToken,
                            "email", userDetails.getUsername(),
                            "role", role
                    ));
        } catch (BadCredentialsException ex) {
            rateLimiter.recordFailure(email);
            auditService.log(email, "LOGIN_FAILURE", "Invalid credentials", ip);
            throw ex;
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletRequest request) {
        String ip = getClientIp(request);

        if (rateLimiter.isBlocked(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many refresh attempts. Try again in 15 minutes."));
        }

        if (refreshToken == null || !jwtUtil.isTokenValid(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            rateLimiter.recordFailure(ip);
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        rateLimiter.recordSuccess(ip);

        String email = jwtUtil.extractEmail(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("PATIENT");

        String newAccessToken = jwtUtil.generateToken(email, role);

        return ResponseEntity.ok(Map.of(
                "token", newAccessToken,
                "email", email,
                "role", role
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        
        ResponseCookie deleteCookie = buildRefreshCookie("", Duration.ZERO);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    private ResponseCookie buildRefreshCookie(String value, Duration maxAge) {
        return ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(maxAge)
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}