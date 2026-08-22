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
            db.insert_user(email, "FIREBASE_AUTH", req.role, req.state, req.district, req.city, normalized_ward)
            user = db.get_user_by_email(email)
            
        return {
            "email": user["email"],
            "role": user["role"],
            "state": user.get("state"),
            "district": user.get("district"),
            "city": user.get("city"),
            "ward": user.get("ward")
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

@router.get("/users/pending")
async def get_pending_users(current_admin: dict = Depends(get_current_commissioner)):
    """
    Returns a list of users (inspectors) who have no jurisdiction assigned.
    """
    if not db.conn:
        # Mock DB
        pending = []
        for email, u in db._mock_users.items():
            if u["role"] == "inspector" and not u.get("state"):
                pending.append({"email": email, "role": u["role"]})
        return pending
    else:
        with db.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT email, role FROM users WHERE role = 'inspector' AND state IS NULL")
            return cur.fetchall()

@router.put("/users/{email}/jurisdiction")
async def assign_jurisdiction(email: str, location: LocationUpdate, current_admin: dict = Depends(get_current_commissioner)):
    """
    Assigns state, district, city, ward to an officer.
    """
    target_user = db.get_user_by_email(email)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    normalized_ward = location.ward.strip().lower() if location.ward else None
    
    if not db.conn:
        if email in db._mock_users:
            db._mock_users[email]["state"] = location.state
            db._mock_users[email]["district"] = location.district
            db._mock_users[email]["city"] = location.city
            db._mock_users[email]["ward"] = normalized_ward
    else:
        with db.conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET state = %s, district = %s, city = %s, ward = %s WHERE email = %s",
                (location.state, location.district, location.city, normalized_ward, email)
            )
            
    return {"message": f"Jurisdiction assigned successfully to {email}"}
