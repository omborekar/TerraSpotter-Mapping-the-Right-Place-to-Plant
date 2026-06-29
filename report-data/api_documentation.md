# REST API Documentation

This document provides a complete overview of the REST APIs exposed by the Spring Boot backend of the **TerraSpotter** platform. All API responses are formatted in JSON.

---

## 1. Authentication APIs
Manage OTP triggers, signup registration, user logins, session verification, and Google OAuth SSO.

### 1.1 Trigger Email OTP
* **Endpoint URL:** `/api/auth/send-otp`
* **HTTP Method:** `POST`
* **Controller:** `AuthController`
* **Purpose:** Validates that the email is not already registered, then generates and emails a 4-digit verification OTP.
* **Authentication Required:** No
* **Request Body:**
  ```json
  { "email": "user@example.com", "fname": "OptionalFirstName" }
  ```
* **Response Body (200 OK):**
  ```json
  { "message": "OTP sent to user@example.com" }
  ```
* **Status Codes:**
  - `200 OK`: OTP sent successfully.
  - `400 Bad Request`: Email field missing.
  - `491 Conflict`: Email is already registered.
  - `500 Internal Server Error`: Email delivery failed.

### 1.2 Sign Up User
* **Endpoint URL:** `/api/auth/signup`
* **HTTP Method:** `POST`
* **Controller:** `AuthController`
* **Purpose:** Verifies the OTP, creates the user account in the database (with BCrypt hashing), and sends a welcome email.
* **Authentication Required:** No
* **Request Body:**
  ```json
  {
    "fname": "John",
    "lname": "Doe",
    "email": "user@example.com",
    "phoneNo": "9876543210",
    "dob": "1995-08-15",
    "password": "SecurePassword123",
    "otp": "4829"
  }
  ```
* **Response Body (200 OK):**
  ```json
  { "message": "Signup successful" }
  ```
* **Status Codes:**
  - `200 OK`: Account created successfully.
  - `400 Bad Request`: Missing inputs or invalid date format.
  - `422 Unprocessable Entity`: Invalid or expired OTP.

### 1.3 Log In User
* **Endpoint URL:** `/api/auth/login`
* **HTTP Method:** `POST`
* **Controller:** `AuthController`
* **Purpose:** Authenticates user credentials and starts an HttpSession.
* **Authentication Required:** No
* **Request Body:**
  ```json
  { "email": "user@example.com", "password": "SecurePassword123" }
  ```
* **Response Body (200 OK):** User details (excluding password)
  ```json
  {
    "id": 1,
    "fname": "John",
    "lname": "Doe",
    "email": "user@example.com",
    "phoneNo": "9876543210",
    "dob": "1995-08-15",
    "role": "ROLE_USER"
  }
  ```
* **Status Codes:**
  - `200 OK`: Successful login.
  - `401 Unauthorized`: Invalid email or password.

### 1.4 Get Active Session User
* **Endpoint URL:** `/api/auth/session`
* **HTTP Method:** `GET`
* **Controller:** `AuthController`
* **Purpose:** Verifies the user's active session and returns the current user profile.
* **Authentication Required:** Yes (via HttpSession cookie)
* **Response Body (200 OK):** User details
  ```json
  { "id": 1, "fname": "John", "lname": "Doe", "email": "user@example.com", "role": "ROLE_USER" }
  ```
* **Status Codes:**
  - `200 OK`: Session valid.
  - `401 Unauthorized`: No active session or user not found.

### 1.5 Log Out User
* **Endpoint URL:** `/api/auth/logout`
* **HTTP Method:** `POST`
* **Controller:** `AuthController`
* **Purpose:** Invalidates the current session.
* **Authentication Required:** Yes
* **Response Body (200 OK):** `"Logged out successfully"`
* **Status Codes:**
  - `200 OK`: Session invalidated.

