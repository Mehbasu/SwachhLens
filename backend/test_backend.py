import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))

from main import app
from seed_data import seed_database

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
    print("[PASS] GET /health")

def test_seed_and_list_complaints():
    seed_database()
    res = client.get("/complaints")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 18
    print(f"[PASS] GET /complaints (count: {len(data)})")

def test_get_single_complaint():
    res = client.get("/complaints/COMP-2026-001")
    assert res.status_code == 200
    item = res.json()
    assert item["id"] == "COMP-2026-001"
    assert item["category"] == "overflowing_bin"
    print("[PASS] GET /complaints/COMP-2026-001")

def test_create_complaint_with_image():
    # Dummy image content
    image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xFF\xDB\x00C\x00"
    
    files = {
        "image": ("test_dump.jpg", image_bytes, "image/jpeg")
    }
    data = {
        "lat": "25.6260",
        "lng": "85.1120",
        "comment": "Test medical waste dumped near hospital",
        "address": "Kurji Hospital Lane, Patna",
        "category": "hazardous_waste",
        "volume": "small"
    }

    res = client.post("/complaints", files=files, data=data)
    assert res.status_code == 201
    created = res.json()
    assert "id" in created
    assert created["category"] == "hazardous_waste"
    assert created["volume"] == "small"
    assert created["priority_score"] > 0
    assert "image_url" in created
    assert created["comment"] == "Test medical waste dumped near hospital"
    assert created["reporter_comment"] == "Test medical waste dumped near hospital"
    print(f"[PASS] POST /complaints created ID: {created['id']}")

def test_patch_status():
    payload = {
        "status": "in_progress",
        "assigned_team": "Patna Special Bio-Hazard Squad"
    }
    res = client.patch("/complaints/COMP-2026-001/status", json=payload)
    assert res.status_code == 200
    updated = res.json()
    assert updated["status"] == "in_progress"
    assert updated["assigned_team"] == "Patna Special Bio-Hazard Squad"
    print("[PASS] PATCH /complaints/COMP-2026-001/status")

def test_hotspots():
    res = client.get("/complaints/hotspots")
    assert res.status_code == 200
    hotspots = res.json()
    assert isinstance(hotspots, list)
    assert len(hotspots) > 0
    print(f"[PASS] GET /complaints/hotspots (returned {len(hotspots)} clusters)")

def test_analytics_summary():
    res = client.get("/analytics/summary")
    assert res.status_code == 200
    summary = res.json()
    assert "total" in summary
    assert "by_status" in summary
    assert "by_category" in summary
    assert "urgent_count" in summary
    print(f"[PASS] GET /analytics/summary: {summary}")

def test_404_not_found():
    res = client.get("/complaints/NON_EXISTENT_ID")
    assert res.status_code == 404
    print("[PASS] GET /complaints/NON_EXISTENT_ID returns 404")

if __name__ == "__main__":
    print("--- RUNNING SWACHHLENS BACKEND TEST SUITE ---")
    test_health()
    test_seed_and_list_complaints()
    test_get_single_complaint()
    test_create_complaint_with_image()
    test_patch_status()
    test_hotspots()
    test_analytics_summary()
    test_404_not_found()
    print("--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---")
