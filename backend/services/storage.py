import os
from supabase import create_client, Client
from core.config import settings
from fastapi import UploadFile

def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

async def upload_file(file: UploadFile, bucket: str = "reports") -> str:
    supabase = get_supabase()
    file_content = await file.read()
    # Generate unique path
    import uuid
    file_ext = file.filename.split('.')[-1]
    file_path = f"{uuid.uuid4()}.{file_ext}"
    
    # Upload
    # Note: public bucket assumed for simplicity, or we handle signing URLs
    response = supabase.storage.from_(bucket).upload(file_path, file_content)
    
    # Return public URL
    public_url = supabase.storage.from_(bucket).get_public_url(file_path)
    return public_url
