/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Forgot-password flow: send OTP → verify OTP → reset password.
              Uses the existing OtpStore (10-min TTL, consumed on use),
              AuthService (BCrypt hash + save), and BrevoEmailService.

 Endpoints:
   POST /api/auth/forgot-password/send-otp     { email }
   POST /api/auth/forgot-password/verify-otp   { email, otp }   ← non-consuming check
   POST /api/auth/forgot-password/reset        { email, otp, newPassword }
*/
package com.example.terraspoter.controller;

import com.example.terraspoter.model.User;
import com.example.terraspoter.service.AuthService;
import com.example.terraspoter.service.BrevoEmailService;
import com.example.terraspoter.service.OtpStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/forgot-password")
public class ForgotPasswordController {

    private final AuthService       authService;
    private final OtpStore          otpStore;
    private final BrevoEmailService emailService;
    private final SecureRandom      rng = new SecureRandom();

    // Separate namespace key prefix so forgot-password OTPs don't
    // collide with signup OTPs stored in the same OtpStore.
    private static final String PREFIX = "fp:";

    public ForgotPasswordController(AuthService authService,
                                    OtpStore otpStore,
                                    BrevoEmailService emailService) {
        this.authService  = authService;
        this.otpStore     = otpStore;
        this.emailService = emailService;
    }

    /**
     * Step 1 — send OTP.
     * Verifies the email belongs to an existing account, then sends a code.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required."));
        }
        email = email.toLowerCase().trim();

        Optional<User> userOpt = authService.findUserByEmail(email);
        if (userOpt.isEmpty()) {
            // Return 200 anyway — don't reveal whether account exists
            return ResponseEntity.ok(
                    Map.of("message", "If that email is registered, an OTP has been sent."));
        }

        String otp = String.format("%04d", 1000 + rng.nextInt(9000));
        // Store under the prefixed key so it doesn't collide with signup OTPs
        otpStore.save(PREFIX + email, otp);

        String firstName = userOpt.get().getFname();
        try {
            emailService.sendPasswordResetEmail(email, firstName != null ? firstName : "there", otp);
        } catch (Exception e) {
            System.err.println("[ForgotPw] Email send failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Could not send email. Please try again."));
        }

        return ResponseEntity.ok(Map.of("message", "If that email is registered, an OTP has been sent."));
    }

    /**
     * Step 2 — verify OTP without consuming it.
     * The OTP is consumed only during the actual reset (step 3) so that the
     * frontend can keep it in state between steps.
     *
     * We do a peek-validate here by saving the same OTP again on success
     * (effectively resetting its TTL, which is fine).
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = normalise(body.get("email"));
        String otp   = trim(body.get("otp"));

        if (email == null || otp == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email and OTP are required."));
        }

        // Validate without permanently consuming: re-save on success so it's
        // still available for the reset step.
        boolean valid = otpStore.validate(PREFIX + email, otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("message", "Invalid or expired code."));
        }
        // Re-save for the reset step (validate() consumed it)
        otpStore.save(PREFIX + email, otp);

        return ResponseEntity.ok(Map.of("message", "OTP verified."));
    }

    /**
     * Step 3 — consume OTP and set new password.
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email       = normalise(body.get("email"));
        String otp         = trim(body.get("otp"));
        String newPassword = body.get("newPassword");

        if (email == null || otp == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email, OTP, and new password are required."));
        }
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 8 characters."));
        }

        // Final, consuming OTP validation
        boolean valid = otpStore.validate(PREFIX + email, otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("message", "Invalid or expired code. Please request a new OTP."));
        }

        Optional<User> userOpt = authService.findUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Account not found."));
        }

        authService.updatePassword(userOpt.get(), newPassword);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }

    /* ── helpers ── */

    private static String normalise(String s) {
        return (s == null || s.isBlank()) ? null : s.toLowerCase().trim();
    }

    private static String trim(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}