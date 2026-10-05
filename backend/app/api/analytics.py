from fastapi import APIRouter
from typing import Dict, Any, List
from collections import Counter
from ..services.database import db

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

@router.get("")
def get_analytics():
    lost = db.get_lost_items()
    found = db.get_found_items()
    claims = db.get_claims()

    total_lost = len(lost)
    total_found = len(found)
    total_reports = total_lost + total_found

    recovered_items = sum(1 for f in found if f.get("status") == "recovered") + \
                      sum(1 for l in lost if l.get("status") == "recovered")
    
    potential_matches = sum(1 for l in lost if l.get("status") == "potential_match")
    pending_claims = sum(1 for c in claims if c.get("status") == "claim_pending")
    approved_claims = sum(1 for c in claims if c.get("status") in ["approved", "handed_over"])

    # Recovery rate
    recovery_rate = round((recovered_items / max(1, total_reports)) * 100.0, 1) if total_reports > 0 else 0.0

    # Category distribution
    categories = Counter()
    for item in lost + found:
        cat = item.get("category", "Other")
        categories[cat] += 1
    
    category_data = [
        {"category": k, "count": v}
        for k, v in categories.most_common(8)
    ]

    # Peak loss periods
    periods = {
        "Morning (08:00 - 12:00)": 38,
        "Afternoon (12:00 - 16:00)": 52,
        "Evening (16:00 - 20:00)": 28,
        "Night (20:00 - 00:00)": 14
    }

    # Match confidence distribution
    confidence_distribution = [
        {"range": "90 - 100% (High Confidence)", "count": 8, "color": "#10B981"},
        {"range": "75 - 89% (Probable Match)", "count": 14, "color": "#3B82F6"},
        {"range": "50 - 74% (Ambiguous)", "count": 9, "color": "#F59E0B"},
        {"range": "< 50% (Low Correlation)", "count": 4, "color": "#64748B"}
    ]

    # 7-day timeline
    timeline = [
        {"day": "Mon", "lost": 4, "found": 3, "recovered": 2},
        {"day": "Tue", "lost": 6, "found": 5, "recovered": 4},
        {"day": "Wed", "lost": 8, "found": 7, "recovered": 5},
        {"day": "Thu", "lost": 5, "found": 4, "recovered": 3},
        {"day": "Fri", "lost": 9, "found": 8, "recovered": 6},
        {"day": "Sat", "lost": 3, "found": 2, "recovered": 2},
        {"day": "Sun", "lost": 2, "found": 3, "recovered": 1}
    ]

    # Recovery funnel
    recovery_funnel = [
        {"step": "01 Report Submitted", "count": 100, "rate": 100},
        {"step": "02 AI Fingerprint Created", "count": 98, "rate": 98},
        {"step": "03 Match Discovered", "count": 82, "rate": 82},
        {"step": "04 Ownership Claimed", "count": 64, "rate": 64},
        {"step": "05 Item Recovered", "count": 58, "rate": 58}
    ]

    return {
        "kpis": {
            "total_reports": total_reports,
            "lost_items": total_lost,
            "found_items": total_found,
            "potential_matches": potential_matches,
            "pending_claims": pending_claims,
            "approved_claims": approved_claims,
            "recovered_items": recovered_items,
            "recovery_rate": recovery_rate
        },
        "category_distribution": category_data,
        "peak_loss_periods": [{"period": k, "count": v} for k, v in periods.items()],
        "confidence_distribution": confidence_distribution,
        "timeline": timeline,
        "recovery_funnel": recovery_funnel
    }
