# Project Statistics

This document summarizes the core metrics, component counts, code volume, and configuration details of the **TerraSpotter** platform.

---

## 1. Frontend Architecture Metrics (React)

The React-based Single Page Application (SPA) metrics are summarized below:

| Metric Category | Count | Mapped Subcomponents / Files |
| :--- | :--- | :--- |
| **Total Pages** | 19 | About, AdminLandDetail, AdminPendingLands, Browse, CommunityFeed, Contact, ForgotPassword, Forum, GrowthTracker, Home, Leaderboard, Login, Main, NotFound, PlantationShowcase, Profile, Reviewspage, Signup, SiteDetail |
| **Total Components** | 15 | ChatUI, CompletePlantationModal, ContributionMap, Footer, GoogleLoginButton, LanguageSwitcher, Navbar, PlantationForm, ProtectedRoute, ScrollToTop, XpToast, LoadingSpinner, button, card, input |
| **Total Context Providers** | 2 | `ThemeContext` (Dark/Light mode state), `UserContext` (User session state) |
| **Total Router Routes** | 19 | Mapped in `App.jsx` using `react-router-dom` |

---

## 2. Backend Architecture Metrics (Spring Boot)

The Java Spring Boot REST API metrics are summarized below:

| Metric Category | Count | Description / Scope |
| :--- | :--- | :--- |
| **Total Controllers** | 11 | Handles client requests for auth, forgot-password, user profiles, stats, land records, reviews, growth telemetry, leaderboard, chat advisor, and forum. |
| **Total Services** | 15 | Implements business logic for spatial grids, ML connectors, Cloudinary file uploads, email delivery, and gamification calculations. |
| **Total Repositories** | 17 | Spring Data JPA interfaces representing the repository layer. |
| **Total JPA Entities** | 19 | Hibernate-mapped database models. |
| **Total DTOs** | 10 | 4 explicit DTO files (`ChatRequest`, `ChatResponse`, `LandTile`, `PlantationShowcaseDTO`), 2 payload files (`LoginRequest`, `SignupRequest`), and 4 inner-class DTOs (e.g., in `ForumController` and `Land`). |

---

## 3. Database Schema Metrics (PostgreSQL)

- **Total Database Tables:** 19 tables
- **Total Schema Constraints:** 28 (including surrogate primary keys, foreign key triggers, and unique constraints)

---

## 4. External Integrations Metrics

| Integration | Type | Cloud Service Provider | Primary Purpose in TerraSpotter |
| :--- | :--- | :--- | :--- |
| **Open-Meteo Forecast** | REST API | Open-Meteo | Local temperature and soil moisture forecast telemetry. |
| **Open-Meteo Archive** | REST API | Open-Meteo | Historical precipitation data (past 365 days). |
| **Google OAuth 2.0** | REST API / SSO | Google Cloud Console | Single Sign-On registration and authentication. |
| **Brevo Mail** | SMTP / HTTP | Brevo | Transactional emails (signup OTP, forgot-password code, upload logs). |
| **Cloudinary** | REST API / SDK | Cloudinary | Cloud hosting for land images and plantation verification proofs. |

---

## 5. Machine Learning System Metrics

- **ML Model Type:** Random Forest Classifier (`sklearn.ensemble.RandomForestClassifier`)
- **Total Training Features:** 4 inputs (`temp_avg`, `rainfall_avg`, `soil`, `climate_zone`)
- **Total Classification Categories:** 20 distinct tree species classes
- **Training Dataset Volume:** 500 records (balanced dataset with 25 records per species class)

---

## 6. Codebase Metrics (Lines of Code)

The codebase volume metrics are summarized below (excluding third-party libraries and local environments like node_modules and python virtual environments):

| Codebase Layer | Language | File Extensions | Counted Lines of Code (LOC) | Percentage (%) |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | JavaScript / CSS / HTML | `.jsx`, `.js`, `.css` | 10,243 | 69.0% |
| **Backend** | Java | `.java` | 4,431 | 29.8% |
| **Machine Learning** | Python | `.py` | 173 | 1.2% |
| **Total Project** | **Mixed** | - | **14,847** | **100.0%** |
