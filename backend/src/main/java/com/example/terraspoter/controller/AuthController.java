package com.example.terraspoter.controller;

import com.example.terraspoter.model.User;
import com.example.terraspoter.payload.SignupRequest;
import com.example.terraspoter.payload.LoginRequest;
import com.example.terraspoter.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Collections;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Signup endpoint
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (authService.findUserByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        User newUser = new User();
        newUser.setFname(request.getFname());
        newUser.setLname(request.getLname());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNo(request.getPhoneNo());

        try {
            newUser.setDob(LocalDate.parse(request.getDob()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid DOB format. Use yyyy-MM-dd");
        }

        newUser.setPassword(request.getPassword()); // Will be hashed in service
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
        if (!authService.checkPassword(user, request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials!");
        }

        return ResponseEntity.ok("Login successful!");
    }

    // Google login/signup endpoint
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody String token) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JacksonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList("YOUR_GOOGLE_CLIENT_ID"))
                    .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String fname = (String) payload.get("given_name");
                String lname = (String) payload.get("family_name");

                Optional<User> userOpt = authService.findUserByEmail(email);
                User user;
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                } else {
                    user = new User();
                    user.setEmail(email);
                    user.setFname(fname);
                    user.setLname(lname);
                    user.setPassword(authService.generateRandomPassword());
                    authService.saveUser(user);
                }

                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Google login failed: " + e.getMessage());
        }
    }
}