### 1.6 Google SSO OAuth Login
* **Endpoint URL:** `/api/auth/google`
* **HTTP Method:** `POST`
* **Controller:** `AuthController`
* **Purpose:** Validates the Google OAuth token context, registers the user if new, and logs them in.
* **Authentication Required:** No
* **Request Body:**
  ```json
  { "email": "user@gmail.com", "fname": "John", "lname": "Doe" }
  ```
* **Response Body (200 OK):** User profile details with `isNewSignup` flag.
* **Status Codes:**
  - `200 OK`: Successful SSO login/registration.
  - `500 Internal Server Error`: Verification failed.

### 1.7 Forgot Password OTP Trigger
* **Endpoint URL:** `/api/auth/forgot-password/send-otp`
* **HTTP Method:** `POST`
* **Controller:** `ForgotPasswordController`
* **Purpose:** Triggers a password reset verification code if the email exists.
* **Authentication Required:** No
* **Request Body:** `{ "email": "user@example.com" }`
* **Response Body (200 OK):**
  ```json
  { "message": "If that email is registered, an OTP has been sent." }
  ```

### 1.8 Verify Forgot Password OTP
* **Endpoint URL:** `/api/auth/forgot-password/verify-otp`
* **HTTP Method:** `POST`
* **Controller:** `ForgotPasswordController`
* **Purpose:** Validates the reset code without consuming it (keeps it active for reset).
* **Request Body:** `{ "email": "user@example.com", "otp": "9218" }`
* **Status Codes:**
  - `200 OK`: OTP valid.
  - `422 Unprocessable Entity`: Invalid or expired OTP.

### 1.9 Reset Password
* **Endpoint URL:** `/api/auth/forgot-password/reset`
* **HTTP Method:** `POST`
* **Controller:** `ForgotPasswordController`
* **Purpose:** Consumes the OTP and updates the user's password.
* **Request Body:**
  ```json
  { "email": "user@example.com", "otp": "9218", "newPassword": "NewSecurePassword123" }
  ```
* **Status Codes:**
  - `200 OK`: Password reset successful.
  - `400 Bad Request`: Password constraints not met (<8 chars).
  - `422 Unprocessable Entity`: OTP invalid or expired.

---

## 2. User APIs
Retrieve and update user profiles.

### 2.1 Fetch Profile
* **Endpoint URL:** `/api/users/profile`
* **HTTP Method:** `GET`
* **Controller:** `UserController`
* **Purpose:** Fetches user details of the logged-in session user.
* **Authentication Required:** Yes

