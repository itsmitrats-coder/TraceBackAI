import re
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, Dict, Any, List
from ..models.schemas import (
    ItemFingerprint, LostItem, FoundItem, CandidateMatch,
    DetectiveQuestion, DetectiveAnswerRequest, NaturalSearchRequest, NaturalSearchResult
)
from ..services.database import db
from ..ai.fingerprint_service import FingerprintService
from ..ai.matching_service import MatchingService
from ..ai.detective_service import DetectiveService
from .auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.get("/status")
def get_ai_status():
    return {
        "engine": settings.ai_engine_status,
        "is_live_ai": settings.is_ai_live,
        "weights": {
            "visual": MatchingService.WEIGHT_VISUAL,
            "semantic": MatchingService.WEIGHT_SEMANTIC,
            "distinctive": MatchingService.WEIGHT_DISTINCTIVE,
            "location": MatchingService.WEIGHT_LOCATION,
            "time": MatchingService.WEIGHT_TIME
        }
    }

@router.post("/fingerprint")
async def generate_fingerprint_endpoint(payload: Dict[str, Any]):
    title = payload.get("title", "Item")
    category = payload.get("category", "General")
    description = payload.get("description", "")
    location = payload.get("location", "Campus")
    event_time = payload.get("event_time", "Recent")
    image_url = payload.get("image_url", None)

    fingerprint = await FingerprintService.generate_fingerprint(
        title=title,
        category=category,
        description=description,
        location=location,
        event_time=event_time,
        image_url=image_url
    )
    return fingerprint

