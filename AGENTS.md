# AGENTS.md

## General
- **Backend:** Java (Maven). Always use `./mvnw`.
- **Frontend:** React 19 + Vite 6 + Tailwind CSS v4 (located in `/frontend`).

## Commands
- **Backend:** `./mvnw clean compile` (Required before tests).
- **Frontend:** `cd frontend && npm install && npm run dev`
- **Testing:** `locust -f locustfile.py` (Requires backend running).

## Workflow & Ports
- **Ports:** Frontend `http://localhost:5173/`, Locust `http://localhost:8089`.
- **Lifecycle:** Ensure backend is compiled and running before initiating Locust tests.
