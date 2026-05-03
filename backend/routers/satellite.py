from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from services.maps import get_satellite_image
import io

router = APIRouter(prefix="/satellite", tags=["satellite"])

@router.get("/")
async def satellite(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    zoom: int = Query(default=19, ge=1, le=20),
):
    try:
        image_bytes = await get_satellite_image(lat, lng, zoom)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to fetch satellite image")

    return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png")