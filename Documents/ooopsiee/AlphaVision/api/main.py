"""
FastAPI Application Entry Point  (Phase 9)
==========================================
Run:
    uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

Interactive docs: http://localhost:8000/docs
"""

import os
import sys
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.middleware.auth  import APIKeyMiddleware
from api.routes.predict   import router as predict_router
from api.routes.stocks    import router as stocks_router
from api.schemas          import HealthResponse
from config.settings      import LOG_LEVEL, LOG_FORMAT, LOG_DATE_FORMAT

logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
logger = logging.getLogger(__name__)

__version__ = "1.0.0"

# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "AlphaVision API",
    description = (
        "AI-powered stock prediction REST API. "
        "Provides trading signals (BUY/SELL/HOLD), OHLCV data, "
        "feature matrices, and model training endpoints."
    ),
    version     = __version__,
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],     # Tighten in production
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── API-Key Auth ─────────────────────────────────────────────────────────────
app.add_middleware(APIKeyMiddleware)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(predict_router)
app.include_router(stocks_router)


# ─────────────────────────────────────────────────────────────────────────────
# Core endpoints
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return {"message": "AlphaVision API is running. Visit /docs for documentation."}


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    return HealthResponse(
        status  = "ok",
        version = __version__,
        message = "AlphaVision API is healthy.",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Global exception handler
# ─────────────────────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {exc}"},
    )


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host   = os.getenv("API_HOST", "0.0.0.0"),
        port   = int(os.getenv("API_PORT", "8000")),
        reload = os.getenv("DEBUG", "false").lower() == "true",
    )
