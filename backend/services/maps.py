import os

import httpx
from dotenv import load_dotenv

load_dotenv()

NOMINATIM_URL = os.getenv("NOMINATIM_URL")
MAPBOX_API_KEY = os.getenv("MAPBOX_API_KEY")

# Mapbox Static Images API endpoint
# Docs: https://docs.mapbox.com/api/maps/static-images/
MAPBOX_STATIC_URL = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static"


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
    if not MAPBOX_API_KEY:
        raise ValueError("MAPBOX_API_KEY not set in environment")

    width, height = size.split("x")

    # Mapbox URL format: /styles/v1/{username}/{style_id}/static/{lon},{lat},{zoom}/{width}x{height}
    # Note: Mapbox uses lng,lat order (opposite of Google)
    url = f"{MAPBOX_STATIC_URL}/{lng},{lat},{zoom}/{width}x{height}"

    params = {
        "access_token": MAPBOX_API_KEY,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

    return response.content