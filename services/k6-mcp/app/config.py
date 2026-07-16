from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    service_name: str
    host: str
    port: int
    api_key: str
    require_auth: bool
    k6_bin: str
    max_duration_seconds: int
    max_vus: int
    work_dir: str


def load_settings(env: dict[str, str] | None = None) -> Settings:
    e = env if env is not None else os.environ

    port = int(e.get("PORT") or e.get("K6_MCP_PORT") or "8080")
    if port < 1 or port > 65535:
        raise ValueError(f"Invalid PORT/K6_MCP_PORT: {port}")

    require_auth = e.get("K6_MCP_REQUIRE_AUTH", "true").lower() != "false"
    api_key = e.get("K6_MCP_API_KEY", "")

    if require_auth and not api_key:
        raise ValueError(
            "K6_MCP_API_KEY is required unless K6_MCP_REQUIRE_AUTH=false"
        )

    max_duration = int(e.get("K6_MCP_MAX_DURATION_SECONDS", "60"))
    max_vus = int(e.get("K6_MCP_MAX_VUS", "20"))

    if max_duration < 1 or max_duration > 300:
        raise ValueError("K6_MCP_MAX_DURATION_SECONDS must be in 1..300 for bootstrap service")
    if max_vus < 1 or max_vus > 50:
        raise ValueError("K6_MCP_MAX_VUS must be in 1..50 for bootstrap service")

    return Settings(
        service_name=e.get("K6_MCP_SERVICE_NAME", "foral-hre-k6-mcp"),
        host=e.get("HOST", "0.0.0.0"),
        port=port,
        api_key=api_key,
        require_auth=require_auth,
        k6_bin=e.get("K6_BIN", "k6"),
        max_duration_seconds=max_duration,
        max_vus=max_vus,
        work_dir=e.get("K6_MCP_WORK_DIR", "/tmp/k6-mcp"),
    )
