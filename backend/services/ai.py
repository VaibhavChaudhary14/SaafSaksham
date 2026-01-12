import google.generativeai as genai
from backend.core.config import settings
import os

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.0-flash-exp')

async def verify_image_content(image_path: str, category: str) -> dict:
    """
    Analyzes an image using Gemini Vision to verify if it matches the reported category.
    Returns a dictionary with verification status, confidence, and reasoning.
    """
    try:
        # Note: In a real scenario, we might need to download the image from Supabase 
        # or pass the file object directly if we haven't uploaded it yet. 
        # For this MVP, we assume we might need to handle the file bytes or a signed URL.
        # Since Gemini 1.5+ supports URLs in some contexts or we need to download it.
        # Let's assume we pass the image file object for now, or we download it.
        # For simplicity in this function, let's assume we download it temporarily or keep it in memory.
        
        # PROMPT
        prompt = f"""
        Analyze this image. The user claims it is a report about '{category}'.
        1. Is this image relevant to '{category}'? (Yes/No)
        2. Rate the severity on a scale of 1-10.
        3. Describe what you see in 1 sentence.
        4. Give a confidence score (0.0 to 1.0) that this is a genuine civic issue.
        
        Return valid JSON:
        {{
            "is_relevant": true/false,
            "severity": int,
            "description": "string",
            "confidence": float
        }}
        """
        
        # For now, we will mock the actual call if we don't have the file bytes here.
        # Implement the actual call in the endpoint handler where we have the UploadFile.
        pass

    except Exception as e:
        print(f"AI Error: {e}")
        return {"error": str(e)}

async def analyze_image_bytes(image_bytes: bytes, category: str) -> dict:
    try:
        response = model.generate_content([
            f"Analyze this image to verify a civic report of type: {category}. Return JSON with keys: is_relevant (bool), severity (1-10), description, confidence (0.0-1.0).",
            {"mime_type": "image/jpeg", "data": image_bytes}
        ])
        
        # Parse JSON from response
        import json
        text = response.text.replace("```json", "").replace("```", "")
        return json.loads(text)
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        # Fallback for error
        return {
            "is_relevant": False,
            "severity": 0,
            "description": f"AI Verification failed: {str(e)}",
            "confidence": 0.0
        }
