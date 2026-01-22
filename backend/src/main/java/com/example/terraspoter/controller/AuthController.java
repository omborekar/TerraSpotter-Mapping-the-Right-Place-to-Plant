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

        User newUser = new User();
        newUser.setFname(request.getFname());
        newUser.setLname(request.getLname());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNo(request.getPhoneNo());

        try {
            newUser.setDob(LocalDate.parse(request.getDob()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Invalid DOB format. Use yyyy-MM-dd");
        }

        newUser.setPassword(request.getPassword());
        authService.saveUser(newUser);

        return ResponseEntity.ok("Signup successful");
    }

    // ================== LOGIN ==================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpSession session) {

        Optional<User> foundUser =
                authService.findUserByEmail(request.getEmail());

        if (foundUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        User user = foundUser.get();

        if (!authService.checkPassword(user, request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        session.setAttribute("user", user);

        return ResponseEntity.ok(user);
    }

    // ================== SESSION ==================
    @GetMapping("/session")
    public ResponseEntity<?> getSession(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("No active session");
        }

        return ResponseEntity.ok(user);
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
            @RequestBody Map<String, String> data) {

        try {
            String email = data.get("email");
            String fname = data.get("fname");
            String lname = data.get("lname");

            Optional<User> userOpt =
                    authService.findUserByEmail(email);

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

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Google login failed");
        }
    }
}
