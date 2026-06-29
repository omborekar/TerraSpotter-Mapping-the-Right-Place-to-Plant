# Project Summary

This document provides a comprehensive technical overview of the **TerraSpotter** project. It is structured for inclusion in the Abstract and Introduction sections of the final project report, and serves as a reference for project presentation and viva preparation.

---

## 1. Project Overview & Abstract

Despite global initiatives to counter climate change through massive tree plantation drives, sapling mortality rates remain high. This "Plantation Paradox" occurs because drives often proceed without analyzing local environmental suitability, leading to species-soil mismatching and overcrowding.

**TerraSpotter: Mapping the Right Place to Plant** is a geospatial platform that applies data science to afforestation. By combining computational geometry (for capacity estimation) with a Random Forest machine learning pipeline (for species suitability scoring), the platform ensures that saplings are planted in environments where they can thrive. The system also includes an agentic AI chatbot (powered by Google Gemini) to guide users, and gamification elements (experience points, levels, and badges) to encourage community involvement and monitor tree growth over time.

---

## 2. Core Technical Objectives

1. **Spatial Precision:** Implement a grid projection algorithm to estimate exact tree capacity within custom coordinates, preventing overcrowding.
2. **Predictive Species Matching:** Bridge real-time local climate telemetry with historical species datasets using a Random Forest classifier.
3. **Verified Reforestation:** Track planting drives and monitor sapling growth using geo-tagged photo verification.
4. **Community Engagement:** Implement gamification mechanics (XP, levels, badges) to encourage community participation and record-keeping.

---

## 3. Technology Stack

### 3.1 Frontend (Client Layer)
- **Framework:** React 19 SPA (Single Page Application) built with Vite.
- **Styling:** Vanilla CSS variables and TailwindCSS.
- **Mapping Interface:** Leaflet.js with React-Leaflet and Leaflet-Draw for drawing coordinates.
- **State Managers:** React Context API (`ThemeContext` and `UserContext`).
- **Internationalization:** i18next supporting English, Hindi, Marathi, Spanish, and German.

### 3.2 Backend (Service Layer)
- **Framework:** Spring Boot (Java 21) running an embedded Tomcat container.
- **Security:** Spring Security with BCrypt password hashing.
- **Session Manager:** Stateful Servlet Session management (`HttpSession` cookies).
- **ORM Framework:** Spring Data JPA with Hibernate.

### 3.3 Machine Learning Microservice
- **Model Framework:** Scikit-learn (Python 3.10) with joblib.
- **REST Wrapper:** Flask server using Gunicorn in production.

### 3.4 Databases & Storage
- **Relational Database:** PostgreSQL (managing 19 tables).
- **Cloud Media Storage:** Cloudinary (hosting photo uploads).

---

## 4. Key Systems & Modules

### 4.1 AI Species Recommendation System
The platform queries the Python ML microservice to get tree recommendations.
- **Algorithm:** Random Forest Classifier.
- **Input Features:** Local average temperature, annual rainfall, soil type, and climate zone.
- **Output:** The top 5 recommended tree species, each with a suitability confidence score and three specific reasons.
- **Fallback Safety:** The backend automatically serves default recommendations (Neem, Moringa, Peepal) if the ML service is unreachable.

### 4.2 Weather & Telemetry Intelligence System
To gather soil and climate parameters, the backend queries the Open-Meteo REST APIs:
- **Temperature:** Averages the 7-day forecast temperatures.
- **Rainfall:** Sums the daily precipitation records for the past 365 days.
- **Soil Classification:** Categorizes soil (sandy, clay, loamy) based on average volumetric soil moisture forecasts.
- **Climate Zone Classification:** Determines the climate zone (arid, semi-arid, temperate, tropical) based on annual rainfall and temperature averages.

### 4.3 Computational Grid Capacity Estimation
To prevent overcrowding, the backend projects a virtual 3m x 3m grid over the user's custom-drawn polygon.
- **Algorithm:** Uses a ray-casting point-in-polygon algorithm to check grid intersections, returning the exact number of compatible planting cells.

### 4.4 Agentic AI Chatbot Module
Exposes a conversational forestry assistant using the `gemini-2.5-flash` model.
- **Function Calling:** Gemini is configured with backend tools (`getUserLands`, `getRecommendations`, `refreshRecommendations`), allowing it to fetch database details and trigger suitability refreshes dynamically.

### 4.5 Gamification & Community Features
- **XP Ledger:** Users earn XP for activities like registering land (+50 XP), starting a plantation drive (+30 XP), completing a drive (+100 XP plus +10 XP per tree), and submitting growth updates (+40 XP).
- **Leaderboards:** Ranks users globally based on accumulated XP.
- **Badges:** Automatically awards badges (e.g. "Green Champion") once activity counts pass predefined thresholds.
- **Community Forum:** Allows users to ask questions, share tips, and reply to discussion threads.

---

## 5. Future Development Scope
- **Drone and Satellite Imagery Analysis:** Using computer vision on satellite imagery to track plantation growth and survival rates automatically over time.
- **Carbon Offset Tokenization:** Linking verified tree growth records to carbon credit metrics, allowing users to earn carbon offset tokens.
- **Offline Mapping Support:** Implementing Progressive Web App (PWA) features to let users draw land boundaries in areas without active network coverage.
