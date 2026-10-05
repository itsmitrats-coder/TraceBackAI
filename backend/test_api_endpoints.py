import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app
from app.services.database import db

client = TestClient(app)

def run_all_tests():
    print("=== STARTING TRACEBACK AI BACKEND SUITE ===")
    
    # 1. Health
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ 1. Health check passed:", res.json())

    # 2. Auth - Demo users & login
    res = client.get("/api/auth/demo-users")
    assert res.status_code == 200 and len(res.json()) == 3
    print("✓ 2. Demo users endpoint returned 3 personas")

    # Student login
    res = client.post("/api/auth/login", json={"email": "student@traceback.demo", "password": "password123"})
    assert res.status_code == 200
    student_token = res.json()["token"]
    print("✓ 3. Student authenticated successfully, token:", student_token)

    # Staff login
    res = client.post("/api/auth/login", json={"email": "staff@traceback.demo", "password": "password123"})
    assert res.status_code == 200
    staff_token = res.json()["token"]
    print("✓ 4. Staff authenticated successfully")

    # 3. Lost Items - Security & Private Clue Guard
    # Public request (no auth)
    res = client.get("/api/lost-items")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    for it in items:
        assert it.get("private_clue") is None, "SECURITY FAILURE: private_clue leaked in unauthenticated request!"
    print("✓ 5. SECURITY CHECK PASSED: Private clues completely redacted from public listings")

    # Owner request
    res = client.get("/api/lost-items", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    owner_items = res.json()
    # Check that owner can see their own private clue
    has_own_clue = any(it.get("private_clue") is not None for it in owner_items if it.get("user_id") == "usr_student_1")
    assert has_own_clue, "Owner should see their own private clue"
    print("✓ 6. SECURITY CHECK PASSED: Owner receives their own protected private clue")

    # 4. Report Lost Item with AI Fingerprint & Auto-Match
    new_lost_payload = {
        "title": "Dark Green Insulated Bottle",
        "category": "Bottles",
        "description": "Lost my tall green metal vacuum bottle with black flex cap near the 2nd floor library.",
        "location": "Central Library",
        "lost_at": "Yesterday, 3:00 PM",
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
        "private_clue": "Underneath the base there is a NASA astronaut decal."
    }
    res = client.post("/api/lost-items", json=new_lost_payload, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    created_lost = res.json()
    assert created_lost["fingerprint"] is not None
    assert created_lost["candidate_count"] > 0
    print(f"✓ 7. Report Lost Item created with AI Fingerprint (Confidence: {created_lost['fingerprint']['confidence']}%) and {created_lost['candidate_count']} candidate matches")
    new_lost_id = created_lost["item"]["id"]

    # 5. Matching Engine
    res = client.post(f"/api/ai/match/{new_lost_id}", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    match_data = res.json()
    top_match = match_data["matches"][0]
    print(f"✓ 8. Matching Engine scored top candidate at {top_match['overall_score']}% overall:")
    print(f"     - Visual: {top_match['component_scores']['visual']}%")
    print(f"     - Semantic: {top_match['component_scores']['semantic']}%")
    print(f"     - Distinctive: {top_match['component_scores']['distinctive']}%")
    print(f"     - Location: {top_match['component_scores']['location']}%")
    print(f"     - Time: {top_match['component_scores']['time']}%")
    print(f"     - Supporting Evidence: {top_match['supporting_evidence']}")

    # 6. AI Detective Mode
    res = client.get(f"/api/ai/clarify/{new_lost_id}", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    question = res.json()
    print("✓ 9. AI Detective Mode generated clarification question:")
    print(f"     '{question['question']}' (Attribute: {question['attribute']})")

    # Answer YES to Detective Question
    res = client.post(f"/api/ai/clarify/{new_lost_id}", json={
        "question_id": question["id"],
        "answer": "YES",
        "notes": "Yes, it has a white sticker"
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    clarify_res = res.json()
    assert clarify_res["status"] == "re_evaluated"
    print(f"✓ 10. Detective Mode Re-evaluation: {clarify_res['explanation']}")

    # 7. Natural Language Search
    res = client.post("/api/ai/natural-search", json={"query": "black bottle found near library yesterday"})
    assert res.status_code == 200
    ns_data = res.json()
    print("✓ 11. Natural Language Search understood query as:", ns_data["understood_as"])
    assert len(ns_data["results"]) > 0

    # 8. Submit Claim with Identifying Evidence
    claim_payload = {
        "found_item_id": top_match["found_item_id"],
        "lost_item_id": new_lost_id,
        "identifying_evidence": "My bottle has a NASA astronaut decal sticker near the base and a tiny scratch."
    }
    res = client.post("/api/claims", json=claim_payload, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    claim_res = res.json()
    assert claim_res["verification_score"] >= 80.0
    print(f"✓ 12. Claim submitted with AI Verification Assistance: {claim_res['verification_score']}%")
    print(f"     Summary: {claim_res['verification_summary']}")
    print(f"     Alignments: {claim_res['verification_alignments']}")
    new_claim_id = claim_res["id"]

    # 9. Staff Review Claim (Approve)
    res = client.patch(f"/api/claims/{new_claim_id}", json={
        "status": "approved",
        "review_reason": "Student provided physical verification of decal; confirmed matching custody item."
    }, headers={"Authorization": f"Bearer {staff_token}"})
    assert res.status_code == 200
    print("✓ 13. Staff approved claim with recorded rationale")

    # 10. Staff Handover Execution -> Recovered
    res = client.post(f"/api/claims/{new_claim_id}/handover", json={
        "handover_notes": "Student showed ID and picked up from Central Library bin A-14."
    }, headers={"Authorization": f"Bearer {staff_token}"})
    assert res.status_code == 200
    assert res.json()["status"] == "recovered"
    print("✓ 14. Handover completed! Item marked RECOVERED ✓")

    # 11. Notifications
    res = client.get("/api/notifications", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    notifs = res.json()
    print(f"✓ 15. Notifications received: {len(notifs['notifications'])} items (Unread: {notifs['unread_count']})")

    # 12. Analytics & Heatmap
    res = client.get("/api/analytics")
    assert res.status_code == 200
    analytics = res.json()
    print("✓ 16. Analytics KPIs:", analytics["kpis"])

    res = client.get("/api/heatmap")
    assert res.status_code == 200
    heatmap = res.json()
    print(f"✓ 17. Campus Heatmap retrieved with {len(heatmap['locations'])} campus zones")

    # 13. Audit Trail
    res = client.get("/api/audit-logs", headers={"Authorization": f"Bearer {staff_token}"})
    assert res.status_code == 200
    audit_logs = res.json()
    print(f"✓ 18. Audit trail verified with {len(audit_logs)} accountable events")

    print("\n🎉 ALL 18 END-TO-END BACKEND INTEGRATION TESTS PASSED PERFECTLY! 🎉")

if __name__ == "__main__":
    run_all_tests()
