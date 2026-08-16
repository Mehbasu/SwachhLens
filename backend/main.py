import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.complaints import router as complaints_router
from routes.auth import router as auth_router
from services.upload_service import UPLOAD_DIR

app = FastAPI(
    title="SwachhLens Backend API",
    description="Backend API for Citizen Waste Reporting & Municipal Management Dashboard",
    version="1.0.0"
)

# Enable CORS for all origins to serve both Citizen Mobile App and Municipal Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount static files
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth_router)
app.include_router(complaints_router)

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/", tags=["System"])
async def root():
    """Root landing endpoint"""
    return {
        "title": "SwachhLens Backend API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
