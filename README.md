# TerraSpotter

TerraSpotter is a smart platform for sustainable afforestation that connects landowners, volunteers, and organizations. It uses maps and AI to estimate plantation capacity, recommends native tree species, and provides tools for coordination and progress tracking.

---

## Table of Contents
- [About](#about)
- [Quickstart](#quickstart)
- [Backend](#backend)
- [Frontend](#frontend)
- [Models (ML)](#models-ml)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

TerraSpotter bridges the gap between landowners and planting groups by allowing users to register land, estimate how many trees a plot can support, and recommend appropriate native species. The project combines a Spring Boot backend, a React + Vite frontend, and a small Flask ML service for tree recommendations.

## Quickstart

Prerequisites

- Java 21 (required by the backend)
- Node.js 18+ and npm
- Python 3.10+ (for the ML service)
- PostgreSQL (optional for local DB; configure in backend application properties)

Clone the repo:

```bash
git clone https://github.com/your-org/your-repo.git
cd TerraSpotter-Mapping-the-Right-Place-to-Plant
```

Start services locally (three separate shells are recommended):

- Backend (Spring Boot)

	```bash
	cd backend
	# macOS / Linux
	./mvnw spring-boot:run
	# Windows (PowerShell / cmd)
	mvnw.cmd spring-boot:run
	```

	The backend runs on port 8080 by default. Adjust database settings in `backend/src/main/resources/application.properties` or via environment variables.

- Frontend (Vite + React)

	```bash
	cd frontend
	npm install
	npm run dev
	```

	The frontend uses Vite (default port 5173). Update the API base URL in `frontend/src/lib/utils.js` if needed.

- Models / ML API (Flask)

	```bash
	cd models
	python -m venv venv
	# Windows
	venv\\Scripts\\activate
	# macOS / Linux
	source venv/bin/activate
	pip install -r requirements.txt
	python app.py
	```

	The ML API serves recommendations on port 5000 at `/predict`.

## Backend

- Location: [backend](backend)
- Run: `./mvnw spring-boot:run` (or `mvnw.cmd` on Windows)
- Build jar: `./mvnw clean package` → `java -jar target/TerraSpoter-backend-1.0.0.jar`
- Java version: 21 (see `backend/pom.xml`)

Configuration

Update `backend/src/main/resources/application.properties` to set database URL, credentials, Cloudinary keys, and other environment-specific settings.

## Frontend

- Location: [frontend](frontend)
- Run: `npm install` then `npm run dev`
- Build: `npm run build` and serve the contents of `dist/` for production

## Models (ML)

- Location: [models](models)
- The Flask app (`models/app.py`) loads a pre-trained model from `models/model/tree_model.pkl` and data from `models/data/data.csv`. The simple HTTP endpoint is `/predict` (GET) and accepts `temp`, `rainfall`, `soil`, and `climate` query parameters.

## Architecture

See the architecture notes and diagrams: [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)

## Development

- Backend tests: run `./mvnw test` inside `backend`
- Frontend lint: run `npm run lint` inside `frontend`
- ML: unit tests not included; run the Flask app locally for manual testing

## Contributing

Contributions are welcome. Please open issues for bugs or feature requests and submit pull requests for review. If you have a contribution workflow you'd like us to follow, add a `CONTRIBUTING.md` in the repo root.

## License

This repository does not include a license file. Add a `LICENSE` at the repository root if you want to set a license for reuse.

## Contact

Project maintained by the TerraSpotter team. Open an issue or contact the maintainers via the repository GitHub page.

---

Thank you for contributing to TerraSpotter!
