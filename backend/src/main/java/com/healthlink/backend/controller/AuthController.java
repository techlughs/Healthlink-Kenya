package com.healthlink.backend.controller;

import com.healthlink.backend.security.JwtUtil;
import com.healthlink.backend.security.LoginRateLimiter;
import com.healthlink.backend.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
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

            return ResponseEntity.ok(Map.of(
                    "token", accessToken,
                    "refreshToken", refreshToken,
                    "email", userDetails.getUsername(),
                    "role", role
            ));
        } catch (BadCredentialsException ex) {
            rateLimiter.recordFailure(email);
            auditService.log(email, "LOGIN_FAILURE", "Invalid credentials", ip);
            throw ex; // handled by GlobalExceptionHandler
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");

        if (refreshToken == null || !jwtUtil.isTokenValid(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

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

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}