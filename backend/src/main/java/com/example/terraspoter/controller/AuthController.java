package com.example.terraspoter.controller;

import com.example.terraspoter.model.User;
import com.example.terraspoter.payload.SignupRequest;
import com.example.terraspoter.payload.LoginRequest;
import com.example.terraspoter.service.AuthService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ================== SIGNUP ==================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {

        if (authService.findUserByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        User user = new User();
        user.setFname(request.getFname());
        user.setLname(request.getLname());
        user.setEmail(request.getEmail());
        user.setPhoneNo(request.getPhoneNo());

        try {
            user.setDob(LocalDate.parse(request.getDob()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Invalid DOB format (yyyy-MM-dd)");
        }

        // password will be hashed in service
        user.setPassword(request.getPassword());

        authService.saveUser(user);

        return ResponseEntity.ok("Signup successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpSession session) {

        Optional<User> userOpt =
                authService.findUserByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        User user = userOpt.get(); // ✅ FIX

        boolean match = authService.checkPassword(
                request.getPassword(),
                user.getPassword()
        );

        System.out.println("PASSWORD MATCH: " + match);

        if (!match) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        // ✅ SET SESSION ONLY AFTER SUCCESS
        session.setMaxInactiveInterval(30 * 60);
        session.setAttribute("userId", user.getId());

        // 🔥 DEBUG
        System.out.println("SESSION ID AFTER SET: " + session.getId());
        System.out.println("SESSION USER SET: " + session.getAttribute("userId"));

        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    // ================== SESSION ==================
    @GetMapping("/session")
    public ResponseEntity<?> getSession(HttpSession session) {

        System.out.println("SESSION OBJECT: " + session);
        System.out.println("SESSION ID: " + session.getId());
        System.out.println("SESSION userId: " + session.getAttribute("userId"));

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("No active session");
        }

        Optional<User> userOpt = authService.findUserById(userId);

        return userOpt
                .<ResponseEntity<?>>map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found"));
    }
    // ================== LOGOUT ==================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    // ================== GOOGLE LOGIN ==================
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(
            @RequestBody Map<String, String> data,
            HttpSession session) {

        try {
            String email = data.get("email");

            Optional<User> userOpt =
                    authService.findUserByEmail(email);

            User user;

            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                user = new User();
                user.setEmail(email);
                user.setFname(data.get("fname"));
                user.setLname(data.get("lname"));
                user.setPassword(authService.generateRandomPassword());
                authService.saveUser(user);
            }

            // 🔥 IMPORTANT: set session here too
            session.setAttribute("userId", user.getId());

            user.setPassword(null);

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Google login failed");
        }
    }
}