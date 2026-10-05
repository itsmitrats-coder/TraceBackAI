from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, Dict, Any, List
from ..models.schemas import LostItemCreate, LostItem, LostItemPublic, FoundItem
from ..services.database import db
from ..ai.fingerprint_service import FingerprintService
from ..ai.matching_service import MatchingService
from .auth import get_current_user

router = APIRouter(prefix="/lost-items", tags=["Lost Items"])

@router.post("")
async def create_lost_item(
    item_in: LostItemCreate,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    user_id = user["id"] if user else "usr_student_1"
    reporter_name = user["name"] if user else "Alex Rivera"

    # 1. Validate & Persist basic report FIRST (SRS DFD Level 1 Requirement: Save before AI)
    new_report = db.create_lost_item({
        "user_id": user_id,
        "reporter_name": reporter_name,
        "title": item_in.title,
        "category": item_in.category,
        "description": item_in.description,
        "location": item_in.location,
        "coordinates": item_in.coordinates or {"lat": 37.7749, "lng": -122.4194},
        "lost_at": item_in.lost_at,
        "image_url": item_in.image_url,
        "private_clue": item_in.private_clue,  # Protected!
        "status": "open",
        "fingerprint": None
    })

    # 2. Generate AI Item Fingerprint
    fingerprint = await FingerprintService.generate_fingerprint(
        title=item_in.title,
        category=item_in.category,
        description=item_in.description,
        location=item_in.location,
        event_time=item_in.lost_at,
        image_url=item_in.image_url
    )
    
    # Update item with fingerprint
    db.update_lost_item(new_report["id"], {
        "fingerprint": fingerprint.model_dump()
    })
    new_report["fingerprint"] = fingerprint.model_dump()

    # 3. Log Audit
    db.create_audit_log(
        actor_id=user_id,
        actor_name=reporter_name,
        actor_role=user.get("role", "student") if user else "student",
        action="REPORT_LOST_ITEM",
        target_type="lost_item",
        target_id=new_report["id"],
        metadata={"category": item_in.category, "location": item_in.location}
    )

    # 4. Check initial matching candidates to see if notification is warranted
    all_found_raw = db.get_found_items()
    found_candidates = [FoundItem(**f) for f in all_found_raw if f.get("status") in ["open", "potential_match"]]
    lost_obj = LostItem(**new_report)
    matches = await MatchingService.match_items(lost_obj, found_candidates)

    if matches:
        top_match = matches[0]
        if top_match.overall_score >= 75.0:
            db.update_lost_item(new_report["id"], {"status": "potential_match"})
            # Send notification
            db.create_notification({
                "user_id": user_id,
                "title": f"Potential Match Found ({int(top_match.overall_score)}%)",
                "message": f"TraceBack discovered a candidate for your {item_in.title} at {top_match.found_item.location}.",
                "type": "match_found",
                "link": f"/matches/{new_report['id']}"
            })

    return {
        "item": new_report,
        "fingerprint": fingerprint,
        "candidate_count": len(matches),
        "top_match_score": matches[0].overall_score if matches else 0
    }

@router.get("")
def list_lost_items(
    category: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    my_only: bool = False,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    user_id = user.get("id") if user else None
    role = user.get("role") if user else None

    items = db.get_lost_items(current_user_id=user_id, role=role)
    
    if my_only and user_id:
        items = [i for i in items if i.get("user_id") == user_id]
    if category:
        items = [i for i in items if i.get("category", "").lower() == category.lower()]
    if location:
        items = [i for i in items if location.lower() in i.get("location", "").lower()]
    if status:
        items = [i for i in items if i.get("status") == status]

    items.sort(key=lambda i: i.get("created_at", ""), reverse=True)
    return items

@router.get("/{item_id}")
def get_lost_item(
    item_id: str,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    user_id = user.get("id") if user else None
    role = user.get("role") if user else None

    item = db.get_lost_item(item_id, current_user_id=user_id, role=role)
    if not item:
        raise HTTPException(status_code=404, detail="Lost item report not found")
    return item

@router.patch("/{item_id}")
def update_lost_item(
    item_id: str,
    updates: Dict[str, Any],
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Only allow owner or staff/admin to update
    existing = db.get_lost_item(item_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Lost item report not found")
    
    if existing.get("user_id") != user["id"] and user.get("role") not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Guard against modifying private_clue via general patch if unauthorized
    allowed_updates = {k: v for k, v in updates.items() if k in ["status", "description", "location"]}
    updated = db.update_lost_item(item_id, allowed_updates)
    return updated
