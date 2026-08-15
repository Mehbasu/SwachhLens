import random
from typing import Dict, Any

CATEGORIES = [
    "overflowing_bin",
    "garbage_dump",
    "plastic_waste",
    "construction_debris",
    "organic_waste",
    "e_waste",
    "hazardous_waste",
    "drain_blockage"
]

VOLUMES = ["small", "medium", "large", "very_large"]

def classify_waste(image_path: str) -> Dict[str, Any]:
    """
    Stubbed AI Vision classifier.
    Returns random category, volume, and high confidence score (85-98%).
    Structure allows replacing with actual PyTorch/TensorFlow vision model inference without downstream route modifications.
    """
    category = random.choice(CATEGORIES)
    volume = random.choice(VOLUMES)
    confidence = round(random.uniform(85.0, 98.0), 1)

    return {
        "category": category,
        "volume": volume,
        "ai_confidence": confidence
    }
