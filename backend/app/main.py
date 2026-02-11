from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .api.v1.router import api_router
from .core.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(
    title="VoiceAI Widget API",
    description="AI-powered voice chat widget for any website",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["X-API-Key", "Content-Type", "Authorization"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/widget.js")
async def serve_widget():
    widget_path = Path("/widget/dist/widget.js")
    if widget_path.exists():
        return FileResponse(widget_path, media_type="application/javascript", headers={
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
        })
    return {"error": "widget.js not found"}
