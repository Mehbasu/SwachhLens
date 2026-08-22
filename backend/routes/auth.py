from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
import bcrypt
from datetime import datetime, timedelta, timezone
import jwt
import os
from psycopg2.extras import RealDictCursor

from db.database import db

router = APIRouter(prefix="/auth", tags=["Authentication"])


SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-jwt-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str = "inspector"
    state: str = None
    district: str = None
    city: str = None
    ward: str = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str
    state: str = None
    district: str = None
    city: str = None
    ward: str = None

class LocationUpdate(BaseModel):
    state: str = None
    district: str = None
    city: str = None
    ward: str = None

def verify_password(plain_password, hashed_password):
    password_bytes = plain_password.encode('utf-8')[:72]
    hash_bytes = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except ValueError:
        return False

def get_password_hash(password):
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=Token)
async def register(user: UserRegister):
    existing_user = db.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Security: Force 'citizen' role for self-registration via mobile app
    user.role = "citizen"
    
    # Normalize ward
    normalized_ward = user.ward.strip().lower() if user.ward else None
    
    hashed_password = get_password_hash(user.password)
    try:
        db.insert_user(user.email, hashed_password, user.role, user.state, user.district, user.city, normalized_ward)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role, 
        "email": user.email,
        "state": user.state,
        "district": user.district,
        "city": user.city,
        "ward": normalized_ward
    }

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db_user = db.get_user_by_email(user.email)
    
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["email"], "role": db_user["role"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": db_user["role"], 
        "email": db_user["email"],
        "state": db_user.get("state"),
        "district": db_user.get("district"),
        "city": db_user.get("city"),
        "ward": db_user.get("ward")
    }

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
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
