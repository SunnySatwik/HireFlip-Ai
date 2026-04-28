"""
FastAPI backend for AI Hiring Fairness Auditor.

Main application entry point with route registration and middleware setup.
Ready to run with: uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import Base, engine
from models.user import User
from models.dataset import Dataset

from routes import upload, metrics, candidates, shortlist, reports, auth, ai

# Base.metadata.create_all(bind=engine) - Moved to startup event

app = FastAPI(
    title="AI Hiring Fairness Auditor",
    version="1.0.0"
)

import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hireflip-ai.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event: Load default dataset on server start
@app.on_event("startup")
async def startup_event():
    """
    Initialize system on startup.
    """
    print("[INFO] Starting AI Hiring Fairness Auditor Backend...")
    
    # Initialize database tables
    try:
        print("[DB] Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] Database tables initialized.")
    except Exception as e:
        print(f"[ERROR] Error initializing database: {str(e)}")
        print("[WARN] Application will continue, but database-dependent features may fail.")

    print("[SUCCESS] Backend ready with per-user isolation!")


# Register route routers
app.include_router(auth.router)
app.include_router(upload.router, tags=["Data Management"])
app.include_router(metrics.router, tags=["Fairness Analysis"])
app.include_router(candidates.router, tags=["Candidate Data"])
app.include_router(shortlist.router, tags=["Shortlisting"])
app.include_router(reports.router, tags=["Reports"])
app.include_router(ai.router, prefix="/ai", tags=["AI Insights"])


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Simple health check endpoint.

    Returns:
        Status message
    """
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": "AI Hiring Fairness Auditor"}
    )


# Root endpoint
@app.get("/")
async def root():
    """
    API root endpoint with documentation links.

    Returns:
        API information and documentation links
    """
    return JSONResponse(
        content={
            "message": "AI Hiring Fairness Auditor API",
            "version": "1.0.0",
            "docs": "/docs",
            "endpoints": {
                "upload": "POST /upload-csv - Upload candidate CSV",
                "metrics": "GET /metrics - Get fairness metrics",
                "candidates": "GET /candidates - Get processed candidates",
                "shortlist": "GET /shortlist - Get original vs adjusted shortlist",
                "report": "GET /report - Generate audit report",
                "health": "GET /health - Health check"
            }
        }
    )


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle uncaught exceptions."""
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
