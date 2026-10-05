from typing import List, Dict, Any, Optional
from ..models.schemas import LostItem, CandidateMatch, DetectiveQuestion

class DetectiveService:
    @classmethod
    def generate_question(
        cls,
        lost: LostItem,
        candidates: List[CandidateMatch]
    ) -> DetectiveQuestion:
        if not candidates:
            return DetectiveQuestion(
                id=f"q_{lost.id}_general",
                lost_item_id=lost.id,
                question="Can you recall any unique sticker, scratch, or accessory attached to this item?",
                attribute="distinctive_mark",
                options=["YES", "NO", "I DON'T KNOW"],
                context="TraceBack needs an additional distinguishing clue to differentiate potential items."
            )

        # Inspect top candidates for distinguishing attributes
        top_found = [c.found_item for c in candidates[:3]]
        
        # Check distinctive marks
        for idx, f in enumerate(top_found):
            ff = f.fingerprint
            if ff and ff.distinctive_marks:
                mark = ff.distinctive_marks[0]
                return DetectiveQuestion(
                    id=f"q_{lost.id}_mark_{idx}",
                    lost_item_id=lost.id,
                    question=f"Do you remember whether your {lost.category.lower() if lost.category else 'item'} has {mark.lower()}?",
                    attribute=f"mark:{mark}",
                    options=["YES", "NO", "I DON'T KNOW"],
                    context=f"Candidate #{idx+1} ({f.title}) located at {f.location} has this specific feature.",
                    candidate_impact={
                        candidates[idx].id: "Substantial confidence boost if confirmed"
                    }
                )

        # Check brands
        for idx, f in enumerate(top_found):
            ff = f.fingerprint
            if ff and ff.brand and (not lost.fingerprint or not lost.fingerprint.brand):
                return DetectiveQuestion(
                    id=f"q_{lost.id}_brand_{idx}",
                    lost_item_id=lost.id,
                    question=f"Was your {lost.category.lower()} manufactured by {ff.brand}?",
                    attribute=f"brand:{ff.brand}",
                    options=["YES", "NO", "I DON'T KNOW"],
                    context=f"A candidate found at {f.location} has the brand {ff.brand}.",
                    candidate_impact={
                        candidates[idx].id: "Direct brand verification"
                    }
                )

        # Check accessories
        for idx, f in enumerate(top_found):
            ff = f.fingerprint
            if ff and ff.accessories:
                acc = ff.accessories[0]
                return DetectiveQuestion(
                    id=f"q_{lost.id}_acc_{idx}",
                    lost_item_id=lost.id,
                    question=f"Did your item include or have attached a {acc.lower()}?",
                    attribute=f"accessory:{acc}",
                    options=["YES", "NO", "I DON'T KNOW"],
                    context=f"Candidate #{idx+1} was found with an attached {acc.lower()}.",
                    candidate_impact={
                        candidates[idx].id: "Accessories correlation boost"
                    }
                )

        # Default fallback targeted question
        return DetectiveQuestion(
            id=f"q_{lost.id}_marking",
            lost_item_id=lost.id,
            question="Does your item have any visible engraved initials, adhesive sticker, or noticeable scratch?",
            attribute="distinctive_detail",
            options=["YES", "NO", "I DON'T KNOW"],
            context="Resolving unique surface details will allow TraceBack to lock onto the correct item."
        )

    @classmethod
    def apply_answer(
        cls,
        lost: LostItem,
        question: DetectiveQuestion,
        answer: str,
        notes: Optional[str] = None
    ) -> LostItem:
        if not lost.fingerprint:
            return lost

        attr = question.attribute
        if answer == "YES":
            if attr.startswith("mark:"):
                val = attr.replace("mark:", "").strip()
                if val not in lost.fingerprint.distinctive_marks:
                    lost.fingerprint.distinctive_marks.append(val)
            elif attr.startswith("brand:"):
                lost.fingerprint.brand = attr.replace("brand:", "").strip()
            elif attr.startswith("accessory:"):
                val = attr.replace("accessory:", "").strip()
                if val not in lost.fingerprint.accessories:
                    lost.fingerprint.accessories.append(val)
            elif notes:
                lost.fingerprint.distinctive_marks.append(notes.strip())

        elif answer == "NO":
            # If user explicitly said NO, note the exclusion in distinctive marks or description
            if attr.startswith("brand:"):
                # Make sure it doesn't match that brand
                if lost.fingerprint.brand == attr.replace("brand:", "").strip():
                    lost.fingerprint.brand = "Non-" + attr.replace("brand:", "").strip()
            elif attr.startswith("mark:"):
                val = attr.replace("mark:", "").strip()
                # Remove if present
                lost.fingerprint.distinctive_marks = [
                    m for m in lost.fingerprint.distinctive_marks if val.lower() not in m.lower()
                ]

        return lost
