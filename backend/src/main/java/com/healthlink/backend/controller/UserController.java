package com.healthlink.backend.controller;

import com.healthlink.backend.model.User;
import com.healthlink.backend.service.UserService;
import com.healthlink.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    public UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody User user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> {
                    if (!user.getEmail().equals(SecurityUtils.getCurrentEmail())) {
                        throw new AccessDeniedException("Not authorized");
                    }
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        if (!email.equals(SecurityUtils.getCurrentEmail())) {
            throw new AccessDeniedException("Not authorized");
        }
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @Valid @RequestBody User user) {
        User existing = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!existing.getEmail().equals(SecurityUtils.getCurrentEmail())) {
            throw new AccessDeniedException("Not authorized");
        }
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        User existing = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!existing.getEmail().equals(SecurityUtils.getCurrentEmail())) {
            throw new AccessDeniedException("Not authorized");
        }
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}