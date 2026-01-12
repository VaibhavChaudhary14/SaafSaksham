# Development Guide

This guide explains how to run the **SaafSaksham** backend and frontend services in sync for local development.

## Prerequisites

- **Node.js**: v18 or later
- **Python**: v3.10 or later
- **PostgreSQL**: Running locally or a cloud instance (Supabase)
- **Git**: For version control

---

## 1. Backend Setup (FastAPI)

The backend runs on port `8000` by default.

### Setup Virtual Environment
Open a terminal in the `backend` directory:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

### Install Dependencies
```powershell
pip install -r requirements.txt
```

### Environment Variables
Create a `.env` file in `backend/` with your database and API keys:
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/saafsaksham
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

### Run the Server
```powershell
uvicorn main:app --reload
```
> **Success**: The API DOCS will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 2. Frontend Setup (Next.js)

The frontend runs on port `3000` by default and proxies requests to the backend.

### Install Dependencies
Open a **new terminal** (split view) in the `frontend` directory:

```powershell
cd frontend
npm install
```

### Environment Variables
Check `frontend/.env.local` and ensure you have valid keys for Supabase and Firebase:
```ini
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... other firebase keys
```

### Run the Development Server
```powershell
npm run dev
```
> **Success**: Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Verifying Synchronization

- **Frontend**: [http://localhost:3000](http://localhost:3000) loads the UI.
- **Backend**: [http://localhost:8000/health](http://localhost:8000/health) returns `{"status": "healthy"}`.
- **Interaction**: The frontend calls backend APIs (e.g., `/api/reports`) via `localhost:8000` (or configured proxy).

## Troubleshooting

- **CORS Errors**: If the frontend cannot talk to the backend, check `main.py` CORS settings. It should allow `http://localhost:3000`.
- **Database Connection**: Ensure your PostgreSQL service is running before starting the backend.
- **Invalid API Key**: If the frontend crashes, check your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local`.