@router.post("/match/{item_id}")
async def match_item_candidates(
    item_id: str,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    user_id = user["id"] if user else None
    role = user["role"] if user else None

    lost_raw = db.get_lost_item(item_id, current_user_id=user_id, role=role)
    if not lost_raw:
        raise HTTPException(status_code=404, detail="Lost item report not found")
    
    lost_obj = LostItem(**lost_raw)

    # If fingerprint is missing, generate it now
    if not lost_obj.fingerprint:
        fp = await FingerprintService.generate_fingerprint(
            title=lost_obj.title,
            category=lost_obj.category,
            description=lost_obj.description,
            location=lost_obj.location,
            event_time=lost_obj.lost_at,
            image_url=lost_obj.image_url
        )
        db.update_lost_item(item_id, {"fingerprint": fp.model_dump()})
        lost_obj.fingerprint = fp

    all_found_raw = db.get_found_items()
    # Filter for active found items
    found_candidates = [
        FoundItem(**f) for f in all_found_raw
        if f.get("status") in ["open", "potential_match", "claim_pending"]
    ]

    matches = await MatchingService.match_items(lost_obj, found_candidates)
    return {
        "lost_item_id": item_id,
        "total_candidates": len(matches),
        "matches": matches
    }

@router.get("/clarify/{item_id}")
async def get_clarification_question(
    item_id: str,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    user_id = user["id"] if user else None
    role = user["role"] if user else None

    lost_raw = db.get_lost_item(item_id, current_user_id=user_id, role=role)
    if not lost_raw:
        raise HTTPException(status_code=404, detail="Lost item report not found")
    
    lost_obj = LostItem(**lost_raw)
    all_found_raw = db.get_found_items()
    found_candidates = [FoundItem(**f) for f in all_found_raw if f.get("status") in ["open", "potential_match"]]
    matches = await MatchingService.match_items(lost_obj, found_candidates)

    question = DetectiveService.generate_question(lost_obj, matches)
    return question

@router.post("/clarify/{item_id}")
async def submit_clarification_answer(
    item_id: str,
    answer_req: DetectiveAnswerRequest,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    user_id = user["id"] if user else None
    role = user["role"] if user else None

    lost_raw = db.get_lost_item(item_id, current_user_id=user_id, role=role)
    if not lost_raw:
        raise HTTPException(status_code=404, detail="Lost item report not found")
    
    lost_obj = LostItem(**lost_raw)
    all_found_raw = db.get_found_items()
    found_candidates = [FoundItem(**f) for f in all_found_raw if f.get("status") in ["open", "potential_match"]]

    # Score before answer
    matches_before = await MatchingService.match_items(lost_obj, found_candidates)
    before_scores = {m.id: m.overall_score for m in matches_before}

    # Generate current question context to apply
    question = DetectiveService.generate_question(lost_obj, matches_before)
    
    # Apply answer
    updated_lost = DetectiveService.apply_answer(
        lost_obj,
        question,
        answer_req.answer,
        answer_req.notes
    )

    # Persist updated fingerprint
    if updated_lost.fingerprint:
        db.update_lost_item(item_id, {"fingerprint": updated_lost.fingerprint.model_dump()})

    # Re-evaluate matching candidates
    matches_after = await MatchingService.match_items(updated_lost, found_candidates)

    # Build deltas
    deltas = []
    for m in matches_after:
        prev = before_scores.get(m.id, m.overall_score)
        deltas.append({
            "match_id": m.id,
            "found_item_id": m.found_item_id,
            "title": m.found_item.title,
            "score_before": prev,
            "score_after": m.overall_score,
            "delta": round(m.overall_score - prev, 1)
        })

    explanation = (
        f"Answered '{answer_req.answer}' regarding {question.attribute}. "
        f"TraceBack re-calibrated candidate evidence weights."
    )
    if answer_req.answer == "YES" and deltas:
        top_d = max(deltas, key=lambda d: d["delta"])
        if top_d["delta"] > 0:
            explanation = (
                f"Confirmation of {question.attribute} positively corroborated "
                f"Candidate '{top_d['title']}' (+{top_d['delta']}% confidence boost)."
            )

    db.create_audit_log(
        actor_id=user_id or "usr_student_1",
        actor_name=user["name"] if user else "Alex Rivera",
        actor_role=role or "student",
        action="DETECTIVE_QUESTION_ANSWERED",
        target_type="lost_item",
        target_id=item_id,
        metadata={"answer": answer_req.answer, "attribute": question.attribute}
    )

    return {
        "status": "re_evaluated",
        "answer": answer_req.answer,
        "explanation": explanation,
        "matches": matches_after,
        "score_deltas": deltas,
        "updated_fingerprint": updated_lost.fingerprint
    }

@router.post("/natural-search", response_model=NaturalSearchResult)
def natural_search(query_req: NaturalSearchRequest):
    q = query_req.query.lower()
    
    # NLP entity recognition
    understood: Dict[str, Optional[str]] = {
        "category": None,
        "color": None,
        "location": None,
        "time": None,
        "raw_query": query_req.query
    }
    
    # Category
    for cat in ["bottle", "laptop", "earbuds", "headphones", "keys", "id", "card", "backpack", "bag", "calculator"]:
        if cat in q:
            understood["category"] = cat.title()
            break
            
    # Color
    for col in ["dark green", "green", "black", "silver", "gray", "blue", "navy", "white", "red"]:
        if col in q:
            understood["color"] = col.title()
            break
            
    # Location
    for loc in ["library", "cafeteria", "lab", "academic", "sports", "hostel", "dorm", "auditorium", "parking"]:
        if loc in q:
            understood["location"] = loc.title()
            break
            
    # Time
    for t in ["yesterday", "today", "morning", "afternoon", "recently"]:
        if t in q:
            understood["time"] = t.title()
            break

    # Search items
    all_found = db.get_found_items()
    matched = []
    
    for item in all_found:
        text = f"{item['title']} {item['description']} {item['location']} {item['category']}".lower()
        score = 0
        if understood["category"] and understood["category"].lower() in text:
            score += 3
        if understood["color"] and understood["color"].lower() in text:
            score += 2
        if understood["location"] and understood["location"].lower() in text:
            score += 2
        if understood["time"] and understood["time"].lower() in text:
            score += 1
        # Also keyword match
        tokens = [t for t in q.split() if len(t) > 3]
        for tok in tokens:
            if tok in text:
                score += 1
                
        if score > 0 or not any(understood.values()):
            matched.append((score, item))

    matched.sort(key=lambda x: x[0], reverse=True)
    results = [FoundItem(**m[1]) for m in matched[:10]]
    if not results:
        results = [FoundItem(**f) for f in all_found[:4]]

    return NaturalSearchResult(
        understood_as=understood,
        results=results
    )
