from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, geocode, render, satellite

# Import all models so SQLAlchemy can resolve relationships between them
import models.contractor_profile  # noqa: F401
import models.design               # noqa: F401
import models.project              # noqa: F401
import models.quote                # noqa: F401
import models.user                 # noqa: F401

app = FastAPI(title="PoolDrawer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(geocode.router)
app.include_router(satellite.router)
app.include_router(render.router)


@app.get("/")
def root():
    return {"status": "ok"}