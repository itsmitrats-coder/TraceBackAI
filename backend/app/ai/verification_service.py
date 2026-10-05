from typing import Optional, Dict, Any, List, Tuple
from ..models.schemas import FoundItem, LostItem
from .embedding_service import EmbeddingService

class VerificationService:
    @classmethod
    async def evaluate_claim(
        cls,
        found_item: FoundItem,
        lost_item: Optional[LostItem],
        claimant_evidence: str
    ) -> Dict[str, Any]:
        alignments: List[str] = []
        concerns: List[str] = []
        evidence_lower = claimant_evidence.lower()
        score = 50.0

        # Check against private clue if lost item exists
        private_clue = (lost_item.private_clue if lost_item else "") or ""
        clue_lower = private_clue.lower()

        if private_clue:
            # Check for shared key phrases/words between claimant evidence and secret clue
            clue_words = [w for w in clue_lower.split() if len(w) > 3 and w not in ["with", "have", "that", "this", "some", "item"]]
            matched_words = [w for w in clue_words if w in evidence_lower]
            
            if len(matched_words) >= 2:
                score += 35.0
                alignments.append("High correlation with protected owner private clue")
            elif len(matched_words) == 1:
                score += 20.0
                alignments.append("Partial alignment with protected private ownership details")
            else:
                score -= 15.0
                concerns.append("Claimant evidence does not mention key protected ownership elements")

        # Check against found item distinctive marks
        if found_item.fingerprint and found_item.fingerprint.distinctive_marks:
            for mark in found_item.fingerprint.distinctive_marks:
                mark_words = [w for w in mark.lower().split() if len(w) > 3]
                if any(w in evidence_lower for w in mark_words):
                    score += 25.0
                    alignments.append(f"Correctly identified physical detail: {mark}")
                else:
                    concerns.append(f"Physical detail '{mark}' was not corroborated in claim text")

        # Check brand mention
        if found_item.fingerprint and found_item.fingerprint.brand:
            if found_item.fingerprint.brand.lower() in evidence_lower:
                score += 15.0
                alignments.append(f"Confirmed manufacturer / brand: {found_item.fingerprint.brand}")

        # Semantic relevance
        emb_evidence = await EmbeddingService.get_embedding(claimant_evidence)
        emb_target = await EmbeddingService.get_embedding(f"{found_item.title} {found_item.description} {private_clue}")
        cos = EmbeddingService.cosine_similarity(emb_evidence, emb_target)
        if cos > 0.7:
            score += 10.0
            alignments.append("Semantic coherence with known item specifics")
        elif cos < 0.4:
            score -= 20.0
            concerns.append("Low semantic correlation between claim statement and verified item record")

        final_score = round(max(10.0, min(98.0, score)), 1)

        # Recommendation logic
        if final_score >= 80.0:
            rec = "RECOMMEND APPROVAL: Strong corroboration with private evidence"
            summary = "The claimant provided specific identifying information aligning closely with the protected ownership clue."
        elif final_score >= 60.0:
            rec = "MANUAL REVIEW REQUIRED: Partial corroboration"
            summary = "Claimant provided plausible details, but staff should verify photo ID or ask for additional physical proof."
        else:
            rec = "RECOMMEND REJECTION: Insufficient or conflicting evidence"
            summary = "Claim statement failed to corroborate private identifying marks; high risk of incorrect claim."

        if not alignments:
            alignments.append("Claimant submitted general descriptive testimony")

        return {
            "verification_score": final_score,
            "verification_summary": summary,
            "verification_alignments": alignments,
            "verification_concerns": concerns,
            "recommendation": rec
        }
