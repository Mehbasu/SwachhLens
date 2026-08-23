from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
import os
from psycopg2.extras import RealDictCursor
import firebase_admin
from firebase_admin import auth as firebase_auth

from db.database import db

router = APIRouter(prefix="/auth", tags=["Authentication"])


class SyncRequest(BaseModel):
    role: str = "citizen"
    state: str = None
    district: str = None
    city: str = None
    ward: str = None
    name: str = None
    avatar_url: str = None

@router.post("/sync")
async def sync_user(req: SyncRequest, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    """
    Verifies Firebase token and syncs the user into the Postgres database.
    Called by the frontend immediately after a successful Firebase login/signup.
    """
    try:
        payload = firebase_auth.verify_id_token(token)
        # Firebase payload uses 'email' for email auth, and 'phone_number' for phone auth
        email = payload.get("email") or payload.get("phone_number")
        
        if not email:
            raise HTTPException(status_code=400, detail="Token has no email or phone number")
            
        user = db.get_user_by_email(email)
        if not user:
            # User doesn't exist in Postgres yet. Create them.
            normalized_ward = req.ward.strip().lower() if req.ward else None
            # Store a dummy password hash since Firebase handles real passwords
            db.insert_user(email, "FIREBASE_AUTH", req.role, req.state, req.district, req.city, normalized_ward, req.name, req.avatar_url)
            user = db.get_user_by_email(email)
            
        return {
            "email": user["email"],
            "role": user["role"],
            "state": user.get("state"),
            "district": user.get("district"),
            "city": user.get("city"),
            "ward": user.get("ward"),
            "name": user.get("name"),
            "avatar_url": user.get("avatar_url")
        }
    except Exception as e:
        print(f"[Auth] Sync failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token"
        )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login") # Keeps Swagger UI working mostly

class LocationUpdate(BaseModel):
    state: str = None
    district: str = None
    city: str = None
    ward: str = None

class ProfileUpdate(BaseModel):
    name: str = None
    avatar_url: str = None

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = firebase_auth.verify_id_token(token)
        email = payload.get("email") or payload.get("phone_number")
        if email is None:
            raise credentials_exception
    except Exception as e:
        print(f"[Auth] Token verification failed: {e}")
        raise credentials_exception
        
    user = db.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

def get_current_commissioner(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "commissioner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires commissioner role"
        )
    return current_user

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns the current authenticated user's profile.
    """
    return {
        "email": current_user["email"],
        "role": current_user["role"],
        "state": current_user.get("state"),
        "district": current_user.get("district"),
        "city": current_user.get("city"),
        "ward": current_user.get("ward"),
        "name": current_user.get("name"),
        "avatar_url": current_user.get("avatar_url")
    }

@router.patch("/profile")
async def update_profile(update: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """
    Updates the current user's profile (name, avatar).
    """
    if not db.conn:
        email = current_user["email"]
        if email in db._mock_users:
            if update.name is not None:
                db._mock_users[email]["name"] = update.name
            if update.avatar_url is not None:
                db._mock_users[email]["avatar_url"] = update.avatar_url
    else:
        with db.conn.cursor() as cur:
            if update.name is not None:
                cur.execute("UPDATE users SET name = %s WHERE email = %s", (update.name, current_user["email"]))
            if update.avatar_url is not None:
                cur.execute("UPDATE users SET avatar_url = %s WHERE email = %s", (update.avatar_url, current_user["email"]))
    return {"message": "Profile updated successfully"}

@router.patch("/jurisdiction/self")
async def update_own_jurisdiction(location: LocationUpdate, current_user: dict = Depends(get_current_user)):
    """
    Updates the current user's jurisdiction.
    """
    normalized_ward = location.ward.strip().lower() if location.ward else None
    
    if not db.conn:
        email = current_user["email"]
        if email in db._mock_users:
            if location.state is not None:
                db._mock_users[email]["state"] = location.state
            if location.district is not None:
                db._mock_users[email]["district"] = location.district
            if location.city is not None:
                db._mock_users[email]["city"] = location.city
            if location.ward is not None:
                db._mock_users[email]["ward"] = normalized_ward
    else:
        with db.conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET state = %s, district = %s, city = %s, ward = %s WHERE email = %s",
                (location.state, location.district, location.city, normalized_ward, current_user["email"])
            )
            
    return {"message": "Jurisdiction updated successfully"}


from fastapi import UploadFile, File, Request
from services.upload_service import save_upload_file

@router.post("/avatar")
async def upload_avatar(request: Request, image: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Uploads an avatar and updates the user's avatar_url.
    """
    base_url = str(request.base_url)
    avatar_url = save_upload_file(image, base_url=base_url, prefix="avatar")
    
    if not db.conn:
        email = current_user["email"]
        if email in db._mock_users:
            db._mock_users[email]["avatar_url"] = avatar_url
    else:
        with db.conn.cursor() as cur:
            cur.execute("UPDATE users SET avatar_url = %s WHERE email = %s", (avatar_url, current_user["email"]))
            
    return {"avatar_url": avatar_url}



