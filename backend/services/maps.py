import httpx
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_STATIC_MAPS_URL = os.getenv("GOOGLE_STATIC_MAPS_URL")
NOMINATIM_URL = os.getenv("NOMINATIM_URL")

async def get_coordinates(address: str) -> dict:
    params = {
        "q": address,
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "PoolDrawer/1.0"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(NOMINATIM_URL, params=params, headers=headers)
        response.raise_for_status()
        results = response.json()

    if not results:
        return None

    return {
        "lat": float(results[0]["lat"]),
        "lng": float(results[0]["lon"]),
        "display_name": results[0]["display_name"]
    }


async def get_satellite_image(lat: float, lng: float, zoom: int = 19, size: str = "640x640") -> bytes:
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    if not api_key:
        raise ValueError("GOOGLE_MAPS_API_KEY not set in environment")

    params = {
        "center": f"{lat},{lng}",
        "zoom": zoom,
        "size": size,
        "maptype": "satellite",
        "key": api_key
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(GOOGLE_STATIC_MAPS_URL, params=params)
        response.raise_for_status()

    return response.content