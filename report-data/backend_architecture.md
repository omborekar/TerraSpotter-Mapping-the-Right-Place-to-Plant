# Backend Architecture

This document describes the design patterns, package structures, transactional layers, database interactions, and business logic frameworks implemented in the **TerraSpotter** Spring Boot backend. This content is structured for inclusion in Chapter 4 (System Design) and Chapter 6 (Implementation) of the project report.

---

## 1. Package Structure

The backend follows standard Spring Boot package conventions, organizing classes by their architectural role:

```text
com.example.terraspoter/
├── config/              # Security filter chains, CORS, and Cloudinary settings
├── controller/          # REST Controllers exposing endpoints to the client
├── dto/                 # Request-response data shapes and payload objects
├── exception/           # Intercepts global errors and formats JSON exceptions
├── model/               # JPA entities representing database tables
├── payload/             # Authentication request payloads (login/signup)
├── repository/          # JpaRepository interfaces communicating with PostgreSQL
└── service/             # Business logic layer and external integrations
```

---

## 2. Layered Architecture Design

The backend implements a classic **three-tier layered architecture**:

```text
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│         (REST Controllers / Chat / Verifications)       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                  │
│       (Services / Spatial Grid / ML API Client)         │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Access Layer                    │
│             (JPA Repositories / Hibernate)              │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     Database Layer                      │
│                      (PostgreSQL)                       │
└─────────────────────────────────────────────────────────┘
```

### 2.1 Presentation Layer (Controllers)
REST controllers (annotated with `@RestController`) validate incoming requests and route them to services. For example, `LandController` receives client parameters, handles authorization, and converts outputs into JSON payloads.

### 2.2 Business Logic Layer (Services)
Services (annotated with `@Service`) handle the core application rules, including calculating tree capacities, compiling leaderboard rankings, updating experience points, and calling external APIs.

### 2.3 Data Access Layer (Repositories)
Repositories extend `JpaRepository` and use Spring Data JPA to generate SQL queries. They support both auto-generated finder methods (e.g., `findByEmail`) and custom JPQL queries (using `@Query`).

---

## 3. Core Technical Features

### 3.1 Entity-DTO Mapping Pattern
To prevent circular reference loops in JSON serialization (which can happen with `@OneToMany` relationships) and protect database schema details, data is mapped using specific Data Transfer Objects (DTOs):
- **`PlantationShowcaseDTO`:** Summarizes completion details and associated reviews for public display.
- **`LandTile`:** Packages basic land parameters and thumbnail image URLs for chatbot search results.

### 3.2 Global Exception Interceptor
The platform uses a central controller advisor `GlobalExceptionHandler` to intercept runtime errors and return consistent JSON structures:
- **`handleAllExceptions(Exception.class)`:** Catches unexpected system errors and returns a `500 Internal Server Error` response.
- **`handleMaxSizeException(MaxUploadSizeExceededException.class)`:** Catches large file uploads and returns a `417 Expectation Failed` response.

---

## 4. Integration and External Pipelines

The service layer coordinates integrations with several external services:

1. **Meteorological Processing (`LandService.java`):**
   - Downloads forecasting and historical climate data from Open-Meteo REST APIs.
   - Normalizes moisture measurements into soil types and maps temperatures to climate zones.
2. **Machine Learning Inference (`LandService.java`):**
   - Connects to the Python Flask microservice using Java's built-in `HttpClient`.
   - Sends environmental parameters via query parameters and parses tree recommendations.
3. **Cloud Media Management (`CloudinaryService.java`):**
   - Uploads multipart photos to Cloudinary bucket storage.
   - Saves return paths to database tables (`land_images`, `plantation_completion_images`).
4. **Email Notification System (`BrevoEmailService.java`):**
   - Connects to Brevo's API using JSON payloads to send transactional emails (e.g. signup OTP, verification alerts).
5. **Agentic Conversational Service (`ChatService.java`):**
   - Connects to Google's Gemini API via REST.
   - Registers backend function declarations (tools) and executes DB operations on request.
