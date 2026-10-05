from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, Dict, Any, List
from ..models.schemas import ClaimCreate, Claim, ClaimReviewRequest, HandoverRequest, LostItem, FoundItem
from ..services.database import db
from ..ai.verification_service import VerificationService
from .auth import get_current_user

router = APIRouter(prefix="/claims", tags=["Claims & Ownership Verification"])

@router.post("")
async def submit_claim(
    claim_in: ClaimCreate,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    claimant_id = user["id"] if user else "usr_student_1"
    claimant_name = user["name"] if user else "Alex Rivera"
    claimant_email = user["email"] if user else "student@traceback.demo"

    # Find target found item
    found_raw = db.get_found_item(claim_in.found_item_id)
    if not found_raw:
        raise HTTPException(status_code=404, detail="Found item not found")
    found_obj = FoundItem(**found_raw)

    # Optional linked lost item
    lost_obj = None
    if claim_in.lost_item_id:
        lost_raw = db.get_lost_item(claim_in.lost_item_id, current_user_id=claimant_id, role="staff")
        if lost_raw:
            lost_obj = LostItem(**lost_raw)

    # AI Verification Evaluation
    eval_result = await VerificationService.evaluate_claim(
        found_item=found_obj,
        lost_item=lost_obj,
        claimant_evidence=claim_in.identifying_evidence
    )

    new_claim = db.create_claim({
        "found_item_id": claim_in.found_item_id,
        "lost_item_id": claim_in.lost_item_id,
        "claimant_id": claimant_id,
        "claimant_name": claimant_name,
        "claimant_email": claimant_email,
        "identifying_evidence": claim_in.identifying_evidence,
        "proof_image_url": claim_in.proof_image_url,
        "verification_score": eval_result["verification_score"],
        "verification_summary": eval_result["verification_summary"],
        "verification_alignments": eval_result["verification_alignments"],
        "verification_concerns": eval_result["verification_concerns"],
        "recommendation": eval_result["recommendation"],
        "status": "claim_pending",
        "reviewed_by": None,
        "reviewer_name": None,
        "review_reason": None,
        "reviewed_at": None
    })

    # Notify student
    db.create_notification({
        "user_id": claimant_id,
        "title": "Claim Submitted",
        "message": f"Your claim for '{found_obj.title}' is pending campus staff review.",
        "type": "claim_submitted",
        "link": "/claims"
    })

    # Notify staff members
    for u in db.data.get("users", []):
        if u.get("role") in ["staff", "admin"]:
            db.create_notification({
                "user_id": u["id"],
                "title": "New Claim Pending Review",
                "message": f"{claimant_name} submitted a claim for '{found_obj.title}'. AI Confidence: {eval_result['verification_score']}%",
                "type": "claim_submitted",
                "link": f"/staff"
            })

    # Audit log
    db.create_audit_log(
        actor_id=claimant_id,
        actor_name=claimant_name,
        actor_role=user.get("role", "student") if user else "student",
        action="SUBMIT_CLAIM",
        target_type="claim",
        target_id=new_claim["id"],
        metadata={
            "found_item_id": claim_in.found_item_id,
            "verification_score": eval_result["verification_score"]
        }
    )

    return new_claim

@router.get("")
def list_claims(
    status: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    user_id = user["id"] if user else None
    role = user.get("role", "student") if user else "student"

    if role in ["staff", "admin"]:
        claims = db.get_claims()
    else:
        claims = db.get_claims(claimant_id=user_id)

    if status and status != "all":
        claims = [c for c in claims if c.get("status") == status]

    claims.sort(key=lambda c: c.get("created_at", ""), reverse=True)
    return claims

@router.get("/{claim_id}")
def get_claim_detail(
    claim_id: str,
    authorization: Optional[str] = Header(None)
):
    claim = db.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    user = get_current_user(authorization)
    if user and user.get("role") not in ["staff", "admin"]:
        if claim.get("claimant_id") != user.get("id"):
            raise HTTPException(status_code=403, detail="Access denied")

    # Attach item info
    found_item = db.get_found_item(claim.get("found_item_id"))
    return {
        "claim": claim,
        "found_item": found_item
    }

@router.patch("/{claim_id}")
def review_claim(
    claim_id: str,
    review_req: ClaimReviewRequest,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    if not user or user.get("role") not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Staff or Admin role required")

    claim = db.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if not review_req.review_reason or len(review_req.review_reason.strip()) < 3:
        raise HTTPException(status_code=400, detail="A detailed review reason is required")

    updates = {
        "status": review_req.status,
        "reviewed_by": user["id"],
        "reviewer_name": user["name"],
        "review_reason": review_req.review_reason.strip(),
        "reviewed_at": datetime.utcnow().isoformat()
    }
    updated = db.update_claim(claim_id, updates)

    # If approved or rejected, update target found item status
    found_item_status = "verified" if review_req.status == "approved" else "open"
    db.update_found_item(claim["found_item_id"], {"status": found_item_status})

    if claim.get("lost_item_id"):
        lost_item_status = "verified" if review_req.status == "approved" else "open"
        db.update_lost_item(claim["lost_item_id"], {"status": lost_item_status})

    # Dispatch notification to claimant
    if review_req.status == "approved":
        db.create_notification({
            "user_id": claim["claimant_id"],
            "title": "Claim Approved!",
            "message": f"Your claim was approved by {user['name']}. Please proceed to campus custody for collection.",
            "type": "claim_approved",
            "link": "/claims"
        })
    else:
        db.create_notification({
            "user_id": claim["claimant_id"],
            "title": "Claim Update: Review Decision",
            "message": f"Your claim status: {review_req.status}. Reason: {review_req.review_reason}",
            "type": "claim_rejected",
            "link": "/claims"
        })

    # Audit log
    db.create_audit_log(
        actor_id=user["id"],
        actor_name=user["name"],
        actor_role=user["role"],
        action=f"CLAIM_{review_req.status.upper()}",
        target_type="claim",
        target_id=claim_id,
        metadata={
            "reason": review_req.review_reason,
            "claimant_id": claim["claimant_id"],
            "found_item_id": claim["found_item_id"]
        }
    )

    return updated

@router.post("/{claim_id}/handover")
def mark_handover(
    claim_id: str,
    handover_req: HandoverRequest,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    if not user or user.get("role") not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Staff or Admin role required")

    claim = db.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Mark as handed over
    updated_claim = db.update_claim(claim_id, {
        "status": "handed_over",
        "handover_by": user["name"],
        "handover_at": datetime.utcnow().isoformat(),
        "handover_notes": handover_req.handover_notes
    })

    # Mark found item as recovered
    db.update_found_item(claim["found_item_id"], {"status": "recovered"})
    
    # Mark lost item as recovered
    if claim.get("lost_item_id"):
        db.update_lost_item(claim["lost_item_id"], {"status": "recovered"})

    # Send celebration notification to student
    db.create_notification({
        "user_id": claim["claimant_id"],
        "title": "Item Recovered! ✓",
        "message": f"Your item has been successfully handed over by {user['name']}. Another trace completed!",
        "type": "item_recovered",
        "link": "/my-reports"
    })

    # Audit log
    db.create_audit_log(
        actor_id=user["id"],
        actor_name=user["name"],
        actor_role=user["role"],
        action="MARK_RECOVERED",
        target_type="item",
        target_id=claim["found_item_id"],
        metadata={
            "claim_id": claim_id,
            "recipient": claim["claimant_name"],
            "notes": handover_req.handover_notes
        }
    )

    return {
        "status": "recovered",
        "message": "Item successfully marked as recovered",
        "claim": updated_claim
    }
