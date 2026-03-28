package com.example.terraspoter.controller;

import com.example.terraspoter.model.User;
import com.example.terraspoter.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
        origins = "https://terraspotter.onrender.com",
        allowCredentials = "true"
)
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ================= FETCH PROFILE =================
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        Optional<User> userOpt = userRepository.findById(userId);

        return userOpt
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found"));
    }

    // ================= UPDATE PROFILE =================
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            HttpSession session,
            @RequestBody Map<String, String> updates
    ) {

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("fname"))
            user.setFname(updates.get("fname"));

        if (updates.containsKey("lname"))
            user.setLname(updates.get("lname"));

        if (updates.containsKey("phoneNo"))
            user.setPhoneNo(updates.get("phoneNo"));

        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(updatedUser);
    }
}