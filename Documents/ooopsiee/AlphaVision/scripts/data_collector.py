"""
Data Collection System  (Phase 2)
===================================
Fetches OHLCV stock data from Yahoo Finance (primary) and
Alpha Vantage (fallback/optional). Caches results as Parquet
to minimise redundant API calls.

Usage:
    from scripts.data_collector import YFinanceCollector
    df = YFinanceCollector().fetch("AAPL", period="5y")
"""

import time
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd
import yfinance as yf

try:
    from alpha_vantage.timeseries import TimeSeries as _AVTimeSeries
    _AV_AVAILABLE = True
except ImportError:
    _AV_AVAILABLE = False

from config.settings import (
    RAW_DIR,
    CACHE_DIR,
    DEFAULT_TICKERS,
    DEFAULT_INTERVAL,
    DEFAULT_PERIOD,
    API_RATE_LIMIT_SEC,
)

logger = logging.getLogger(__name__)


def _cache_path(ticker: str, interval: str, period: str) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return CACHE_DIR / f"{ticker}_{interval}_{period}.parquet"


def _is_fresh(path: Path, max_age_hours: float = 6.0) -> bool:
    if not path.exists():
        return False
    age_h = (datetime.now().timestamp() - path.stat().st_mtime) / 3600
    return age_h < max_age_hours


class YFinanceCollector:
    """Download OHLCV data via yfinance with automatic fallback + caching."""

    def __init__(self, enable_fallback: bool = True, alpha_vantage_key: str | None = None):
        self.enable_fallback = enable_fallback
        self.alpha_vantage_key = alpha_vantage_key

    def fetch(
        self,
        ticker: str,
        period: str = DEFAULT_PERIOD,
        interval: str = DEFAULT_INTERVAL,
        force_refresh: bool = False,
    ) -> pd.DataFrame:
        """
        Return OHLCV DataFrame indexed by date.
        Source priority:
          1) fresh local cache
          2) Yahoo Finance
          3) Alpha Vantage fallback (if installed)
          4) stale cache fallback
        """
        cache = _cache_path(ticker, interval, period)

        if not force_refresh and _is_fresh(cache):
            logger.info("Cache hit -> %s", cache.name)
            return pd.read_parquet(cache)

        stale_cache_df = None
        if not force_refresh and cache.exists():
            try:
                stale_cache_df = pd.read_parquet(cache)
            except Exception:
                stale_cache_df = None

        logger.info("Fetching %s [interval=%s period=%s] from Yahoo Finance ...", ticker, interval, period)
        try:
            df = yf.download(
                ticker,
                period=period,
                interval=interval,
                auto_adjust=False,
                progress=False,
            )
        except Exception as exc:
            logger.warning("yfinance download failed for '%s': %s", ticker, exc)
            df = pd.DataFrame()

        if df.empty and self.enable_fallback:
            df = self._fetch_alpha_vantage_fallback(ticker)

        if df.empty and stale_cache_df is not None and not stale_cache_df.empty:
            logger.warning("Using stale cache for %s because live sources failed.", ticker)
            return stale_cache_df

        if df.empty:
            raise ValueError(f"No data returned for ticker '{ticker}'.")

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        df.index = pd.to_datetime(df.index)
        df.sort_index(inplace=True)

        df.to_parquet(cache)
        RAW_DIR.mkdir(parents=True, exist_ok=True)
        raw_csv = RAW_DIR / f"{ticker}_{interval}_{period}_{datetime.now():%Y%m%d}.csv"
        df.to_csv(raw_csv)
        logger.info("Raw data saved -> %s", raw_csv.name)

        return df

    def _fetch_alpha_vantage_fallback(self, ticker: str) -> pd.DataFrame:
        if not _AV_AVAILABLE:
            return pd.DataFrame()
        try:
            logger.warning("Trying Alpha Vantage fallback for %s ...", ticker)
            collector = AlphaVantageCollector(api_key=self.alpha_vantage_key)
            df = collector.fetch(ticker)
            return df if not df.empty else pd.DataFrame()
        except Exception as exc:
            logger.warning("Alpha Vantage fallback failed for %s: %s", ticker, exc)
            return pd.DataFrame()

    def fetch_multiple(
        self,
        tickers: list = None,
        period: str = DEFAULT_PERIOD,
        interval: str = DEFAULT_INTERVAL,
    ) -> dict:
        tickers = tickers or DEFAULT_TICKERS
        results: dict[str, pd.DataFrame] = {}
        for ticker in tickers:
            try:
                results[ticker] = self.fetch(ticker, period=period, interval=interval)
                time.sleep(API_RATE_LIMIT_SEC)
            except Exception as exc:
                logger.error("Failed to fetch %s: %s", ticker, exc)
        return results


class AlphaVantageCollector:
    """Download data from Alpha Vantage. Requires AV_API_KEY env variable."""

    def __init__(self, api_key: str = None):
        import os

        key = api_key or os.getenv("AV_API_KEY", "demo")
        if not _AV_AVAILABLE:
            raise ImportError("Install: pip install alpha-vantage")
        self._ts = _AVTimeSeries(key=key, output_format="pandas")

    def fetch(self, ticker: str) -> pd.DataFrame:
        logger.info("Fetching %s from Alpha Vantage ...", ticker)
        df, _ = self._ts.get_daily_adjusted(symbol=ticker, outputsize="full")
        df.columns = [c.split(". ", 1)[-1].title() for c in df.columns]
        df.index = pd.to_datetime(df.index)
        df.sort_index(inplace=True)
        return df


def get_collector(source: str = "yfinance"):
    """Return the appropriate collector instance."""
    if source == "alpha_vantage":
        return AlphaVantageCollector()
    return YFinanceCollector()
