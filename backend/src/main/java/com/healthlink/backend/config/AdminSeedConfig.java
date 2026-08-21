package com.healthlink.backend.config;

import com.healthlink.backend.model.User;
import com.healthlink.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeedConfig {

    @Bean
    public CommandLineRunner seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_SEED_EMAIL:}") String adminEmail,
            @Value("${ADMIN_SEED_PASSWORD:}") String adminPassword) {
        return args -> {
            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                return; 
            }
            if (userRepository.existsByEmail(adminEmail)) {
                return; 
            }

            User admin = new User();
            admin.setFullName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            userRepository.save(admin);
        };
    }
}