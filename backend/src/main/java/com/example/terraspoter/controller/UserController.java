package com.example.terraspoter.controller;

import com.example.terraspoter.model.User;
import com.example.terraspoter.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
        origins = "http://localhost:5173",
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

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        return ResponseEntity.ok(user);
    }

    // ================= UPDATE PROFILE =================
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            HttpSession session,
            @RequestBody Map<String, String> updates
    ) {

        User sessionUser = (User) session.getAttribute("user");

        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        // Fetch fresh copy from DB
        User user = userRepository.findByEmail(sessionUser.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("fname"))
            user.setFname(updates.get("fname"));

        if (updates.containsKey("lname"))
            user.setLname(updates.get("lname"));

        if (updates.containsKey("phoneNo"))
            user.setPhoneNo(updates.get("phoneNo"));

        User updatedUser = userRepository.save(user);

        // Update session also
        session.setAttribute("user", updatedUser);

        return ResponseEntity.ok(updatedUser);
    }
}
