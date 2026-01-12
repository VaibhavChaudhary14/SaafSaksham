from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import reports, leaderboard

app = FastAPI(
    title="SaafSaksham API",
    description="Backend for SaafSaksham - A Citizen Civic Platform",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])

@app.get("/")
async def root():
    return {"message": "Welcome to SaafSaksham API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
