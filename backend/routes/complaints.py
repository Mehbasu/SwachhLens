import json
import os
import requests
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Request, Depends

from db.database import db
from routes.auth import get_current_user
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
    volume: Optional[str] = Form(None),
    timestamp: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    ward: Optional[str] = Form(None)
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

    # 1.5 Server-Side Reverse Geocoding
    # Ignore client state/district/city and strictly use GPS
    # Clear client inputs so we fail-close to Unassigned if geocoding fails
    state = None
    district = None
    city = None
    ward = None
    
    import os
    API_KEY = os.environ.get("LOCATIONIQ_API_KEY")
    try:
        loc_res = requests.get(f"https://us1.locationiq.com/v1/reverse.php?key={API_KEY}&lat={final_lat}&lon={final_lng}&format=json", timeout=5)
        if loc_res.status_code == 200:
            loc_data = loc_res.json()
            addr = loc_data.get("address", {})
            geo_state = addr.get("state")
            geo_district = addr.get("state_district") or addr.get("county") or addr.get("city") or addr.get("town")
            geo_city = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("municipality") or addr.get("suburb") or addr.get("hamlet")

            locations_path = os.path.join(os.path.dirname(__file__), "..", "data", "india_locations.json")
            with open(locations_path, 'r') as f:
                canon_locs = json.load(f)

            if geo_state:
                matched_state = next((s for s in canon_locs["states"] if s["name"].lower() == geo_state.lower() or geo_state.lower() in s["name"].lower() or s["name"].lower() in geo_state.lower()), None)
                if matched_state:
                    state = matched_state["name"]  # Override client input
                    if geo_district:
                        dist_search = geo_district.lower().replace(' district', '')
                        matched_district = next((d for d in matched_state["districts"] if dist_search in d["name"].lower() or d["name"].lower() in dist_search), None)
                        if matched_district:
                            district = matched_district["name"]  # Override client input
                            if geo_city:
                                matched_city = next((c for c in matched_district["cities"] if geo_city.lower() in c.lower() or c.lower() in geo_city.lower()), None)
                                if matched_city:
                                    city = matched_city  # Override client input
    except Exception as e:
        print("Server-side geocoding failed:", e)

    # 2. Save uploaded image
    base_url = str(request.base_url)
    image_url = save_upload_file(image, base_url=base_url)

    # 3. AI waste vision classification
    import os
    saved_filename = image_url.split('/')[-1]
    saved_filepath = os.path.join(os.path.dirname(__file__), "..", "uploads", saved_filename)
    ai_res = classify_waste(saved_filepath)
    final_category = category if (category and category.strip() and category != "string") else ai_res["category"]
    final_volume = volume if (volume and volume.strip() and volume != "string") else ai_res["volume"]
    ai_confidence = ai_res["ai_confidence"]
    ai_reasoning = ai_res.get("reasoning")

    timestamp_iso = timestamp if timestamp else datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    # 4. Duplicate complaint detection
    existing_complaints = db.find_all()
    is_dup, dup_of, dup_count = check_duplicate(gps_dict, final_category, timestamp_iso, existing_complaints)

    if is_dup and dup_of:
        parent = db.find_one({"id": dup_of})
        if parent:
            new_priority = min(100.0, parent.get("priority_score", 0.0) + 10.0)
            db.update_one({"id": dup_of}, {"$set": {"priority_score": new_priority, "status": "submitted"}})
            parent["priority_score"] = new_priority
            parent["status"] = "submitted"
            return parent

    # 5. Priority calculation
    priority_score = calculate_priority(final_category, final_volume, gps_dict, dup_count)

    # 6. Operational recommendation action
    rec_action = get_recommended_action(final_category, final_volume, priority_score)

    # Generate unique complaint ID
    complaint_count = db.count_documents() + 1
    generated_id = f"COMP-2026-{complaint_count:03d}"

    clean_comment = comment or ""

    normalized_ward = ward.strip().lower() if ward else None

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
        "ai_confidence": ai_confidence,
        "ai_reasoning": ai_reasoning,
        "state": state,
        "district": district,
        "city": city,
        "ward": normalized_ward
    }

    db.insert_one(doc)
    return doc


