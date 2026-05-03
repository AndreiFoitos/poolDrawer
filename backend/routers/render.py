from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from services.image_processor import render_pool
import io

router = APIRouter(prefix="/render-pool", tags=["render"])

@router.post("/")
async def render_pool_endpoint(
    image: UploadFile = File(...),
    x1: float = Form(...),
    y1: float = Form(...),
    x2: float = Form(...),
    y2: float = Form(...),
    shape: str = Form(default="rectangle"),
    color: str = Form(default="classic"),           # new
):
    allowed_shapes = ("rectangle", "oval", "kidney", "lshape")
    allowed_colors = ("classic", "deep", "turquoise", "dark")

    if shape not in allowed_shapes:
        raise HTTPException(status_code=422, detail="Invalid shape")
    if color not in allowed_colors:
        raise HTTPException(status_code=422, detail="Invalid color")

    image_bytes = await image.read()

    try:
        result = render_pool(image_bytes, x1, y1, x2, y2, shape, color)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Render failed: {str(e)}")

    return StreamingResponse(io.BytesIO(result), media_type="image/png")