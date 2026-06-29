# Deployment Architecture

This document outlines the hosting environment, build pipelines, environment configurations, and external integrations for the **TerraSpotter** production environment.

---

## 1. Cloud Infrastructure & Hosting Providers

The application employs a distributed deployment strategy:

```text
                                  ┌───────────────────────────┐
                                  │    Vercel Cloud Edge      │
                                  │ (React Frontend SPA Web)  │
                                  └─────────────┬─────────────┘
                                                │
                                                │ (HTTPS Requests / Cookies)
                                                ▼
┌───────────────────────────┐     ┌───────────────────────────┐     ┌───────────────────────────┐
│     Render Cloud VMs      │     │     Render Cloud VMs      │     │      Render Cloud DB      │
│  (Python Flask ML API)    │◄───►│ (Spring Boot Backend API) │◄───►│   (PostgreSQL Database)   │
└───────────────────────────┘     └─────────────┬─────────────┘     └───────────────────────────┘
                                                │
                                                ├─► Cloudinary (Image uploads)
                                                ├─► Brevo (Transactional emails)
                                                ├─► Open-Meteo API (Weather data)
                                                └─► Google Gemini API (Chatbot)
```

### 1.1 Frontend Hosting (Vercel)
- **Service Type:** Jamstack CDN Edge Hosting
- **Build Commands:** `npm run build`
- **Output Directory:** `dist/`
- **Routing Rules (`vercel.json`):** Configured to redirect all paths back to `index.html` to prevent 404 page-refresh issues in React Single Page Application routes:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### 1.2 Backend Hosting (Render)
- **Service Type:** Web Service running Java 21 VM
- **Build Commands:** `./mvnw clean package -DskipTests`
- **Runtime Execution:** `java -jar target/TerraSpoter-backend-1.0.0.jar`

### 1.3 Database Hosting (Render PostgreSQL)
- **Service Type:** Managed PostgreSQL Instance
- **Database Engine:** PostgreSQL 15+

### 1.4 Machine Learning Microservice Deployment (Render)
- **Service Type:** Python Web Service running Gunicorn
- **Build Commands:** `pip install -r requirements.txt`
- **Runtime Execution:** `gunicorn app:app --bind 0.0.0.0:5000`

---

## 2. Production Environment Variables Reference

Below is the list of environment variables required in the production environment:

### 2.1 React Frontend Environment Variables
* **`VITE_API_URL`:** URL of the hosted Spring Boot backend (e.g., `https://terraspotter.onrender.com`).
* **`VITE_GOOGLE_CLIENT_ID`:** Google OAuth 2.0 client ID for web authentication credentials.

### 2.2 Spring Boot Backend Environment Variables
* **`PORT`:** Bind port for the embedded Tomcat web server (defaults to 8080).
* **`FRONTEND_URL`:** Allowed CORS origin for browser requests (e.g., `https://terraspotter.vercel.app`).
* **`DB_URL`:** Connection URL string for the PostgreSQL database (`jdbc:postgresql://{host}:{port}/{db}`).
* **`DB_USER`:** PostgreSQL database username.
* **`DB_PASS`:** PostgreSQL database credentials.
* **`ML_API_URL`:** Root URL of the Python Flask ML service (e.g., `https://terraspotter-ml.onrender.com`).
* **`CLOUDINARY_CLOUD_NAME`:** Cloud name for Cloudinary uploads.
* **`CLOUDINARY_API_KEY`:** Client access key.
* **`CLOUDINARY_API_SECRET`:** Secret API signature key.
* **`BREVO_API_KEY`:** Brevo REST API key for email validation actions.
* **`BREVO_SENDER_EMAIL`:** Registered sender address.
* **`BREVO_SENDER_NAME`:** Display label.
* **`GEMINI_API_KEY`:** Developer API key from Google AI Studio.
* **`GEMINI_API_URL`:** API endpoint URL for model requests.

### 2.3 Flask ML Service Environment Variables
* **`FLASK_ENV`:** Configured to `production` to disable debug logging flags.

---

## 3. Third-Party API Integrations

1. **Cloudinary (Image Storage):** Images are uploaded to Cloudinary, and secure URLs are stored in the database.
2. **Brevo (Transactional Email):** Handled via REST API calls. Sends OTPs, sign-up confirmations, and land registration alerts.
3. **Google OAuth 2.0 (SSO):** Validates authentication tokens to enable one-click registration and login.
4. **Open-Meteo (Weather Data):** Fetches real-time localized weather details based on coordinate queries.

---

## 4. Production Deployment Workflow
- **Continuous Integration:** Repository integrations trigger automatic rebuilds on Vercel and Render when code changes are pushed to the `main` branch.
- **Dependency Flow:**
  - The frontend builds static assets and deploys them to Vercel's global edge network.
  - The backend runs database updates (`spring.jpa.hibernate.ddl-auto=update`) on startup and establishes a database connection pool.
  - The Flask service reads `tree_model.pkl` into memory and binds to port 5000 using Gunicorn.
- **HTTPS Enforcement:** SSL termination is handled at the Render and Vercel load balancers, redirecting HTTP requests to HTTPS.
