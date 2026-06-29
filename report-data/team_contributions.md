# Team Contributions

This document details the project team members, roles, module responsibilities, technology focuses, and contribution allocations for the development of the **TerraSpotter** platform.

---

## 1. Project Team Profile

| Team Member | Project Role | Mapped Project Modules |
| :--- | :--- | :--- |
| **Om Borekar** | Lead Architect, Backend Developer, & ML Engineer | Spring Boot Backend API layer, JPA ORM configurations, Spatial Grid Estimation, Random Forest Classifier, Flask API server, Gemini AI integration, Context Providers, Leaflet mapping integrations, Admin modules. |
| **Vishwaja** | Frontend UI Developer | Static page components, visual templates, styling validations, and layout optimizations. |

---

## 2. Technical Responsibility Allocation

### 2.1 Om Borekar (Architect, Backend, & ML)
* **Backend Development:** Engineered the entire Spring Boot API. Configured security chains, stateful session verification, and implemented controllers, services, repositories, and entities.
* **Machine Learning Pipeline:** Programmed, trained, and evaluated the Random Forest classifier model. Developed the Flask REST wrapper server and implemented features like data scaling and Gaussian noise augmentation.
* **Geospatial Algorithms:** Coded the `SpatialGridService` ray-casting algorithms to project 3m x 3m planting grid cells over coordinates to estimate tree capacity.
* **AI Chatbot Integration:** Developed the agentic chatbot using Gemini function calling to link conversations to database operations (getUserLands, getRecommendations, refreshRecommendations).
* **Cloud & External Services:** Set up SMTP integrations (Brevo), media storage (Cloudinary), meteorological data pipelines (Open-Meteo), and Single Sign-On (Google OAuth 2.0).

### 2.2 Vishwaja (Frontend UI Developer)
* **Static Page Layouts:** Coded the static content for the **About** and **Contact** pages.
* **Style System Configuration:** Configured styles inside index.css and customized theme settings (dark/light toggles).
* **Validation & Forms:** Programmed React validation checks for user feedback forms on the contact page.

---

## 3. Contribution Matrix & Major Deliverables

| Category | Om Borekar | Vishwaja |
| :--- | :--- | :--- |
| **Primary Focus** | Software Architecture, Backend Core, ML Model Training, System Integrations. | Page Layout Design, CSS Styling, UI Components, Form Validations. |
| **Commits Count** | 165 Commits | 1 Commit |
| **Contribution %** | **90%** | **10%** |
| **Key Technologies** | Java, Spring Boot, JPA, Python, Flask, Scikit-learn, React, Leaflet, PostgreSQL. | React, Vanilla CSS, HTML, Lucide-React. |
| **Major Deliverables** | - Core Spring Boot Backend Service<br/>- Random Forest Classifier & Flask API<br/>- PostgreSQL database schema migrations<br/>- Leaflet Interactive Map implementation<br/>- Gemini Agentic AI Chatbot<br/>- Cloudinary & Brevo API integrations | - About Page UI component<br/>- Contact Page form validation styles<br/>- Navbar toggle transitions<br/>- Theme styling alignments |