### 2.2 Update Profile
* **Endpoint URL:** `/api/users/profile`
* **HTTP Method:** `PUT`
* **Controller:** `UserController`
* **Purpose:** Modifies name and phone number details.
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  { "fname": "Johnny", "lname": "Doe", "phoneNo": "9998887776" }
  ```
* **Response Body (200 OK):** Updated User entity.

---

## 3. Land APIs
Handles mapping creation, details retrieval, and photo uploads.

### 3.1 Get All Lands
* **Endpoint URL:** `/api/lands`
* **HTTP Method:** `GET`
* **Controller:** `LandController`
* **Purpose:** Returns a list of all verified and registered land parcels.
* **Authentication Required:** No

### 3.2 Register New Land
* **Endpoint URL:** `/api/lands`
* **HTTP Method:** `POST`
* **Controller:** `LandController`
* **Purpose:** Saves a new land plot including spatial polygons, details, and centroid coordinates.
* **Authentication Required:** Yes
* **Request Body:** Mapped properties including `polygonCoords` (JSONB) and `centroid`.
* **Response Body (200 OK):** Mapped Land entity.

### 3.3 Get Land By ID
* **Endpoint URL:** `/api/lands/{id}`
* **HTTP Method:** `GET`
* **Controller:** `LandController`
* **Purpose:** Fetches a single land record, attaching active starts and completion history.
* **Authentication Required:** No

### 3.4 Upload Land Photos
* **Endpoint URL:** `/api/lands/{id}/images`
* **HTTP Method:** `POST`
* **Controller:** `LandController`
* **Purpose:** Uploads photos for a land parcel.
* **Request Parameters:** Multipart form files (`files`).
* **Response Body:** `{ "message": "Images uploaded" }`

### 3.5 Get Land Images
* **Endpoint URL:** `/api/lands/{id}/images`
* **HTTP Method:** `GET`
* **Controller:** `LandController`
* **Purpose:** Returns image records for a land parcel.

### 3.6 Get My Registered Lands
* **Endpoint URL:** `/api/lands/my`
* **HTTP Method:** `GET`
* **Controller:** `LandController`
* **Purpose:** Retrieves all land parcels uploaded by the logged-in user.
* **Authentication Required:** Yes

---

## 4. Recommendation APIs
Retrieves and updates ML tree recommendations.

### 4.1 Get Land Recommendations
* **Endpoint URL:** `/api/lands/{id}/recommendations`
* **HTTP Method:** `GET`
* **Controller:** `LandController`
* **Purpose:** Retrieves existing ML tree recommendations for a land.
* **Authentication Required:** No

### 4.2 Refresh Recommendations
* **Endpoint URL:** `/api/lands/{id}/recommendations/refresh`
* **HTTP Method:** `POST`
* **Controller:** `LandController`
* **Purpose:** Triggers the Python ML microservice to recalculate tree suitability based on coordinates and climate APIs.
* **Authentication Required:** No

---

## 5. Plantation APIs
Schedules, completes, and showcases plantation drives.

### 5.1 Start Plantation
* **Endpoint URL:** `/api/lands/{id}/plantation-start`
* **HTTP Method:** `POST`
* **Controller:** `LandController`
* **Purpose:** Starts a plantation drive on the land.
* **Request Body:** `{ "plannedDate": "2026-07-01", "teamSize": 5, "treesToPlant": 150, "method": "Manual Pit", "notes": "Community planting drive" }`
* **Authentication Required:** Yes

### 5.2 Complete Plantation
* **Endpoint URL:** `/api/lands/{id}/plantation-complete`
* **HTTP Method:** `POST`
* **Controller:** `LandController`
* **Purpose:** Concludes a plantation drive, uploading completion photos and updating total statistics.
* **Request Parameters:**
  - `treesPlanted` (Integer, Required)
  - `moreCapacity` (Integer, Optional)
  - `notes` (String, Optional)
  - `images` (Multipart files, Optional)
* **Authentication Required:** Yes

### 5.3 Global Completed Showcase
* **Endpoint URL:** `/api/plantations/completed`
* **HTTP Method:** `GET`
* **Controller:** `PlantationController`
* **Purpose:** Returns completed plantations globally for the public showcase feed.
* **Authentication Required:** Yes

### 5.4 My Completion Records
* **Endpoint URL:** `/api/plantations/completions/my`
* **HTTP Method:** `GET`
* **Controller:** `PlantationController`
* **Purpose:** Returns the logged-in user's own plantation completions.
* **Authentication Required:** Yes

---

## 6. Review APIs
Submit and retrieve feedback for lands and completed plantations.

### 6.1 Get Land Reviews
* **Endpoint URL:** `/api/lands/{id}/reviews`
* **HTTP Method:** `GET`
* **Controller:** `LandController`
* **Purpose:** Returns all land reviews for a specific land ID.

### 6.2 Submit Land Review
* **Endpoint URL:** `/api/lands/{id}/reviews`
* **HTTP Method:** `POST`
* **Controller:** `LandController`
* **Purpose:** Submits a review and rating for a piece of land.
* **Request Body:** `{ "rating": 5, "feasibilityNote": "Accessible", "permissionNote": "Permitted", "body": "Great land!" }`
* **Authentication Required:** Yes

### 6.3 Review Showcase Item
* **Endpoint URL:** `/api/plantations/{id}/review`
* **HTTP Method:** `POST`
* **Controller:** `PlantationController`
* **Purpose:** Adds a review to a completed plantation showcase item.
* **Request Parameters:** `rating` (Integer), `comment` (String).
* **Authentication Required:** Yes

---

## 7. Community APIs (Growth Tracking)
Updates and feed metrics for tree growth logs.

### 7.1 Get Growth Logs for Land
* **Endpoint URL:** `/api/lands/{id}/growth-updates`
* **HTTP Method:** `GET`
* **Controller:** `GrowthController`
* **Purpose:** Returns all growth updates submitted for a land.

### 7.2 Submit Growth Update
* **Endpoint URL:** `/api/lands/{id}/growth-updates`
* **HTTP Method:** `POST`
* **Controller:** `GrowthController`
* **Purpose:** Saves a new monitoring report tracking sapling height, health, and survival.
* **Request Parameters:** `averageHeightCm` (Integer), `survivalRate` (Integer), `healthStatus` (String), `notes` (Optional), `images` (Optional files).
* **Authentication Required:** Yes

### 7.3 Get Community Feed
* **Endpoint URL:** `/api/growth/feed`
* **HTTP Method:** `GET`
* **Controller:** `GrowthController`
* **Purpose:** Returns a global timeline of recent growth updates.

### 7.4 Get Growth Stats
* **Endpoint URL:** `/api/growth/stats`
* **HTTP Method:** `GET`
* **Controller:** `GrowthController`
* **Purpose:** Returns global averages like distinct monitored lands count and survival rates.

---

## 8. Forum APIs
Manage discussion boards.

### 8.1 Get All Questions
* **Endpoint URL:** `/api/forum`
* **HTTP Method:** `GET`
* **Controller:** `ForumController`
* **Purpose:** Returns all community forum questions.

### 8.2 Get Question Details
* **Endpoint URL:** `/api/forum/{id}`
* **HTTP Method:** `GET`
* **Controller:** `ForumController`
* **Purpose:** Returns a discussion question and its replies thread.

### 8.3 Post New Question
* **Endpoint URL:** `/api/forum`
* **HTTP Method:** `POST`
* **Controller:** `ForumController`
* **Purpose:** Creates a new discussion question (subject to a backend profanity filter).
* **Request Body:** `{ "title": "...", "content": "..." }`
* **Authentication Required:** Yes

### 8.4 Post Reply
* **Endpoint URL:** `/api/forum/{id}/reply`
* **HTTP Method:** `POST`
* **Controller:** `ForumController`
* **Purpose:** Creates a reply on a discussion thread.
* **Request Body:** `{ "content": "..." }`
* **Authentication Required:** Yes

---

## 9. Leaderboard & Gamification APIs
Leaderboard rankings and profile stats.

### 9.1 Get Gamification Progress
* **Endpoint URL:** `/api/gamification/me`
* **HTTP Method:** `GET`
* **Controller:** `GamificationController`
* **Purpose:** Returns logged-in user's level, total XP, streak, rank, unlocked badges, and recent XP logs.
* **Authentication Required:** Yes

### 9.2 Get Leaderboard
* **Endpoint URL:** `/api/gamification/leaderboard`
* **HTTP Method:** `GET`
* **Controller:** `GamificationController`
* **Purpose:** Returns top users sorted by total XP.
* **Request Parameters:** `limit` (Default: 20).

### 9.3 Get Badges Catalogue
* **Endpoint URL:** `/api/gamification/badges`
* **HTTP Method:** `GET`
* **Controller:** `GamificationController`
* **Purpose:** Returns the catalogue of all available badges.

---

## 10. Admin APIs
Verifications and admin views.

### 10.1 Get Pending Lands
* **Endpoint URL:** `/api/lands/pending`
* **HTTP Method:** `GET`
* **Controller:** `LandController`
* **Purpose:** Lists all land uploads awaiting verification (admin queue).
* **Authentication Required:** Yes (ROLE_ADMIN checks are performed on session attributes).

### 10.2 Verify Pending Land
* **Endpoint URL:** `/lands/{id}/verify`
* **HTTP Method:** `POST`
* **Controller:** `LandVerificationController`
* **Purpose:** Casts a verification vote for a pending land upload.
* **Request Parameters:** `vote` ("APPROVE" or "REJECT"), `userId`.
* **Authentication Required:** Yes
