from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Annotated
from schemas.report import ReportResponse, ReportCreate, Location
from services.storage import upload_file, get_supabase
import json
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ReportResponse)
async def create_report(
    image: UploadFile = File(...),
    location: str = Form(...),  # JSON string of Location
    description: str = Form(None),
    category: str = Form("garbage"),
    email: str = Form(None) # Optional user email for notifications
):
    try:
        # Parse location
        loc_data = json.loads(location)
        loc = Location(**loc_data)
        
        # Read file content for AI and Upload
        file_content = await image.read()
        await image.seek(0) # Reset cursor for upload
        
        # 1. AI Verification (Gemini)
        from services.ai import analyze_image_bytes
        ai_result = await analyze_image_bytes(file_content, category)
        
        # 2. Fraud Detection
        from services.fraud import detect_fraud
        # Note: Extracting EXIF from bytes is needed for real check. 
        # For now, we pass None for EXIF loc to simulate simple check.
        fraud_score = await detect_fraud((loc.latitude, loc.longitude), None)
        
        # 3. Upload Image (Supabase)
        image_url = await upload_file(image)
        
        # 4. Determine Status
        # If High Fraud Score -> Rejected
        if fraud_score > 0.7:
            initial_status = "rejected_fraud"
        else:
            initial_status = "verified" if (ai_result.get("is_relevant") and ai_result.get("confidence", 0) > 0.7) else "rejected" if not ai_result.get("is_relevant") else "review_pending"
        
        # 5. Save to DB
        supabase = get_supabase()
        
        task_data = {
            "location": f"POINT({loc.longitude} {loc.latitude})",
            "category": category,
            "severity": str(ai_result.get("severity", 1)),
            "status": initial_status,
            "media_urls": [image_url],
            "ai_confidence": ai_result.get("confidence", 0.0),
            "fraud_score": fraud_score,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert
        response = supabase.table("tasks").insert(task_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save report")

        data = response.data[0]
        
        # 6. Send Email Confirmation
        if email:
            from services.email import send_report_confirmation
            await send_report_confirmation(email, data['id'], initial_status)
        
        return ReportResponse(
            id=data['id'],
            status=data['status'],
            ai_verification_status="verified" if initial_status == "verified" else "pending",
            created_at=datetime.fromisoformat(data['created_at'])
        )

    except Exception as e:
        print(f"Error creating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
