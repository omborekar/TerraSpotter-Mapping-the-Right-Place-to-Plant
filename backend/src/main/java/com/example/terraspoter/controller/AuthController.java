package com.example.terraspoter.controller;

import com.example.terraspoter.model.User;
import com.example.terraspoter.payload.LoginRequest;
import com.example.terraspoter.payload.SignupRequest;
import com.example.terraspoter.service.AuthService;
import com.example.terraspoter.service.BrevoEmailService;
import com.example.terraspoter.service.OtpStore;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${ML_API_URL}")
    private String mlApiBaseUrl;

    private final AuthService      authService;
    private final OtpStore         otpStore;
    private final BrevoEmailService emailService;

    private final SecureRandom rng = new SecureRandom();

    public AuthController(AuthService authService,
                          OtpStore otpStore,
                          BrevoEmailService emailService) {
        this.authService  = authService;
        this.otpStore     = otpStore;
        this.emailService = emailService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/auth/  — health check + ML warmup (unchanged)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/")
    public String home() {
        new Thread(() -> {
            try {
                String warmUrl = mlApiBaseUrl + "/predict"
                        + "?temp=25&rainfall=500&soil=clay&climate=tropical";
                new RestTemplate().getForObject(warmUrl, String.class);
            } catch (Exception e) {
                System.out.println("ML warmup failed: " + e.getMessage());
            }
        }).start();
        return "TerraSpotter Backend Running 🚀";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/send-otp
    // Step 1 of signup: validate email uniqueness then email a 4-digit OTP.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required."));
        }
        email = email.toLowerCase().trim();

        // Block if email already registered
        if (authService.findUserByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this email already exists."));
        }

        // 4-digit OTP: 1000–9999 (always exactly 4 digits)
        String otp = String.format("%04d", 1000 + rng.nextInt(9000));
        otpStore.save(email, otp);

        String firstName = body.getOrDefault("fname", "there");

        try {
            emailService.sendOtpEmail(email, firstName, otp);
            System.out.println("[OTP] Sent to " + email);
        } catch (Exception e) {
            System.err.println("[OTP] Email send failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message",
                            "Could not send verification email. Please try again."));
        }

        return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/signup
    // Step 2: validate OTP → create user → send welcome email.
    // SignupRequest now needs an `otp` field (see note below).
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {

        // 1. Validate OTP first
        String otp = request.getOtp();
        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Verification code is required."));
        }

        boolean validOtp = otpStore.validate(
                request.getEmail().toLowerCase().trim(), otp.trim());

        if (!validOtp) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("message",
                            "Invalid or expired code. Please request a new OTP."));
        }

        // 2. Guard against duplicate email (race condition)
        if (authService.findUserByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User already exists."));
        }

        // 3. Build and save user (unchanged from your original code)
        User user = new User();
        user.setFname(request.getFname());
        user.setLname(request.getLname());
        user.setEmail(request.getEmail());
        user.setPhoneNo(request.getPhoneNo());

        try {
            user.setDob(LocalDate.parse(request.getDob()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid DOB format. Use yyyy-MM-dd."));
        }

        user.setPassword(request.getPassword()); // hashed inside authService.saveUser
        authService.saveUser(user);

        // 4. Send welcome email (failure must NOT break signup)
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFname());
        } catch (Exception e) {
            System.err.println("[Welcome] Email failed for "
                    + user.getEmail() + ": " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Signup successful"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/login  (unchanged)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpSession session) {

        Optional<User> userOpt = authService.findUserByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        User user = userOpt.get();

        boolean match = authService.checkPassword(
                request.getPassword(), user.getPassword());

        System.out.println("PASSWORD MATCH: " + match);

        if (!match) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        session.setMaxInactiveInterval(30 * 60);
        session.setAttribute("userId", user.getId());

        System.out.println("SESSION ID AFTER SET: " + session.getId());
        System.out.println("SESSION USER SET: " + session.getAttribute("userId"));

        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/auth/session  (unchanged)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/session")
    public ResponseEntity<?> getSession(HttpSession session) {
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

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/logout  (unchanged)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/google  (unchanged)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(
            @RequestBody Map<String, String> data,
            HttpSession session) {

        try {
            String email = data.get("email");
            Optional<User> userOpt = authService.findUserByEmail(email);

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

                // Send welcome email for new Google sign-ups too
                try {
                    emailService.sendWelcomeEmail(user.getEmail(), user.getFname());
                } catch (Exception e) {
                    System.err.println("[Welcome/Google] " + e.getMessage());
                }
            }

            session.setAttribute("userId", user.getId());
            user.setPassword(null);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Google login failed");
        }
    }
}