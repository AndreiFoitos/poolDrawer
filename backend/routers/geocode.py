from fastapi import APIRouter, HTTPException, Query
from services.maps import get_coordinates

router = APIRouter(prefix="/geocode", tags=["geocode"])

@router.get("/")
async def geocode(address: str = Query(..., min_length=3)):
    result = await get_coordinates(address)

    if result is None:
        raise HTTPException(status_code=404, detail="Address not found")

    return result