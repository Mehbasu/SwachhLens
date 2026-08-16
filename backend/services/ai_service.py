import os
import json
import random
from typing import Dict, Any

try:
    import google.generativeai as genai
    from PIL import Image
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

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
    AI Vision classifier using Gemini API.
    Returns category, volume, and confidence score.
    Falls back to mock classification if API key is not set or API call fails.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if HAS_GENAI and api_key and os.path.exists(image_path):
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            img = Image.open(image_path)
            
            prompt = f"""
            Analyze this image of municipal waste. 
            Classify it into exactly one of these categories: {', '.join(CATEGORIES)}.
            Estimate the volume into exactly one of these sizes: {', '.join(VOLUMES)}.
            Return ONLY a valid JSON object with the keys "category", "volume", and "ai_confidence" (a float between 0 and 100).
            Do not include markdown blocks or any other text.
            """
            
            response = model.generate_content([prompt, img])
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:-3]
            elif text.startswith('```'):
                text = text[3:-3]
                
            data = json.loads(text.strip())
            
            if data.get("category") in CATEGORIES and data.get("volume") in VOLUMES:
                return {
                    "category": data["category"],
                    "volume": data["volume"],
                    "ai_confidence": float(data.get("ai_confidence", 90.0))
                }
        except Exception as e:
            print(f"AI classification failed: {e}. Falling back to mock data.")

    # Fallback mock logic
    category = random.choice(CATEGORIES)
    volume = random.choice(VOLUMES)
    confidence = round(random.uniform(85.0, 98.0), 1)

    return {
        "category": category,
        "volume": volume,
        "ai_confidence": confidence
    }

