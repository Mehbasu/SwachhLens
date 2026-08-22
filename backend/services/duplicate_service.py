import math
from datetime import datetime, timezone
from typing import Tuple, Optional, List, Dict, Any

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates distance in meters between two GPS coordinates using Haversine formula.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c

def parse_iso_datetime(dt_str: str) -> datetime:
    """
    Parses ISO date string handling 'Z' suffix.
    """
    try:
        clean_str = dt_str.replace("Z", "+00:00")
        return datetime.fromisoformat(clean_str)
    except Exception:
        return datetime.now(timezone.utc)

def check_duplicate(gps: Dict[str, float], category: str, timestamp_iso: str, existing_complaints: List[Dict[str, Any]], image_hash_hex: Optional[str] = None) -> Tuple[bool, Optional[str], int]:
    """
    Checks existing OPEN complaints within 100 meters AND within 24 hours AND same category.
    If image_hash_hex is provided, compares visual similarity (Hamming distance <= 10).
    Returns (is_duplicate: bool, duplicate_of: str | None, duplicate_count: int)
    """
    if not gps or "lat" not in gps or "lng" not in gps:
        return False, None, 0

    current_lat = float(gps["lat"])
    current_lng = float(gps["lng"])
    current_dt = parse_iso_datetime(timestamp_iso)

    import imagehash
    current_hash_obj = None
    if image_hash_hex:
        try:
            current_hash_obj = imagehash.hex_to_hash(image_hash_hex)
        except Exception:
            pass

    matching_id = None
    duplicate_count = 0

    for item in existing_complaints:
        # Ignore resolved complaints
        if item.get("status") == "resolved":
            continue

        # Category check
        if item.get("category") != category:
            continue

        # Time check (within 24 hours / 86400 seconds)
        item_dt = parse_iso_datetime(item.get("timestamp", ""))
        time_diff = abs((current_dt - item_dt).total_seconds())
        if time_diff > 86400:
            continue

        # Distance check (within 100 meters)
        item_gps = item.get("gps", {})
        if "lat" in item_gps and "lng" in item_gps:
            dist = haversine_distance_meters(
                current_lat, current_lng,
                float(item_gps["lat"]), float(item_gps["lng"])
            )
            if dist <= 100.0:
                # If hashes exist, verify visual similarity
                if current_hash_obj and item.get("image_hash"):
                    try:
                        item_hash_obj = imagehash.hex_to_hash(item["image_hash"])
                        # Hamming distance <= 10 means visually similar
                        if current_hash_obj - item_hash_obj > 10:
                            continue
                    except Exception:
                        pass # Ignore hash parse errors, default to geo matching
                        
                duplicate_count += 1
                if not matching_id:
                    # Link to primary complaint if existing item is itself a duplicate
                    matching_id = item.get("duplicate_of") or item.get("id")

    is_duplicate = matching_id is not None
    return is_duplicate, matching_id, duplicate_count
