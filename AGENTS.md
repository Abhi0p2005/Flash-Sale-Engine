# AGENTS.md

## General
- **Backend:** Java (Maven) in `/backend`. Always use `./backend/mvnw`.
- **Frontend:** React 19 + Vite 6 + Tailwind CSS v4 (located in `/frontend`).
- **FlashPulse AI:** AI assistant service in `/services/flashpulse-ai/` (FastAPI backend, vanilla JS frontend).

## Commands
- **Backend:** `cd backend && ./mvnw clean compile` (Required before tests).
- **Frontend:** `cd frontend && npm install && npm run dev`
- **FlashPulse AI Backend:** `cd services/flashpulse-ai/backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000`
- **Scraper:** `pip install -r scraper_requirements.txt && python -m playwright install chromium && python scraper.py --max-products 5 [--visible] [--category mobiles]`
- **Data generator (fallback):** `python generate_data.py` — builds 25 realistic products from `frontend/public/images/` demo images. Run when Croma is inaccessible.
- **Frontend data:** Products auto-load from `frontend/scraped_final.json` via Vite import. Images served from `frontend/public/product_images/`. Run scraper or generator to refresh.

## Workflow & Ports
- **Ports:** Frontend `http://localhost:5173/`, FlashPulse AI `http://localhost:8000/`, Locust `http://localhost:8089/`.
- **Lifecycle:** Ensure both backends (Spring Boot & FastAPI) are running before using PulseAI assistant. Vite proxies `/api/generate-copy` and `/api/chat-stream` to FastAPI.
- **Integration:** The `PulseAIAssistant` component (in `frontend/src/components/PulseAIAssistant.jsx`) is mounted as a floating drawer in the main app. Toggle it via the FAB in the bottom-right corner.
- **Navigation:** Click any product card to open its detail page (image carousel → ratings → specs → reviews). Click "back to catalog" to return.
