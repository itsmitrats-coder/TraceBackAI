from fastapi import APIRouter
from typing import List, Dict, Any
from ..services.database import db

router = APIRouter(prefix="/heatmap", tags=["Campus Heatmap"])

@router.get("")
def get_heatmap_data():
    locations = db.get_campus_locations()
    lost_items = db.get_lost_items()
    found_items = db.get_found_items()

    # Map items to locations
    enriched_locations = []
    max_count = 1
    
    for loc in locations:
        loc_name = loc["name"].lower()
        loc_lost = [l for l in lost_items if loc_name in l.get("location", "").lower()]
        loc_found = [f for f in found_items if loc_name in f.get("location", "").lower()]
        
        total_reports = len(loc_lost) + len(loc_found) + loc.get("loss_count", 0)
        if total_reports > max_count:
            max_count = total_reports

        enriched_locations.append({
            **loc,
            "active_lost_reports": len(loc_lost),
            "active_found_reports": len(loc_found),
            "total_incidents": total_reports,
            "intensity": round(total_reports / 20.0, 2)  # 0.0 - 1.0 intensity scale
        })

    # Sort by total incident density
    enriched_locations.sort(key=lambda l: l["total_incidents"], reverse=True)

    # Top hotspot zones
    hotspots = [
        {
            "zone": loc["name"],
            "code": loc["code"],
            "count": loc["total_incidents"],
            "primary_lost_category": "Bottles" if "Library" in loc["name"] else "Electronics"
        }
        for loc in enriched_locations[:5]
    ]

    return {
        "locations": enriched_locations,
        "hotspots": hotspots,
        "max_density": max_count,
        "campus_meta": {
            "name": "Main University Campus",
            "active_zones": len(locations),
            "safest_zone": "North Parking Area",
            "highest_risk_zone": enriched_locations[0]["name"] if enriched_locations else "Central Library"
        }
    }
