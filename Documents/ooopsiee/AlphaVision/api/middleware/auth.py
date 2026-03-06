"""
API-Key Authentication Middleware  (Phase 9)
=============================================
Reads X-API-Key header and validates against SECRET_KEY env variable.
Exempts /health endpoint from authentication.
"""

import os
import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

EXEMPT_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc"}


class APIKeyMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, api_key: str = None):
        super().__init__(app)
        self.api_key = api_key or os.getenv("SECRET_KEY", "alphavision-dev-key")

    async def dispatch(self, request: Request, call_next):
        if request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        provided_key = request.headers.get("X-API-Key", "")
        if provided_key != self.api_key:
            logger.warning("Invalid API key from %s", request.client.host if request.client else "unknown")
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or missing API key. Pass X-API-Key header."},
            )

        return await call_next(request)
