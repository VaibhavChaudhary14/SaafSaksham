from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Location(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class ReportCreate(BaseModel):
    description: Optional[str] = None
    category: str = "garbage"  # garbage, pothole, etc.
    location: Location
    timestamp: datetime
    # Media will be handled via multipart upload, so not in the JSON body for the file itself, 
    # but metadata can be passed.

class ReportResponse(BaseModel):
    id: str
    status: str
    ai_verification_status: str
    created_at: datetime
