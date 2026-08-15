import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Request

from db.database import db
from models.complaint import ComplaintResponse, StatusUpdate, Hotspot, AnalyticsSummary
from services.upload_service import save_upload_file
from services.ai_service import classify_waste
from services.duplicate_service import check_duplicate
from services.priority_service import calculate_priority
from services.recommendation_service import get_recommended_action

router = APIRouter()

# TODO: Add Authentication Middleware (e.g. OAuth2/JWT) for production security

@router.post("/complaints", response_model=ComplaintResponse, status_code=201)
async def create_complaint(
    request: Request,
    image: UploadFile = File(...),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    gps: Optional[str] = Form(None),
    comment: Optional[str] = Form(""),
    address: Optional[str] = Form(""),
    category: Optional[str] = Form(None),
    volume: Optional[str] = Form(None)
):
    """
    Creates a new waste complaint with automated AI vision classification,
    duplicate detection, priority scoring, and operational action recommendation.
    """
    # 1. Parse GPS location
    final_lat, final_lng = 25.6093, 85.1235  # Default Patna coordinates
    if lat is not None and lng is not None:
        final_lat, final_lng = float(lat), float(lng)
    elif gps:
        try:
            gps_obj = json.loads(gps)
            final_lat = float(gps_obj.get("lat", final_lat))
            final_lng = float(gps_obj.get("lng", final_lng))
        except Exception:
            pass

    gps_dict = {"lat": final_lat, "lng": final_lng}

    # 2. Save uploaded image
    base_url = str(request.base_url)
    image_url = save_upload_file(image, base_url=base_url)

    # 3. AI waste vision classification
    ai_res = classify_waste(image.filename or "uploaded_waste.jpg")
    final_category = category if (category and category.strip() and category != "string") else ai_res["category"]
    final_volume = volume if (volume and volume.strip() and volume != "string") else ai_res["volume"]
    ai_confidence = ai_res["ai_confidence"]

    timestamp_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    # 4. Duplicate complaint detection
    existing_complaints = db.find_all()
    is_dup, dup_of, dup_count = check_duplicate(gps_dict, final_category, timestamp_iso, existing_complaints)

    # 5. Priority calculation
    if is_dup:
        priority_score = 0.0
    else:
        priority_score = calculate_priority(final_category, final_volume, gps_dict, dup_count)

    # 6. Operational recommendation action
    rec_action = get_recommended_action(final_category, final_volume, priority_score)

    # Generate unique complaint ID
    complaint_count = db.count_documents() + 1
    generated_id = f"COMP-2026-{complaint_count:03d}"

    clean_comment = comment or ""

    doc = {
        "id": generated_id,
        "image_url": image_url,
        "category": final_category,
        "volume": final_volume,
        "priority_score": priority_score,
        "status": "submitted",
        "gps": gps_dict,
        "address": address or "Detected Street Location, Patna",
        "timestamp": timestamp_iso,
        "comment": clean_comment,
        "reporter_comment": clean_comment,
        "recommended_action": rec_action,
        "is_duplicate": is_dup,
        "duplicate_of": dup_of,
        "assigned_team": None,
        "ai_confidence": ai_confidence
    }

    db.insert_one(doc)
    return doc


@router.get("/complaints", response_model=List[ComplaintResponse])
async def list_complaints(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_priority: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("priority"),
    sort_order: Optional[str] = Query("desc")
):
    """
    Returns list of complaints with filtering by status, category, min_priority, and sorting options.
    """
    items = db.find_all()

    # Filters
    if status and status != "all":
        items = [i for i in items if i.get("status") == status]

    if category and category != "all":
        items = [i for i in items if i.get("category") == category]

    if min_priority is not None:
        items = [i for i in items if i.get("priority_score", 0) >= min_priority]

    # Sorting
    reverse_order = (sort_order.lower() == "desc") if sort_order else True
    if sort_by == "priority":
        items.sort(key=lambda x: x.get("priority_score", 0), reverse=reverse_order)
    elif sort_by == "date":
        items.sort(key=lambda x: x.get("timestamp", ""), reverse=reverse_order)

    return items


@router.get("/complaints/hotspots", response_model=List[Hotspot])
async def get_hotspots():
    """
    Geographic aggregation endpoint grouping complaints by ~100m grid (3 decimal places lat/lng)
    for heatmap rendering.
    """
    items = db.find_all()
    clusters: Dict[tuple, List[float]] = {}

    for item in items:
        gps = item.get("gps", {})
        if "lat" in gps and "lng" in gps:
            key = (round(float(gps["lat"]), 3), round(float(gps["lng"]), 3))
            if key not in clusters:
                clusters[key] = []
            clusters[key].append(float(item.get("priority_score", 0)))

    result = []
    for (lat, lng), priorities in clusters.items():
        avg_p = sum(priorities) / len(priorities) if priorities else 0.0
        result.append({
            "lat": lat,
            "lng": lng,
            "count": len(priorities),
            "avg_priority": round(avg_p, 1)
        })

    return result


@router.get("/analytics/summary", response_model=AnalyticsSummary)
async def get_analytics_summary():
    """
    Returns aggregated dashboard metrics including status breakdown, category counts, and urgent complaint count.
    """
    items = db.find_all()
    total = len(items)

    by_status = {"submitted": 0, "in_progress": 0, "resolved": 0}
    by_category = {}
    urgent_count = 0

    for item in items:
        st = item.get("status", "submitted")
        if st in by_status:
            by_status[st] += 1
        else:
            by_status[st] = 1

        cat = item.get("category", "other")
        by_category[cat] = by_category.get(cat, 0) + 1

        if float(item.get("priority_score", 0)) >= 80.0:
            urgent_count += 1

    return {
        "total": total,
        "by_status": by_status,
        "by_category": by_category,
        "urgent_count": urgent_count
    }


@router.get("/complaints/{id}", response_model=ComplaintResponse)
async def get_complaint_by_id(id: str):
    """
    Retrieves details for a single complaint by ID.
    """
    item = db.find_one({"id": id})
    if not item:
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
    return item


@router.patch("/complaints/{id}/status", response_model=ComplaintResponse)
async def update_complaint_status(id: str, payload: StatusUpdate):
    """
    Updates status and optional team assignment for a complaint.
    """
    item = db.find_one({"id": id})
    if not item:
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")

    update_fields = {"status": payload.status}
    if payload.assigned_team is not None:
        update_fields["assigned_team"] = payload.assigned_team

    db.update_one({"id": id}, {"$set": update_fields})
    updated_item = db.find_one({"id": id})
    return updated_item
