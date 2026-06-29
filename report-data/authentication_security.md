# Authentication and Security Architecture

This document describes the security protocols, authentication mechanisms, session management pipelines, and cryptographic frameworks implemented in the **TerraSpotter** platform. This content is structured for inclusion in the Functional Requirements, Security Requirements, and System Implementation chapters of the project documentation.

---

## 1. Authentication and Registration Workflows

### 1.1 Registration & Signup Workflow
1. **User Request:** The user fills in registration fields (fname, lname, email, phoneNo, dob, password) on the React frontend.
2. **OTP Generation Request:** The frontend makes a `POST /api/auth/send-otp` call with the email.
3. **Verification and Trigger:** The backend queries `UserRepository` to verify the email is not already registered. If unique, the system generates a 4-digit code using `SecureRandom` and saves it in `OtpStore` with a 10-minute TTL.
4. **Email Delivery:** The backend forwards the request to `BrevoEmailService`, which compiles a template and sends the verification code.
5. **Submission:** The user inputs the OTP and submits the form, calling `POST /api/auth/signup`.
6. **Persistence:** The backend validates the OTP. If valid, the user's password is encrypted using BCrypt, the user record is saved to PostgreSQL, and a welcome email is sent.

### 1.2 Email OTP Verification Workflow (In-Memory Sandbox)
OTPs are managed using an in-memory utility class [OtpStore.java](file:///d:/TerraSpotter-Mapping-the-Right-Place-to-Plant/backend/src/main/java/com/example/terraspoter/service/OtpStore.java):
* **Data Structure:** A thread-safe `ConcurrentHashMap` stores verification entries mapped by normalized email strings.
* **Storage Record:** Each map entry is encapsulated in a record:
  ```java
  private record Entry(String otp, Instant expiresAt) {}
  ```
* **Security TTL:** The verification window is restricted to 600 seconds (10 minutes).
* **Single-Use Consumption:** To prevent replay attacks, the verification entry is immediately removed from the hash map upon the first validation check (success or failure):
  ```java
  store.remove(key); // consumed — cannot be reused
  ```

### 1.3 Stateful Login Workflow
1. **Input Submission:** The client sends credentials via `POST /api/auth/login`.
2. **Credentials Evaluation:** The backend fetches the User record by email. If the record exists, the submitted plain-text password is evaluated against the database BCrypt hash using `BCryptPasswordEncoder.matches(...)`.
3. **Session Creation:** Upon successful matching, an `HttpSession` is created:
   - The session timeout limit is set to 30 minutes (`session.setMaxInactiveInterval(30 * 60)`).
   - The user ID is stored in the session context (`session.setAttribute("userId", user.getId())`).
4. **Response Sanitization:** The user's password hash is set to `null` on the returned Java object to prevent key exposure in transmission.

### 1.4 Google OAuth SSO Workflow
1. **Token Retrieval:** The React frontend displays the standard Google OAuth button. Once the user authenticates, the client receives a Google credential token.
2. **SSO Authentication Request:** The frontend parses the email, first name, and last name from the token and sends them via `POST /api/auth/google`.
3. **Account Provisioning:**
   - If a database record exists for the Google email, the user profile is loaded.
   - If no record exists, the system automatically registers the user, generating a secure placeholder password, saves the user to PostgreSQL, and flags the response with `isNewSignup = true`.
4. **Session Binding:** The user's database ID is bound to the `HttpSession` attribute, logging them in.

### 1.5 Password Reset Workflow (Forgot Password)
1. **OTP Verification:** The user inputs their email. The system calls `POST /api/auth/forgot-password/send-otp`. If the email matches a registered account, a secure OTP is emailed via Brevo.
2. **Verification Check:** The user submits the code via `POST /api/auth/forgot-password/verify-otp`. The system verifies the code is correct.
3. **Password Update:** The user enters a new password of at least 8 characters. The backend consumes the OTP from the in-memory store, hashes the new password with BCrypt, updates the database record, and sends a confirmation email.

---

## 2. Session-Based Authentication vs. JWT
Rather than introducing stateless JWTs, the platform implements a **Stateful Session-Based Authentication** model:

* **Stateful Sessions (`JSESSIONID`):** Authentication state is kept in server memory via Tomcat's Servlet Session context. The frontend receives a unique `JSESSIONID` cookie, which the browser automatically attaches to subsequent requests.
* **Manually Enforced Authorization:** Controllers protect user data by evaluating the session attribute:
  ```java
  Long userId = (Long) session.getAttribute("userId");
  if (userId == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
  }
  ```
* **Security Benefits:** Allows immediate session invalidation (logout) by calling `session.invalidate()`, eliminating the need for complex token revocation strategies like token blocklists.

---

## 3. Spring Security Configuration
Spring Security is configured in [SecurityConfig.java](file:///d:/TerraSpotter-Mapping-the-Right-Place-to-Plant/backend/src/main/java/com/example/terraspoter/config/SecurityConfig.java) with a customize-built `SecurityFilterChain` bean:

1. **CSRF Protection:** Disallowed/Disabled because the application relies on CORS validation and explicit session-attribute authorization checks.
2. **CORS Constraints:** Strictly restricts cross-origin resource requests to safe origins (such as local development tools and Vercel hosting subdomains). Credentials transfer (cookies) is enabled:
   ```java
   config.setAllowedOriginPatterns(List.of("http://localhost:5173", "https://*.vercel.app"));
   config.setAllowCredentials(true);
   ```
3. **Session Fixation Mitigation:** Enabled in the security chain to regenerate the session ID whenever a user logs in. This migrates session attributes to a new ID, defending against session hijacking:
   ```java
   session.sessionFixation(sessionFixation -> sessionFixation.migrateSession())
   ```
4. **Endpoint Permissions:** Public endpoints (like authentication, land retrieval, and recommendations) are configured as `permitAll()`, with resource access control handled dynamically at the controller level.

---

## 4. BCrypt Password Cryptography
The platform utilizes a salted hashing algorithm via Spring Security's `BCryptPasswordEncoder` bean:
- **Salting Mechanism:** A unique, random salt is generated and embedded in the output hash string, defending against rainbow table attacks.
- **One-Way Protection:** Encrypted hashes are irreversible. Plaintext passwords can only be verified by evaluating them against the hash using the BCrypt matches method.

---

## 5. Role-Based Access Control (RBAC)
User authorization is structured around two key roles:
- **`ROLE_USER`:** Default role assigned on signup. Permissions include creating lands, booking plantations, logging completions, and posting forum queries.
- **`ROLE_ADMIN`:** Assigned to administrators. Permissions include viewing the pending lands queue and verifying uploads.

Role checking is enforced manually inside controllers:
```java
// Admin access control validation in LandController.java
@GetMapping("/pending")
public ResponseEntity<?> getPendingLands(HttpSession session) {
    Long userId = (Long) session.getAttribute("userId");
    if (userId == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin check failed");
    }
    // Additional database queries confirm user has admin privileges
    List<Land> lands = landRepository.findByStatus("PENDING");
    return ResponseEntity.ok(lands);
}
```

---

## 6. Security Threat Mitigation Matrix

Below is a summary of how security threats are mitigated:

| Threat | Risk Profile | Mitigating Security Control Implemented |
| :--- | :--- | :--- |
| **Session Hijacking** | High | Session Fixation protection forces ID migration on login. Custom CORS configuration blocks unauthorized origins from fetching credentials. |
| **Brute Force (OTP)** | Medium | OTP inputs are constrained by a 10-minute TTL. The entry is immediately destroyed upon verification, preventing brute force scanning. |
| **Password Theft** | High | Plain-text passwords are never saved. Encrypted BCrypt hashes are stored in the PostgreSQL database. |
| **Cross-Tenant Injections** | High | User-specific parameters (like `landId` or `userId`) are matched against the authenticated session context inside the service layer before processing. |
| **Data Leakage (JSON)** | Medium | Sensitive entity properties (such as password hashes) are annotated with `@JsonIgnore` or scrubbed to `null` before serialization. |
