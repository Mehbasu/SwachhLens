import os
import json
import random
from typing import Dict, Any

try:
    from google import genai
    from PIL import Image
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

try:
    from groq import Groq
    import base64
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False

CATEGORIES = [
    "overflowing_bin",
    "garbage_dump",
    "plastic_waste",
    "construction_debris",
    "organic_waste",
    "e_waste",
    "hazardous_waste",
    "medical_waste",
    "drain_blockage",
    "not_waste"
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
            client = genai.Client(api_key=api_key)
            
            img = Image.open(image_path)
            
            prompt = f"""
            Analyze this image of municipal waste. 
            Classify it into exactly one of these categories: {', '.join(CATEGORIES)}.
            If the image DOES NOT contain any form of waste, garbage, or civic issue (e.g., it is just a picture of a person, an animal, a normal street, or a random object), you MUST classify it as "not_waste".
            Estimate the volume into exactly one of these sizes: {', '.join(VOLUMES)}.
            To estimate the volume, compare the waste to visible scale references in the frame (e.g., a bin, curb, vehicle, person).
            Return ONLY a valid JSON object with the following keys:
            - "category": the classified category string (use "not_waste" if no waste is present)
            - "volume": the estimated volume string
            - "ai_confidence": a float between 0 and 100
            - "reasoning": a short one-line string explaining your volume estimation based on scale references
            Do not include markdown blocks or any other text.
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[prompt, img]
            )
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
                    "ai_confidence": float(data.get("ai_confidence", 90.0)),
                    "reasoning": data.get("reasoning", "Estimated based on visible scale references in the image.")
                }
        except Exception as e:
            print(f"Gemini API failed: {e}. Trying Groq fallback.")

    groq_api_key = os.environ.get("GROQ_API_KEY")
    if HAS_GROQ and groq_api_key and os.path.exists(image_path):
        try:
            client = Groq(api_key=groq_api_key)
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            prompt = f"""
            Analyze this image of municipal waste. 
            Classify it into exactly one of these categories: {', '.join(CATEGORIES)}.
            If the image DOES NOT contain any form of waste, garbage, or civic issue (e.g., it is just a picture of a person, an animal, a normal street, or a random object), you MUST classify it as "not_waste".
            Estimate the volume into exactly one of these sizes: {', '.join(VOLUMES)}.
            To estimate the volume, compare the waste to visible scale references in the frame (e.g., a bin, curb, vehicle, person).
            Return ONLY a valid JSON object with the following keys:
            - "category": the classified category string (use "not_waste" if no waste is present)
            - "volume": the estimated volume string
            - "ai_confidence": a float between 0 and 100
            - "reasoning": a short one-line string explaining your volume estimation based on scale references
            Do not include markdown blocks or any other text.
            """

            response = client.chat.completions.create(
                model="llama-3.2-90b-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                            }
                        ]
                    }
                ],
                temperature=0.1
            )
            
            text = response.choices[0].message.content.strip()
            if text.startswith('```json'):
                text = text[7:-3]
            elif text.startswith('```'):
                text = text[3:-3]
                
            data = json.loads(text.strip())
            if data.get("category") in CATEGORIES and data.get("volume") in VOLUMES:
                return {
                    "category": data["category"],
                    "volume": data["volume"],
                    "ai_confidence": float(data.get("ai_confidence", 85.0)),
                    "reasoning": data.get("reasoning", "Estimated using Groq Vision fallback.")
                }
        except Exception as e:
            print(f"Groq API fallback failed: {e}. Falling back to mock data.")

    # Fallback mock logic
    category = random.choice(CATEGORIES)
    volume = random.choice(VOLUMES)
    confidence = round(random.uniform(85.0, 98.0), 1)

    return {
        "category": category,
        "volume": volume,
        "ai_confidence": confidence,
        "reasoning": "Mock data fallback (AI classification skipped)."
    }

