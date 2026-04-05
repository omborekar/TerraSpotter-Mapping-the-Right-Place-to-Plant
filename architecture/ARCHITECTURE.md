# TerraSpotter — System Architecture

Summary
- TerraSpotter is a three-part system: a React SPA frontend, a Spring Boot backend, and a standalone ML microservice. External services include Cloudinary (images) and Brevo (email). PostgreSQL is the primary persistent store.

Diagram
- See: [architecture/diagram.mmd](architecture/diagram.mmd)

Components
- **Frontend**: React (Vite), `react-leaflet` for maps — deployed to Vercel (see `frontend/vercel.json`). The SPA talks to the backend over HTTPS.
- **Backend**: Spring Boot (Java 21). Implements REST controllers (`/api/*`), session-based auth (server-side `HttpSession`), Cloudinary integration, and ML warm-up/calls. Containerized via `backend/Dockerfile`.
- **Database**: PostgreSQL (configured via `DB_URL`, `DB_USER`, `DB_PASS` env vars in `backend/src/main/resources/application.properties`).
- **ML Service**: Flask app (`models/app.py`) exposing `/predict`. Loads `model/tree_model.pkl` and `data/data.csv`.
- **Third-party**: Cloudinary (image hosting), Brevo (email). Secrets are provided via environment variables.

Data & Control Flows (high level)
- User -> Frontend (Vercel) -> Backend (HTTPS)
- Backend -> PostgreSQL (JDBC)
- Backend -> Cloudinary (SDK/HTTPS) for image uploads
- Backend -> Brevo (REST) for transactional email
- Backend -> ML Service (HTTP /predict)

How to render the diagram
- Requirements: Node.js + `npx` (or install `@mermaid-js/mermaid-cli` globally).
- PowerShell (Windows):
  - `npx -y @mermaid-js/mermaid-cli -i architecture/diagram.mmd -o architecture/diagram.svg`
  - `npx -y @mermaid-js/mermaid-cli -i architecture/diagram.mmd -o architecture/diagram.png`
- VS Code: install a Mermaid preview extension and open `architecture/diagram.mmd`.

Security & Ops notes
- **Secrets**: Keep `DB_*`, `CLOUDINARY_*`, `BREVO_*`, and `ML_API_URL` in a secrets manager (not checked into repo). The app reads them from env vars.
- **Auth**: Backend uses server-side sessions (cookies). Ensure `SameSite` & `Secure` are enforced in production and consider CSRF protections if you expose session-based auth.
- **ML**: Treat ML service as a separate bounded context. Add request validation, rate-limiting, and authentication if exposing to public networks.
- **Uploads**: Images are stored in Cloudinary; keep public IDs and avoid exposing raw credentials.

Scalability suggestions
- Frontend: CDN (Vercel provides this). Keep assets cacheable.
- Backend: containerize, autoscale behind a load balancer; use a managed Postgres with read replicas if required.
- ML: run the model in a horizontally scalable service (Kubernetes, serverless containers, or managed inference endpoint).

Review checklist (for architecture review)
- **Correctness**: Confirm the `/predict` contract (input params, response schema) between backend and ML service.
- **Secrets**: Verify no secrets in repo and a plan exists for secret rotation.
- **Auth**: Confirm session cookie settings and CSRF mitigation.
- **Data**: Confirm Postgres schema/migrations and backup plan.
- **Observability**: Logging, structured logs, metrics (request latencies, error rates), and health endpoints for backend and ML service.
- **CI/CD**: Verify how frontend builds are deployed to Vercel and backend images are built and pushed (Docker registry).

Next steps
- Optionally add a sequence diagram for a signup flow and a deployment diagram showing VPC, subnets, and managed services.
- If desired, I can add a PlantUML version or generate PNG/SVG automatically via CI.
