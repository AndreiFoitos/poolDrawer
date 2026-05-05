from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import geocode, render, satellite

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(geocode.router)
app.include_router(satellite.router) 
app.include_router(render.router)
@app.get("/")
def root():
    return {"status": "ok"}