import re
import math
from datetime import datetime
from typing import List, Dict, Any, Tuple
from ..models.schemas import LostItem, FoundItem, CandidateMatch, ComponentScores
from .embedding_service import EmbeddingService

class MatchingService:
    # Configurable SRS weights
    WEIGHT_VISUAL = 0.30
    WEIGHT_SEMANTIC = 0.25
    WEIGHT_DISTINCTIVE = 0.20
    WEIGHT_LOCATION = 0.15
    WEIGHT_TIME = 0.10

    # Zone distance matrix (1.0 = same, 0.7 = nearby, 0.4 = far)
    ZONE_PROXIMITY = {
        ("central library", "central library"): 1.0,
        ("central library", "main academic block"): 0.85,
        ("central library", "student cafeteria"): 0.75,
        ("main academic block", "science & computing labs"): 0.90,
        ("main academic block", "auditorium"): 0.85,
        ("student cafeteria", "campus green"): 0.90,
        ("sports complex", "student hostels"): 0.75,
    }

    @classmethod
    async def match_items(
        cls,
        lost: LostItem,
        candidates: List[FoundItem]
    ) -> List[CandidateMatch]:
        matches: List[CandidateMatch] = []
        for found in candidates:
            # If categories are wildly disparate, skip or low score
            if not cls._categories_compatible(lost.category, found.category):
                continue
                
            comp_scores, supporting, conflicting = await cls._evaluate_pair(lost, found)
            
            overall = (
                cls.WEIGHT_VISUAL * comp_scores.visual +
                cls.WEIGHT_SEMANTIC * comp_scores.semantic +
                cls.WEIGHT_DISTINCTIVE * comp_scores.distinctive +
                cls.WEIGHT_LOCATION * comp_scores.location +
                cls.WEIGHT_TIME * comp_scores.time
            )
            overall = round(max(5.0, min(99.0, overall)), 1)

            matches.append(
                CandidateMatch(
                    id=f"match_{lost.id}_{found.id}",
                    lost_item_id=lost.id,
                    found_item_id=found.id,
                    overall_score=overall,
                    component_scores=comp_scores,
                    supporting_evidence=supporting,
                    conflicting_evidence=conflicting,
                    found_item=found,
                    status="pending",
                    created_at=datetime.utcnow().isoformat()
                )
            )

        # Rank candidates highest first
        matches.sort(key=lambda m: m.overall_score, reverse=True)
        return matches

    @classmethod
    def _categories_compatible(cls, cat1: str, cat2: str) -> bool:
        if not cat1 or not cat2:
            return True
        c1, c2 = cat1.lower(), cat2.lower()
        if c1 == c2:
            return True
        # Related aliases
        aliases = [
            {"electronics", "laptop", "audio", "accessories"},
            {"bottles", "accessories"},
            {"bags", "clothing", "accessories"},
            {"id / cards", "keys", "accessories"}
        ]
        for s in aliases:
            if any(k in c1 for k in s) and any(k in c2 for k in s):
                return True
        return False

    @classmethod
    async def _evaluate_pair(
        cls,
        lost: LostItem,
        found: FoundItem
    ) -> Tuple[ComponentScores, List[str], List[str]]:
        supporting: List[str] = []
        conflicting: List[str] = []

        lf = lost.fingerprint
        ff = found.fingerprint

        # 1. Visual Similarity (V)
        visual_score = 65.0
        # Color
        lost_col = (lf.primary_color if lf else "").lower()
        found_col = (ff.primary_color if ff else "").lower()
        if lost_col and found_col and lost_col != "unknown" and found_col != "unknown":
            if lost_col == found_col or any(w in found_col for w in lost_col.split()):
                visual_score += 20.0
                supporting.append(f"Matching color profile ({lf.primary_color})")
            elif ("dark" in lost_col and "dark" in found_col) or ("black" in lost_col and "dark" in found_col):
                visual_score += 15.0
                supporting.append(f"Compatible dark tone hues ({lf.primary_color} vs {ff.primary_color})")
            else:
                visual_score -= 20.0
                conflicting.append(f"Color tone variation ({lf.primary_color} vs {ff.primary_color})")
        else:
            conflicting.append("Color nuance partially unknown")

        # Material & Shape
        if lf and ff:
            if lf.material and ff.material and lf.material.lower() == ff.material.lower():
                visual_score += 10.0
                supporting.append(f"Identical {lf.material} construction")
            if lf.shape_size and ff.shape_size and lf.shape_size.lower() == ff.shape_size.lower():
                visual_score += 10.0
                supporting.append(f"Conforming {lf.shape_size} silhouette")

        visual_score = max(20.0, min(98.0, visual_score))

        # 2. Semantic Description Similarity (S)
        lost_text = f"{lost.title}. {lost.description}"
        found_text = f"{found.title}. {found.description}"
        emb_lost = await EmbeddingService.get_embedding(lost_text)
        emb_found = await EmbeddingService.get_embedding(found_text)
        cos = EmbeddingService.cosine_similarity(emb_lost, emb_found)
        semantic_score = round(cos * 100.0, 1)
        if semantic_score >= 80.0:
            supporting.append(f"High semantic alignment in item descriptions ({semantic_score}%)")
        elif semantic_score < 60.0:
            conflicting.append("Different descriptive terminology used in reports")

        # 3. Distinctive Features (F)
        distinctive_score = 55.0
        # Brand comparison
        l_brand = lf.brand if lf else None
        f_brand = ff.brand if ff else None
        if l_brand and f_brand:
            if l_brand.lower() == f_brand.lower():
                distinctive_score += 25.0
                supporting.append(f"Confirmed brand match: {l_brand}")
            else:
                distinctive_score -= 30.0
                conflicting.append(f"Brand disparity ({l_brand} vs {f_brand})")
        elif l_brand and not f_brand:
            conflicting.append(f"Brand '{l_brand}' not yet identified on found item")
        elif not l_brand and f_brand:
            supporting.append(f"Candidate carries confirmed brand: {f_brand}")

        # Marks comparison
        l_marks = lf.distinctive_marks if lf else []
        f_marks = ff.distinctive_marks if ff else []
        marks_matched = False
        for lm in l_marks:
            for fm in f_marks:
                if any(w in fm.lower() for w in lm.lower().split() if len(w) > 3):
                    distinctive_score += 20.0
                    supporting.append(f"Distinctive marking match: {lm}")
                    marks_matched = True
                    break
        if not marks_matched and (l_marks or f_marks):
            conflicting.append("Unique marks / decals still require cross-examination")

        distinctive_score = max(15.0, min(98.0, distinctive_score))

        # 4. Location Proximity (L)
        loc_score = 50.0
        l_loc = (lost.location or "").lower()
        f_loc = (found.location or "").lower()
        
        # Check zone match
        matched_zone = False
        for zone in ["library", "academic", "cafeteria", "lab", "sports", "hostel", "auditorium", "quad", "parking"]:
            if zone in l_loc and zone in f_loc:
                loc_score = 92.0
                supporting.append(f"Same campus zone ({lost.location})")
                matched_zone = True
                break
        
        if not matched_zone:
            # Check proximity table
            for (z1, z2), weight in cls.ZONE_PROXIMITY.items():
                if (z1 in l_loc and z2 in f_loc) or (z2 in l_loc and z1 in f_loc):
                    loc_score = weight * 100.0
                    supporting.append(f"Adjacent campus sectors ({lost.location} ~ {found.location})")
                    matched_zone = True
                    break
        
        if not matched_zone:
            loc_score = 45.0
            conflicting.append(f"Dispersed campus zones ({lost.location} vs {found.location})")

        # 5. Time Proximity (T)
        time_score = 75.0
        try:
            # Heuristic time comparison
            l_t = lost.lost_at.lower()
            f_t = found.found_at.lower()
            if "today" in l_t and "today" in f_t:
                time_score = 95.0
                supporting.append("Found on the same day within immediate recovery window")
            elif "yesterday" in l_t or "yesterday" in f_t:
                time_score = 85.0
                supporting.append("Found within 24-hour temporal proximity")
            elif "2 hours" in f_t or "hour" in f_t:
                time_score = 92.0
                supporting.append("Discovered shortly after reported loss")
            else:
                time_score = 70.0
        except Exception:
            time_score = 75.0

        comp = ComponentScores(
            visual=round(visual_score, 1),
            semantic=round(semantic_score, 1),
            distinctive=round(distinctive_score, 1),
            location=round(loc_score, 1),
            time=round(time_score, 1)
        )
        return comp, supporting, conflicting
