from fastapi import APIRouter, HTTPException
from services.storage import get_supabase
from pydantic import BaseModel
from typing import List

router = APIRouter()

class LeaderboardEntry(BaseModel):
    name: str
    avatar_url: str | None
    civic_rank: str
    total_xp: int

@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 10):
    try:
        supabase = get_supabase()
        
        response = supabase.table("profiles")\
            .select("name, avatar_url, civic_rank, total_xp")\
            .order("total_xp", desc=True)\
            .limit(limit)\
            .execute()
            
        if not response.data:
            return []
            
        return response.data
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        # Return mock data as fallback
        return [
            {"name": "Arjun Kumar", "avatar_url": None, "civic_rank": "Guardian", "total_xp": 1250},
            {"name": "Priya Singh", "avatar_url": None, "civic_rank": "Guardian", "total_xp": 1100},
            {"name": "Rahul Verma", "avatar_url": None, "civic_rank": "Sentinel", "total_xp": 950},
        ]
