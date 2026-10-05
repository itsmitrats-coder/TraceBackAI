from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, Dict, Any, List
from ..models.schemas import User, UserCreate, UserLogin
from ..services.database import db

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if not authorization:
        return None
    # Authorization header: Bearer <user_id>
    token = authorization.replace("Bearer ", "").strip()
    return db.get_user_by_id(token)

def require_role(roles: List[str]):
    def role_checker(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
        user = get_current_user(authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail=f"Access denied. Requires one of roles: {roles}")
        return user
    return role_checker

@router.post("/register")
def register(user_in: UserCreate):
    existing = db.get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    
    new_user = db.create_user({
        "name": user_in.name,
        "email": user_in.email,
        "password": user_in.password,
        "role": user_in.role or "student",
        "department": user_in.department or "Undergraduate Studies",
        "avatar_url": user_in.avatar_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
    })
    
    # Audit log
    db.create_audit_log(
        actor_id=new_user["id"],
        actor_name=new_user["name"],
        actor_role=new_user["role"],
        action="USER_REGISTERED",
        target_type="user",
        target_id=new_user["id"]
    )
    
    # Return user with token (using user ID as bearer token for demo simplicity and robustness)
    return {
        "user": {k: v for k, v in new_user.items() if k != "password"},
        "token": new_user["id"]
    }

@router.post("/login")
def login(login_in: UserLogin):
    user = db.get_user_by_email(login_in.email)
    if not user or user.get("password") != login_in.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    db.create_audit_log(
        actor_id=user["id"],
        actor_name=user["name"],
        actor_role=user["role"],
        action="USER_LOGIN",
        target_type="user",
        target_id=user["id"]
    )

    return {
        "user": {k: v for k, v in user.items() if k != "password"},
        "token": user["id"]
    }

@router.get("/me")
def me(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {k: v for k, v in user.items() if k != "password"}

@router.get("/demo-users")
def get_demo_users():
    """Provides demo credentials for quick switching in UI."""
    return [
        {
            "role": "student",
            "name": "Alex Rivera",
            "email": "student@traceback.demo",
            "password": "password123",
            "title": "CS Undergrad (Student Persona)",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        },
        {
            "role": "staff",
            "name": "Officer Marcus Vance",
            "email": "staff@traceback.demo",
            "password": "password123",
            "title": "Campus Security & Dispatch (Staff Persona)",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
        },
        {
            "role": "admin",
            "name": "Dr. Sarah Chen",
            "email": "admin@traceback.demo",
            "password": "password123",
            "title": "Director of Campus Operations (Admin Persona)",
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
        }
    ]
