from typing import Optional, Tuple
from geopy.distance import geodesic

async def detect_fraud(reported_loc: Tuple[float, float], exif_loc: Optional[Tuple[float, float]]) -> float:
    """
    Returns a fraud score between 0.0 (Clean) and 1.0 (Fraud).
    Checks:
    1. Distance between Reported GPS and Image EXIF GPS.
    """
    score = 0.0
    
    if not exif_loc:
        # Suspicious if purely GPS locked app but no EXIF, but for now neutral
        return 0.1
        
    # Check distance
    distance_meters = geodesic(reported_loc, exif_loc).meters
    
    if distance_meters > 500: # 500 meters tolerance
        score += 0.8
    elif distance_meters > 100:
        score += 0.4
        
    return min(score, 1.0)
