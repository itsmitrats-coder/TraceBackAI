from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, Dict, Any, List
from ..models.schemas import FoundItemCreate, FoundItem, LostItem
from ..services.database import db
from ..ai.fingerprint_service import FingerprintService
from ..ai.matching_service import MatchingService
from .auth import get_current_user

router = APIRouter(prefix="/found-items", tags=["Found Items"])

@router.post("")
async def create_found_item(
    item_in: FoundItemCreate,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    reporter_id = user["id"] if user else "usr_staff_1"
    reporter_name = user["name"] if user else "Officer Marcus Vance"

    # 1. Create Found Item record
    new_found = db.create_found_item({
        "reported_by": reporter_id,
        "reporter_name": reporter_name,
        "title": item_in.title,
        "category": item_in.category,
        "description": item_in.description,
        "location": item_in.location,
        "coordinates": item_in.coordinates or {"lat": 37.7749, "lng": -122.4194},
        "found_at": item_in.found_at,
        "image_url": item_in.image_url,
        "custody_location": item_in.custody_location or "Campus Security Desk (Main Block)",
        "status": "open",
        "fingerprint": None
    })

    # 2. Extract AI Fingerprint
    fingerprint = await FingerprintService.generate_fingerprint(
        title=item_in.title,
        category=item_in.category,
        description=item_in.description,
        location=item_in.location,
        event_time=item_in.found_at,
        image_url=item_in.image_url
    )

    db.update_found_item(new_found["id"], {
        "fingerprint": fingerprint.model_dump()
    })
    new_found["fingerprint"] = fingerprint.model_dump()

    # 3. Log Audit
    db.create_audit_log(
        actor_id=reporter_id,
        actor_name=reporter_name,
        actor_role=user.get("role", "staff") if user else "staff",
        action="REPORT_FOUND_ITEM",
        target_type="found_item",
        target_id=new_found["id"],
        metadata={"category": item_in.category, "location": item_in.location}
    )

    # 4. Cross-match against open lost items to notify owners
    active_lost_raw = db.get_lost_items()
    found_obj = FoundItem(**new_found)
    notified_users = []
    
    for l_raw in active_lost_raw:
        if l_raw.get("status") in ["open", "potential_match"]:
            l_obj = LostItem(**l_raw)
            matches = await MatchingService.match_items(l_obj, [found_obj])
            if matches and matches[0].overall_score >= 75.0:
                score = int(matches[0].overall_score)
                db.update_lost_item(l_raw["id"], {"status": "potential_match"})
                db.create_notification({
                    "user_id": l_raw["user_id"],
                    "title": f"New Match Detected ({score}%)",
                    "message": f"A newly found item ({item_in.title}) at {item_in.location} matches your report.",
                    "type": "match_found",
                    "link": f"/matches/{l_raw['id']}"
                })
                notified_users.append(l_raw["user_id"])

    return {
        "item": new_found,
        "fingerprint": fingerprint,
        "notified_owners": len(notified_users)
    }

@router.get("")
def list_found_items(
    category: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    query: Optional[str] = None
):
    items = db.get_found_items()
    
    if query:
        q = query.lower()
        items = [
            i for i in items if
            q in i.get("title", "").lower() or
            q in i.get("description", "").lower() or
            q in i.get("location", "").lower()
        ]
    if category and category != "all":
        items = [i for i in items if i.get("category", "").lower() == category.lower()]
    if location and location != "all":
        items = [i for i in items if location.lower() in i.get("location", "").lower()]
    if status and status != "all":
        items = [i for i in items if i.get("status") == status]

    items.sort(key=lambda i: i.get("created_at", ""), reverse=True)
    return items

@router.get("/{item_id}")
def get_found_item(item_id: str):
    item = db.get_found_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    return item

@router.patch("/{item_id}")
def update_found_item(
    item_id: str,
    updates: Dict[str, Any],
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    if not user or user.get("role") not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Staff or Admin role required")

    updated = db.update_found_item(item_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Found item not found")
        
    db.create_audit_log(
        actor_id=user["id"],
        actor_name=user["name"],
        actor_role=user["role"],
        action="UPDATE_FOUND_ITEM",
        target_type="found_item",
        target_id=item_id,
        metadata={"updates": updates}
    )
    return updated
