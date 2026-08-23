import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.complaints import router as complaints_router
import firebase_admin
from firebase_admin import credentials
from routes.auth import router as auth_router
from services.upload_service import UPLOAD_DIR

app = FastAPI(
    title="SwachhLens Backend API",
    description="Backend API for Citizen Waste Reporting & Municipal Management Dashboard",
    version="1.0.0"
)

# Initialize Firebase Admin SDK
import json
try:
    firebase_cred_json = os.getenv("FIREBASE_CREDENTIALS")
    if firebase_cred_json:
        cred_dict = json.loads(firebase_cred_json)
        cred = credentials.Certificate(cred_dict)
    else:
        cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), 'firebase-adminsdk.json'))
        
    firebase_admin.initialize_app(cred)
    print("[Firebase] Admin SDK initialized successfully")
except Exception as e:
    print(f"[Firebase] Failed to initialize Admin SDK: {e}")

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
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
