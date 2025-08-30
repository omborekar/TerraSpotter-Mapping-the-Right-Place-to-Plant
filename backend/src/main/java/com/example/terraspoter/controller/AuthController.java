package com.example.terraspoter.controller;

import com.example.terraspoter.model.User;
import com.example.terraspoter.payload.SignupRequest;
import com.example.terraspoter.payload.LoginRequest;
import com.example.terraspoter.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Signup endpoint
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        // Check if user exists
        if (authService.findUserByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        // Create new user and save (password will be hashed in service)
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(request.getPassword());
        newUser.setName(request.getName());

        authService.saveUser(newUser);

        return ResponseEntity.ok("Signup successful");
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> foundUser = authService.findUserByEmail(request.getEmail());

        if (foundUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials!");
        }

        User user = foundUser.get();
        // Validate hashed password
        if (!authService.checkPassword(user, request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials!");
        }

        return ResponseEntity.ok("Login successful!");
    }
}
