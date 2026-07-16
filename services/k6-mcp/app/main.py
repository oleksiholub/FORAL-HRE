from __future__ import annotations

from fastapi import FastAPI

from app.auth import ApiKeyMiddleware
from app.config import load_settings

settings = load_settings()

app = FastAPI(
    title="FORAL HRE k6 MCP Gateway",
    version="0.2.0",
    description="Remote MCP gateway for short k6 runs + Job template for long runs",
)

app.add_middleware(
    ApiKeyMiddleware,
    expected_api_key=settings.api_key,
    require_auth=settings.require_auth,
)


@app.get("/healthz")
def healthz() -> dict:
    return {
        "service": settings.service_name,
        "status": "ok",
        "authRequired": settings.require_auth,
        "k6Bin": settings.k6_bin,
        "limits": {
            "maxDurationSeconds": settings.max_duration_seconds,
            "maxVus": settings.max_vus,
        },
        "endpoints": {
            "healthz": "/healthz",
            "mcp": "/mcp",
        },
    }


@app.get("/")
def root() -> dict:
    return {
        "service": settings.service_name,
        "message": "k6 MCP gateway bootstrap. Use /healthz or protected /mcp.",
    }