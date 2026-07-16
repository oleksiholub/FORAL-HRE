from __future__ import annotations

import hmac
from typing import Mapping

from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response


def extract_api_key(headers: Mapping[str, str]) -> str | None:
    x_api_key = headers.get("x-api-key")
    if x_api_key and x_api_key.strip():
        return x_api_key.strip()

    authorization = headers.get("authorization")
    if not authorization or not authorization.strip():
        return None

    value = authorization.strip()
    if value.lower().startswith("bearer "):
        token = value[7:].strip()
        return token or None
    return value


def is_authorized(
    *,
    headers: Mapping[str, str],
    expected_api_key: str,
    require_auth: bool,
) -> tuple[bool, str]:
    if not require_auth:
        return True, "auth_disabled"

    if not expected_api_key:
        return False, "server_misconfigured"

    provided = extract_api_key(headers)
    if not provided:
        return False, "missing_api_key"

    if not hmac.compare_digest(provided, expected_api_key):
        return False, "invalid_api_key"

    return True, "ok"


class ApiKeyMiddleware(BaseHTTPMiddleware):
    PUBLIC_PATHS = {"/healthz", "/", "/docs", "/openapi.json", "/redoc"}

    def __init__(self, app, *, expected_api_key: str, require_auth: bool):
        super().__init__(app)
        self.expected_api_key = expected_api_key
        self.require_auth = require_auth

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path.rstrip("/") or "/"
        if path in self.PUBLIC_PATHS or request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)

        ok, reason = is_authorized(
            headers=request.headers,
            expected_api_key=self.expected_api_key,
            require_auth=self.require_auth,
        )
        if ok:
            return await call_next(request)

        status_code = (
            status.HTTP_500_INTERNAL_SERVER_ERROR
            if reason == "server_misconfigured"
            else status.HTTP_401_UNAUTHORIZED
        )
        return JSONResponse(
            status_code=status_code,
            content={"error": "unauthorized", "reason": reason},
  )
