import io

from PIL import Image, ImageDraw

COLOR_MAP = {
    "classic":   (30,  144, 255, 160),
    "deep":      (0,   48,  143, 170),
    "turquoise": (0,   206, 209, 150),
    "dark":      (26,  58,  74,  180),
}

COPING = (220, 220, 210, 220)
COPING_W = 6
LANE = (255, 255, 255, 55)


def render_pool(
    image_bytes: bytes,
    x1: float, y1: float,
    x2: float, y2: float,
    shape: str = "rectangle",
    color: str = "classic",
) -> bytes:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    fill = COLOR_MAP.get(color, COLOR_MAP["classic"])
    w = x2 - x1
    h = y2 - y1
    cx = x1 + w / 2

    if shape == "oval":
        draw.ellipse([x1, y1, x2, y2], fill=fill, outline=COPING, width=COPING_W)

    elif shape == "kidney":
        # Upper lobe
        draw.ellipse(
            [cx - w * 0.5, y1, cx + w * 0.4, y1 + h * 0.62],
            fill=fill, outline=COPING, width=COPING_W
        )
        # Lower lobe
        draw.ellipse(
            [cx - w * 0.3, y1 + h * 0.42, cx + w * 0.5, y2],
            fill=fill, outline=COPING, width=COPING_W
        )

    elif shape == "lshape":
        # Vertical arm
        draw.rectangle(
            [x1, y1, x1 + w * 0.5, y2],
            fill=fill, outline=COPING, width=COPING_W
        )
        # Horizontal arm
        draw.rectangle(
            [x1, y1 + h * 0.6, x2, y2],
            fill=fill, outline=COPING, width=COPING_W
        )

    else:  # rectangle
        draw.rectangle([x1, y1, x2, y2], fill=fill, outline=COPING, width=COPING_W)
        # Shallow end line
        draw.line(
            [(x1 + COPING_W, y1 + h * 0.25), (x2 - COPING_W, y1 + h * 0.25)],
            fill=LANE, width=2
        )
        # Lane lines
        for offset in [-0.25, 0, 0.25]:
            lx = cx + offset * w
            draw.line([(lx, y1 + COPING_W), (lx, y2 - COPING_W)], fill=LANE, width=1)

    composited = Image.alpha_composite(image, overlay).convert("RGB")
    output = io.BytesIO()
    composited.save(output, format="PNG")
    return output.getvalue()