from typing import Dict, Any, Optional
from services.duplicate_service import haversine_distance_meters

SENSITIVE_ZONES = [
    {"name": "PMCH Medical College & Hospital", "lat": 25.6214, "lng": 85.1556},
    {"name": "Kurji Holy Family Hospital", "lat": 25.6260, "lng": 85.1120},
    {"name": "St. Xavier's High School", "lat": 25.6142, "lng": 85.1384},
    {"name": "Patna High Court Complex", "lat": 25.6125, "lng": 85.1290},
    {"name": "Patna Junction Railway Hub", "lat": 25.6022, "lng": 85.1376}
]

def calculate_priority(category: str, volume: str, gps: Optional[Dict[str, float]] = None, is_duplicate_count: int = 0) -> float:
    """
    Calculates priority score (0-100) based on:
    - Volume weight (small=10, medium=30, large=60, very_large=90)
    - Category sensitivity (+30 for hazardous_waste, e_waste, drain_blockage)
    - Location sensitivity (+20 if within 200m of sensitive zones like hospitals/schools)
    - Report frequency (+15 if 2+ duplicate reports exist)
    Score is capped between 0 and 100.
    """
    # 1. Volume weight
    volume_weights = {
        "small": 10.0,
        "medium": 30.0,
        "large": 60.0,
        "very_large": 90.0
    }
    score = volume_weights.get(volume.lower() if volume else "medium", 30.0)

    # 2. Category sensitivity weight (+30 for high risk categories)
    high_risk_categories = ["hazardous_waste", "e_waste", "drain_blockage"]
    if category in high_risk_categories:
        score += 30.0

    # 3. Location sensitivity (+20 if within 200m of any sensitive zone)
    if gps and "lat" in gps and "lng" in gps:
        lat = float(gps["lat"])
        lng = float(gps["lng"])
        for zone in SENSITIVE_ZONES:
            dist = haversine_distance_meters(lat, lng, zone["lat"], zone["lng"])
            if dist <= 200.0:
                score += 20.0
                break

    # 4. Report frequency (+15 if 2 or more duplicate complaints reported)
    if is_duplicate_count >= 2:
        score += 15.0

    final_score = min(100.0, max(0.0, score))
    return round(final_score, 1)
