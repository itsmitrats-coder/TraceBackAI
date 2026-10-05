from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from ..services.database import db
from .auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_user_notifications(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    user_id = user["id"] if user else "usr_student_1"
    notifs = db.get_notifications(user_id)
    unread_count = sum(1 for n in notifs if not n.get("is_read"))
    return {
        "notifications": notifs,
        "unread_count": unread_count
    }

@router.patch("/{notif_id}/read")
def mark_read(notif_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    user_id = user["id"] if user else "usr_student_1"
    ok = db.mark_notification_read(notif_id, user_id)
    return {"success": ok}

@router.post("/read-all")
def mark_all_read(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    user_id = user["id"] if user else "usr_student_1"
    count = db.mark_all_notifications_read(user_id)
    return {"marked_read": count}
