"""
Stocks Data Route  (Phase 9)
==============================
GET /stocks/{ticker}  – Return processed OHLCV data.
GET /stocks/{ticker}/features  – Return full feature matrix.
"""

import sys
import logging
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from api.schemas import StockResponse, OHLCVRow, ScreenerResponse
from config.settings import REGION_TICKERS
from scripts.data_collector   import YFinanceCollector
from scripts.data_processor   import DataProcessor
from scripts.feature_engineer import FeatureEngineer
from scripts.stock_screener import PotentialStockScreener

router = APIRouter(prefix="/stocks", tags=["Stocks"])
logger = logging.getLogger(__name__)


@router.get("/{ticker}", response_model=StockResponse, summary="Get OHLCV data")
async def get_stock_data(
    ticker: str,
    period: str = Query("1y", description="yfinance period (e.g. 1mo, 6mo, 1y, 5y)"),
):
    """Download and process OHLCV data for *ticker*."""
    try:
        raw   = YFinanceCollector().fetch(ticker.upper(), period=period)
        clean = DataProcessor().process(raw, ticker=ticker.upper())

        rows = [
            OHLCVRow(
                date   = str(idx.date()),
                open   = round(float(row["open"]),   4),
                high   = round(float(row["high"]),   4),
                low    = round(float(row["low"]),    4),
                close  = round(float(row["close"]),  4),
                volume = round(float(row["volume"]), 0),
            )
            for idx, row in clean.iterrows()
        ]

        return StockResponse(
            ticker = ticker.upper(),
            period = period,
            rows   = len(rows),
            data   = rows,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error("Stock data error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{ticker}/features", summary="Get feature matrix (JSON)")
async def get_features(
    ticker: str,
    period: str = Query("1y"),
):
    """Return the full feature-engineered DataFrame as JSON."""
    try:
        raw      = YFinanceCollector().fetch(ticker.upper(), period=period)
        clean    = DataProcessor().process(raw, ticker=ticker.upper())
        features = FeatureEngineer().build(clean, ticker=ticker.upper())
        return {
            "ticker":  ticker.upper(),
            "rows":    len(features),
            "columns": list(features.columns),
            "data":    features.reset_index().to_dict(orient="records"),
        }
    except Exception as exc:
        logger.error("Feature error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/screener/picks", response_model=ScreenerResponse, summary="Screen cheap high-potential stocks")
async def screen_stocks(
    regions: list[str] = Query(
        default=[],
        description=f"Regions to screen. Available: {', '.join(REGION_TICKERS.keys())}",
    ),
    period: str = Query("1y", description="yfinance period for each ticker"),
    max_price: float = Query(50.0, gt=0, description="Maximum stock price (cheapness filter)"),
    min_confidence: float = Query(0.55, ge=0.0, le=1.0, description="Minimum model confidence"),
    model_type: str = Query("xgboost", description="Model type for saved models"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of ranked stocks returned"),
):
    try:
        screener = PotentialStockScreener()
        picks = screener.screen(
            regions=regions or None,
            period=period,
            max_price=max_price,
            min_confidence=min_confidence,
            model_type=model_type,
            limit=limit,
        )
        active_regions = [r.upper() for r in regions] if regions else list(REGION_TICKERS.keys())
        return ScreenerResponse(
            regions=active_regions,
            period=period,
            max_price=max_price,
            min_confidence=min_confidence,
            model_type=model_type,
            rows=len(picks),
            data=picks,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.error("Screener error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
