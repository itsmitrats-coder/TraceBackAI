from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class UserRole(str):
    STUDENT = "student"
    STAFF = "staff"
    ADMIN = "admin"

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "student" # student, staff, admin
    department: Optional[str] = "Computer Science"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    created_at: str

class ItemFingerprint(BaseModel):
    object_type: Optional[str] = "Unknown"
    brand: Optional[str] = None
    primary_color: Optional[str] = "Unknown"
    secondary_colors: List[str] = []
    material: Optional[str] = None
    shape_size: Optional[str] = None
    visible_text: List[str] = []
    logos: List[str] = []
    distinctive_marks: List[str] = []
    accessories: List[str] = []
    location: Optional[str] = None
    event_time: Optional[str] = None
    embedding: Optional[List[float]] = None
    confidence: Optional[float] = 85.0

class ComponentScores(BaseModel):
    visual: float = 0.0
    semantic: float = 0.0
    distinctive: float = 0.0
    location: float = 0.0
    time: float = 0.0

class LostItemCreate(BaseModel):
    title: str
    category: str
    description: str
    location: str
    coordinates: Optional[Dict[str, float]] = None
    lost_at: str
    image_url: Optional[str] = None
    private_clue: Optional[str] = None

class LostItem(BaseModel):
    id: str
    user_id: str
    reporter_name: Optional[str] = None
    title: str
    category: str
    description: str
    location: str
    coordinates: Optional[Dict[str, float]] = None
    lost_at: str
    image_url: Optional[str] = None
    private_clue: Optional[str] = None  # Protected: only returned to owner / staff
    fingerprint: Optional[ItemFingerprint] = None
    status: str = "open"  # open, potential_match, claim_pending, verified, recovered, closed
    created_at: str

class LostItemPublic(BaseModel):
    id: str
    user_id: str
    reporter_name: Optional[str] = None
    title: str
    category: str
    description: str
    location: str
    coordinates: Optional[Dict[str, float]] = None
    lost_at: str
    image_url: Optional[str] = None
    fingerprint: Optional[ItemFingerprint] = None
    status: str
    created_at: str

class FoundItemCreate(BaseModel):
    title: str
    category: str
    description: str
    location: str
    coordinates: Optional[Dict[str, float]] = None
    found_at: str
    image_url: Optional[str] = None
    custody_location: Optional[str] = "Campus Security Desk (Main Block)"

class FoundItem(BaseModel):
    id: str
    reported_by: str
    reporter_name: Optional[str] = None
    title: str
    category: str
    description: str
    location: str
    coordinates: Optional[Dict[str, float]] = None
    found_at: str
    image_url: Optional[str] = None
    custody_location: Optional[str] = "Campus Security Desk (Main Block)"
    fingerprint: Optional[ItemFingerprint] = None
    status: str = "open"  # open, potential_match, claim_pending, verified, recovered, closed
    created_at: str

class CandidateMatch(BaseModel):
    id: str
    lost_item_id: str
    found_item_id: str
    overall_score: float
    component_scores: ComponentScores
    supporting_evidence: List[str]
    conflicting_evidence: List[str]
    found_item: FoundItem
    status: str = "pending" # pending, confirmed, dismissed
    created_at: str

class DetectiveQuestion(BaseModel):
    id: str
    lost_item_id: str
    question: str
    attribute: str
    options: List[str] = ["YES", "NO", "I DON'T KNOW"]
    context: str
    candidate_impact: Dict[str, str] = {}

class DetectiveAnswerRequest(BaseModel):
    question_id: str
    answer: str  # "YES", "NO", "I DON'T KNOW"
    notes: Optional[str] = None

class ClaimCreate(BaseModel):
    found_item_id: str
    lost_item_id: Optional[str] = None
    identifying_evidence: str
    proof_image_url: Optional[str] = None

class Claim(BaseModel):
    id: str
    found_item_id: str
    lost_item_id: Optional[str] = None
    claimant_id: str
    claimant_name: str
    claimant_email: str
    identifying_evidence: str
    proof_image_url: Optional[str] = None
    verification_score: float
    verification_summary: str
    verification_alignments: List[str]
    verification_concerns: List[str]
    recommendation: str
    status: str = "claim_pending" # claim_pending, approved, rejected, handed_over
    reviewed_by: Optional[str] = None
    reviewer_name: Optional[str] = None
    review_reason: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: str

class ClaimReviewRequest(BaseModel):
    status: str  # "approved", "rejected", "claim_pending"
    review_reason: str

class HandoverRequest(BaseModel):
    handover_notes: Optional[str] = "Verified student ID and physically handed over item."

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str # match_found, claim_submitted, claim_approved, claim_rejected, item_recovered, nearby_alert
    link: Optional[str] = None
    is_read: bool = False
    created_at: str

class AuditLog(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    actor_role: str
    action: str
    target_type: str # item, claim, handover, fingerprint, match
    target_id: str
    timestamp: str
    metadata: Dict[str, Any] = {}

class CampusLocation(BaseModel):
    id: str
    name: str
    code: str
    category: str
    x: float
    y: float
    description: str
    loss_count: int = 0
    found_count: int = 0
    recovery_rate: float = 0.0

class NaturalSearchRequest(BaseModel):
    query: str

class NaturalSearchResult(BaseModel):
    understood_as: Dict[str, Optional[str]]
    results: List[FoundItem]