@router.get("/complaints", response_model=List[ComplaintResponse])
async def list_complaints(
    current_user: dict = Depends(get_current_user),
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

    # RBAC Filtering
    if current_user:
        if current_user.get("state"):
            items = [i for i in items if i.get("state") == current_user.get("state")]
        if current_user.get("district"):
            items = [i for i in items if i.get("district") == current_user.get("district")]
        if current_user.get("city"):
            items = [i for i in items if i.get("city") == current_user.get("city")]
        if current_user.get("ward"):
            items = [i for i in items if i.get("ward") == current_user.get("ward")]

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
async def get_hotspots(current_user: dict = Depends(get_current_user)):
    """
    Geographic aggregation endpoint grouping complaints by ~100m grid (3 decimal places lat/lng)
    for heatmap rendering.
    """
    items = db.find_all()
    
    # RBAC Filtering
    if current_user:
        if current_user.get("state"):
            items = [i for i in items if i.get("state") == current_user.get("state")]
        if current_user.get("district"):
            items = [i for i in items if i.get("district") == current_user.get("district")]
        if current_user.get("city"):
            items = [i for i in items if i.get("city") == current_user.get("city")]
        if current_user.get("ward"):
            items = [i for i in items if i.get("ward") == current_user.get("ward")]

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
async def get_analytics_summary(current_user: dict = Depends(get_current_user)):
    """
    Returns aggregated dashboard metrics including status breakdown, category counts, urgent complaint count, and a 30-day timeline.
    """
    items = db.find_all()
    
    # RBAC Filtering
    if current_user:
        if current_user.get("state"):
            items = [i for i in items if i.get("state") == current_user.get("state")]
        if current_user.get("district"):
            items = [i for i in items if i.get("district") == current_user.get("district")]
        if current_user.get("city"):
            items = [i for i in items if i.get("city") == current_user.get("city")]
        if current_user.get("ward"):
            items = [i for i in items if i.get("ward") == current_user.get("ward")]

    total = len(items)

    by_status = {"submitted": 0, "in_progress": 0, "resolved": 0}
    by_category = {}
    urgent_count = 0
    date_counts = {}
    ward_stats = {}

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
            
        # Timeline aggregation
        ts = item.get("timestamp")
        if ts:
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                date_str = dt.strftime("%b %d") # e.g., "Aug 13"
                if date_str not in date_counts:
                    date_counts[date_str] = {"submitted": 0, "in_progress": 0, "resolved": 0, "_dt": dt}
                if st in date_counts[date_str]:
                    date_counts[date_str][st] += 1
            except Exception:
                pass

        # Ward performance aggregation
        team = item.get("assigned_team") or "Unassigned"
        ward_name = team if "Ward" in team else "Other Wards"
        
        if ward_name not in ward_stats:
            ward_stats[ward_name] = {"total": 0, "resolved": 0, "total_hours": 0.0}
        
        ward_stats[ward_name]["total"] += 1
        if st == "resolved":
            ward_stats[ward_name]["resolved"] += 1
            res_ts = item.get("resolved_at")
            if ts and res_ts:
                try:
                    dt1 = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                    dt2 = datetime.fromisoformat(res_ts.replace("Z", "+00:00"))
                    hours = (dt2 - dt1).total_seconds() / 3600.0
                    ward_stats[ward_name]["total_hours"] += max(0, hours)
                except:
                    ward_stats[ward_name]["total_hours"] += 3.0
            else:
                ward_stats[ward_name]["total_hours"] += 3.0

    # Sort timeline by date
    sorted_dates = sorted(date_counts.values(), key=lambda x: x["_dt"])
    timeline = []
    for d in sorted_dates:
        date_str = d["_dt"].strftime("%b %d")
        timeline.append({
            "date": date_str,
            "submitted": d["submitted"],
            "in_progress": d["in_progress"],
            "resolved": d["resolved"]
        })

    ward_performance = []
    for w_name, w_data in ward_stats.items():
        avg = round(w_data["total_hours"] / w_data["resolved"], 1) if w_data["resolved"] > 0 else 0.0
        ward_performance.append({
            "ward": w_name,
            "total": w_data["total"],
            "resolved": w_data["resolved"],
            "avgHours": avg
        })
    ward_performance.sort(key=lambda x: x["total"], reverse=True)

    return {
        "total": total,
        "by_status": by_status,
        "by_category": by_category,
        "urgent_count": urgent_count,
        "timeline": timeline,
        "ward_performance": ward_performance
    }


@router.get("/complaints/{id}", response_model=ComplaintResponse)
async def get_complaint_by_id(id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves details for a single complaint by ID.
    Enforces jurisdiction scoping (404 if outside jurisdiction).
    """
    item = db.find_one({"id": id})
    if not item:
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
        
    # Security: Jurisdiction Check
    if current_user.get("state") and item.get("state") != current_user.get("state"):
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
    if current_user.get("district") and item.get("district") != current_user.get("district"):
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
    if current_user.get("city") and item.get("city") != current_user.get("city"):
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
    if current_user.get("ward") and item.get("ward") != current_user.get("ward"):
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
        
    return item


@router.patch("/complaints/{id}/status", response_model=ComplaintResponse)
async def update_complaint_status(id: str, payload: StatusUpdate, current_user: dict = Depends(get_current_user)):
    """
    Updates status and optional team assignment for a complaint.
    Enforces jurisdiction scoping.
    """
    item = db.find_one({"id": id})
    if not item:
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
        
    # Security: Jurisdiction Check
    if current_user.get("state") and item.get("state") != current_user.get("state"):
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
    if current_user.get("district") and item.get("district") != current_user.get("district"):
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
    if current_user.get("city") and item.get("city") != current_user.get("city"):
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")
    if current_user.get("ward") and item.get("ward") != current_user.get("ward"):
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{id}' not found")

    update_fields = {"status": payload.status}
    if payload.assigned_team is not None:
        update_fields["assigned_team"] = payload.assigned_team

    db.update_one({"id": id}, {"$set": update_fields})
    updated_item = db.find_one({"id": id})
    return updated_item
