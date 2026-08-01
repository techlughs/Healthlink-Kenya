package com.healthlink.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailServiceImp userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        System.out.println("DEBUG: Method = " + request.getMethod() + " URI = " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");
        System.out.println("DEBUG: Authorization header = " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("DEBUG: No Bearer token found, skipping auth for this request");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        boolean valid = jwtUtil.isTokenValid(token);
        System.out.println("DEBUG: Token valid = " + valid);

        if (!valid) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtUtil.extractEmail(token);
        System.out.println("DEBUG: Extracted email = " + email);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            System.out.println("DEBUG: Loaded user authorities = " + userDetails.getAuthorities());

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            System.out.println("DEBUG: Authentication set successfully for " + email);
        }

        filterChain.doFilter(request, response);
    }
}