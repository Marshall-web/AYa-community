"""
Data Processing Pipeline  (Phase 3)
=====================================
Cleans raw OHLCV data: missing-value handling, outlier removal,
column standardisation, return calculations, and scaling.

Usage:
    from scripts.data_processor import DataProcessor
    clean = DataProcessor().process(raw_df, ticker="AAPL")
"""

import logging

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler, StandardScaler

from config.settings import PROCESSED_DIR

logger = logging.getLogger(__name__)


class DataProcessor:
    """Clean and normalise raw OHLCV DataFrames."""

    REQUIRED_COLS = ["open", "high", "low", "close", "volume"]

    def __init__(self, scaler_type: str = "minmax"):
        self.scaler  = MinMaxScaler() if scaler_type == "minmax" else StandardScaler()
        self._fitted = False

    # ─────────────────────────────────────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────────────────────────────────────
    def process(self, df: pd.DataFrame, ticker: str = "TICKER") -> pd.DataFrame:
        """Full cleaning pipeline; returns a clean DataFrame."""
        logger.info("Processing %s (%d rows) …", ticker, len(df))
        df = self._standardise_columns(df)
        df = self._handle_missing(df)
        df = self._remove_outliers(df)
        df = self._add_returns(df)
        df = self._validate(df)
        self._save(df, ticker)
        logger.info("Processing complete → %d rows remaining.", len(df))
        return df

    def fit_transform(
        self,
        df:   pd.DataFrame,
        cols: list = None,
    ) -> pd.DataFrame:
        """Scale *cols* using the configured scaler (fit + transform)."""
        cols = cols or self._numeric_cols(df)
        df = df.copy()
        df[cols] = self.scaler.fit_transform(df[cols])
        self._fitted = True
        return df

    def transform(self, df: pd.DataFrame, cols: list = None) -> pd.DataFrame:
        """Scale using a previously fitted scaler."""
        if not self._fitted:
            raise RuntimeError("Call fit_transform first.")
        cols = cols or self._numeric_cols(df)
        df = df.copy()
        df[cols] = self.scaler.transform(df[cols])
        return df

    def inverse_transform(self, df: pd.DataFrame, cols: list = None) -> pd.DataFrame:
        """Reverse scaling."""
        if not self._fitted:
            raise RuntimeError("Call fit_transform first.")
        cols = cols or self._numeric_cols(df)
        df = df.copy()
        df[cols] = self.scaler.inverse_transform(df[cols])
        return df

    # ─────────────────────────────────────────────────────────────────────────
    # Private helpers
    # ─────────────────────────────────────────────────────────────────────────
    @staticmethod
    def _numeric_cols(df: pd.DataFrame) -> list:
        return df.select_dtypes(include=[np.floating, np.integer]).columns.tolist()

    def _standardise_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df.columns = [c.lower().replace(" ", "_") for c in df.columns]
        # yfinance sometimes returns "adj_close"; treat as close
        if "adj_close" in df.columns and "close" not in df.columns:
            df = df.rename(columns={"adj_close": "close"})
        missing = [c for c in self.REQUIRED_COLS if c not in df.columns]
        if missing:
            raise ValueError(f"DataFrame is missing required columns: {missing}")
        return df

    def _handle_missing(self, df: pd.DataFrame) -> pd.DataFrame:
        prev_len = len(df)
        df = df.ffill().bfill()
        still_missing = df.isnull().sum().sum()
        if still_missing:
            logger.warning("Dropping %d rows with unresolvable NaNs.", still_missing)
            df = df.dropna()
        filled = prev_len - len(df)
        if filled:
            logger.info("Forward/back-filled; removed %d unfillable rows.", filled)
        return df

    def _remove_outliers(self, df: pd.DataFrame, z_thresh: float = 5.0) -> pd.DataFrame:
        """Remove rows where Close price z-score exceeds z_thresh."""
        mean  = df["close"].mean()
        std   = df["close"].std()
        mask  = ((df["close"] - mean) / std).abs() <= z_thresh
        n_removed = (~mask).sum()
        if n_removed:
            logger.warning("Removed %d outlier rows (z > %.1f).", n_removed, z_thresh)
        return df[mask].copy()

    def _add_returns(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["daily_return"]      = df["close"].pct_change()
        df["log_return"]        = np.log(df["close"] / df["close"].shift(1))
        df["cumulative_return"] = (1 + df["daily_return"]).cumprod() - 1
        return df

    def _validate(self, df: pd.DataFrame) -> pd.DataFrame:
        assert not df[self.REQUIRED_COLS].isnull().any().any(), \
            "NaN values found in OHLCV columns after processing!"
        assert (df["close"] > 0).all(), \
            "Non-positive close prices detected!"
        return df

    def _save(self, df: pd.DataFrame, ticker: str) -> None:
        PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        path = PROCESSED_DIR / f"{ticker}_processed.parquet"
        df.to_parquet(path)
        logger.info("Processed data saved → %s", path.name)
