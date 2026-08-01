package com.healthlink.backend.controller;

import com.healthlink.backend.model.User;
import com.healthlink.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

@Autowired
public UserService userService;

@PostMapping("/register")
public ResponseEntity<User> registerUser(@RequestBody User user) {
    return ResponseEntity.ok(userService.registerUser(user));
}

@GetMapping("/{id}")
public ResponseEntity<User> getUserById(@PathVariable String id) {
    return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@GetMapping("/email/{email}")
public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
    return userService.getUserByEmail(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@GetMapping
public ResponseEntity<List<User>> getAllUsers() {
    return ResponseEntity.ok(userService.getAllUsers());
}

@PutMapping("/{id}")
public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
    return ResponseEntity.ok(userService.updateUser(id, user)); 
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable String id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
}
}