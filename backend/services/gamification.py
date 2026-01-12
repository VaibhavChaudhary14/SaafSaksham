from backend.services.storage importget_supabase
from datetime import datetime

async def award_xp(user_id: str, amount: int, reason: str, task_id: str = None):
    supabase = get_supabase()
    
    # 1. Log the transaction
    log_data = {
        "user_id": user_id,
        "delta": amount,
        "reason": reason,
        "task_id": task_id,
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("reputation_logs").insert(log_data).execute()
    
    # 2. Update User Profile
    # We use a stored procedure or just get-update-set for MVP
    # Ideally: RPC call increment_xp(user_id, amount)
    
    # Fetch current
    response = supabase.table("profiles").select("total_xp, civic_rank").eq("user_id", user_id).single().execute()
    if response.data:
        current_xp = response.data['total_xp'] or 0
        new_xp = current_xp + amount
        
        # Simple Rank Logic
        new_rank = "Citizen"
        if new_xp > 100: new_rank = "Volunteer"
        if new_xp > 500: new_rank = "Guardian"
        if new_xp > 1000: new_rank = "Champion"
        
        supabase.table("profiles").update({
            "total_xp": new_xp,
            "civic_rank": new_rank
        }).eq("user_id", user_id).execute()
        
    return True
