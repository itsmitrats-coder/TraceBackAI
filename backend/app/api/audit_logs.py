from fastapi import APIRouter, Header, HTTPException
from typing import Optional, List, Dict, Any
from ..services.database import db
from .auth import get_current_user

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])

@router.get("")
def list_audit_logs(
    action: Optional[str] = None,
    target_type: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    # Role check: only staff and admin can view full campus audit trail
    if user and user.get("role") not in ["staff", "admin"]:
        # Student sees only their own audit logs
        logs = [l for l in db.get_audit_logs() if l.get("actor_id") == user.get("id")]
    else:
        logs = db.get_audit_logs()

    if action:
        logs = [l for l in logs if action.lower() in l.get("action", "").lower()]
    if target_type:
        logs = [l for l in logs if l.get("target_type") == target_type]

    return logs
