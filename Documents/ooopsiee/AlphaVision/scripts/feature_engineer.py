"""
Feature Engineering Module  (Phase 4)
=======================================
Computes 40+ technical indicators and statistical features from
cleaned OHLCV data, then creates regression and classification
target variables for model training.

Usage:
    from scripts.feature_engineer import FeatureEngineer
    features = FeatureEngineer().build(clean_df, ticker="AAPL")
"""

import logging

import numpy as np
import pandas as pd

from config.settings import (
    FEATURES_DIR,
    FEATURE_WINDOWS,
    RSI_PERIOD,
    MACD_FAST, MACD_SLOW, MACD_SIGNAL,
    BOLLINGER_WINDOW, BOLLINGER_STD,
    PREDICTION_HORIZON,
)

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Build a comprehensive technical-indicator feature matrix."""

    def build(self, df: pd.DataFrame, ticker: str = "TICKER") -> pd.DataFrame:
        logger.info("Engineering features for %s (%d rows) …", ticker, len(df))
        df = df.copy()
        df = self._moving_averages(df)
        df = self._momentum(df)
        df = self._volatility(df)
        df = self._volume(df)
        df = self._price_patterns(df)
        df = self._targets(df)

        # Only drop rows where the SHORT-window, always-computable features
        # are NaN (e.g. RSI-14, SMA-5). Large-window features (SMA-200)
        # may legitimately be NaN when history is short — keep those rows.
        core_cols = [c for c in df.columns
                     if not any(str(w) in c for w in [50, 100, 200])]
        df.dropna(subset=core_cols, inplace=True)

        if df.empty:
            raise ValueError(
                f"Feature matrix for '{ticker}' is empty after dropna. "
                f"Provide at least {max(FEATURE_WINDOWS)} rows of history."
            )

        self._save(df, ticker)
        logger.info("Feature matrix: %d rows × %d cols", *df.shape)
        return df

    # ─────────────────────────────────────────────────────────────────────────
    # Moving Averages
    # ─────────────────────────────────────────────────────────────────────────
    def _moving_averages(self, df: pd.DataFrame) -> pd.DataFrame:
        n = len(df)
        for w in FEATURE_WINDOWS:
            if w >= n:
                # Not enough data — fill with NaN placeholder so columns exist
                logger.warning(
                    "Skipping SMA/EMA/VWAP window=%d (data has only %d rows)", w, n
                )
                for col in [f"sma_{w}", f"ema_{w}", f"vwap_{w}", f"price_to_sma_{w}"]:
                    df[col] = float("nan")
                continue
            df[f"sma_{w}"]  = df["close"].rolling(w).mean()
            df[f"ema_{w}"]  = df["close"].ewm(span=w, adjust=False).mean()
            tp = (df["high"] + df["low"] + df["close"]) / 3
            df[f"vwap_{w}"] = (tp * df["volume"]).rolling(w).sum() / df["volume"].rolling(w).sum()
            df[f"price_to_sma_{w}"] = df["close"] / df[f"sma_{w}"] - 1
        return df

    # ─────────────────────────────────────────────────────────────────────────
    # Momentum
    # ─────────────────────────────────────────────────────────────────────────
    def _momentum(self, df: pd.DataFrame) -> pd.DataFrame:
        # RSI
        delta    = df["close"].diff()
        gain     = delta.clip(lower=0)
        loss     = (-delta).clip(lower=0)
        avg_gain = gain.ewm(com=RSI_PERIOD - 1, adjust=False).mean()
        avg_loss = loss.ewm(com=RSI_PERIOD - 1, adjust=False).mean()
        rs       = avg_gain / avg_loss.replace(0, np.nan)
        df["rsi"] = 100 - (100 / (1 + rs))

        # MACD
        ema_fast        = df["close"].ewm(span=MACD_FAST,   adjust=False).mean()
        ema_slow        = df["close"].ewm(span=MACD_SLOW,   adjust=False).mean()
        df["macd"]      = ema_fast - ema_slow
        df["macd_sig"]  = df["macd"].ewm(span=MACD_SIGNAL, adjust=False).mean()
        df["macd_hist"] = df["macd"] - df["macd_sig"]

        # Stochastic Oscillator (14-period)
        low_14       = df["low"].rolling(14).min()
        high_14      = df["high"].rolling(14).max()
        df["stoch_k"]  = 100 * (df["close"] - low_14) / (high_14 - low_14 + 1e-10)
        df["stoch_d"]  = df["stoch_k"].rolling(3).mean()

        # Williams %R
        for w in [14, 28]:
            h_n = df["high"].rolling(w).max()
            l_n = df["low"].rolling(w).min()
            df[f"williams_r_{w}"] = -100 * (h_n - df["close"]) / (h_n - l_n + 1e-10)

        # Rate-of-Change
        for w in [5, 10, 20]:
            df[f"roc_{w}"] = df["close"].pct_change(w) * 100

        # CCI (Commodity Channel Index)
        tp = (df["high"] + df["low"] + df["close"]) / 3
        df["cci_20"] = (tp - tp.rolling(20).mean()) / (0.015 * tp.rolling(20).std())

        # Momentum (simple)
        df["momentum_10"] = df["close"] - df["close"].shift(10)

        return df

    # ─────────────────────────────────────────────────────────────────────────
    # Volatility
    # ─────────────────────────────────────────────────────────────────────────
    def _volatility(self, df: pd.DataFrame) -> pd.DataFrame:
        # Bollinger Bands
        mid             = df["close"].rolling(BOLLINGER_WINDOW).mean()
        std             = df["close"].rolling(BOLLINGER_WINDOW).std()
        df["bb_upper"]  = mid + BOLLINGER_STD * std
        df["bb_lower"]  = mid - BOLLINGER_STD * std
        df["bb_mid"]    = mid
        df["bb_width"]  = (df["bb_upper"] - df["bb_lower"]) / (mid + 1e-10)
        df["bb_pct"]    = (df["close"] - df["bb_lower"]) / (df["bb_upper"] - df["bb_lower"] + 1e-10)

        # ATR (Average True Range)
        hl  = df["high"] - df["low"]
        hpc = (df["high"] - df["close"].shift()).abs()
        lpc = (df["low"]  - df["close"].shift()).abs()
        tr  = pd.concat([hl, hpc, lpc], axis=1).max(axis=1)
        df["atr_14"] = tr.rolling(14).mean()
        df["atr_pct"] = df["atr_14"] / df["close"]

        # Historical Volatility (annualised, 20-day)
        df["hist_vol_20"] = df["log_return"].rolling(20).std() * np.sqrt(252)

        return df

    # ─────────────────────────────────────────────────────────────────────────
    # Volume
    # ─────────────────────────────────────────────────────────────────────────
    def _volume(self, df: pd.DataFrame) -> pd.DataFrame:
        df["vol_sma20"]    = df["volume"].rolling(20).mean()
        df["vol_ratio"]    = df["volume"] / (df["vol_sma20"] + 1e-10)

        # On-Balance Volume
        df["obv"] = (np.sign(df["close"].diff()) * df["volume"]).cumsum()

        # Chaikin Money Flow (20-period)
        mf_mult = ((df["close"] - df["low"]) - (df["high"] - df["close"])) \
                  / (df["high"] - df["low"] + 1e-10)
        df["cmf_20"] = (mf_mult * df["volume"]).rolling(20).sum() \
                       / (df["volume"].rolling(20).sum() + 1e-10)

        # Volume Price Trend
        df["vpt"] = (df["close"].pct_change() * df["volume"]).cumsum()

        return df

    # ─────────────────────────────────────────────────────────────────────────
    # Price Patterns / Calendar
    # ─────────────────────────────────────────────────────────────────────────
    def _price_patterns(self, df: pd.DataFrame) -> pd.DataFrame:
        df["hl_spread"]     = df["high"] - df["low"]
        df["oc_spread"]     = df["close"] - df["open"]
        df["close_to_high"] = df["high"]  - df["close"]
        df["close_to_low"]  = df["close"] - df["low"]
        df["gap"]           = df["open"]  - df["close"].shift(1)
        idx = pd.to_datetime(df.index)
        df["day_of_week"]   = idx.dayofweek
        df["month"]         = idx.month
        df["quarter"]       = idx.quarter
        df["is_month_end"]  = idx.is_month_end.astype(int)
        return df

    # ─────────────────────────────────────────────────────────────────────────
    # Target Variables
    # ─────────────────────────────────────────────────────────────────────────
    def _targets(self, df: pd.DataFrame) -> pd.DataFrame:
        future_close         = df["close"].shift(-PREDICTION_HORIZON)
        df["target_return"]  = (future_close - df["close"]) / df["close"]
        df["target_label"]   = (df["target_return"] > 0).astype(int)
        return df

    # ─────────────────────────────────────────────────────────────────────────
    # Persistence
    # ─────────────────────────────────────────────────────────────────────────
    def _save(self, df: pd.DataFrame, ticker: str) -> None:
        FEATURES_DIR.mkdir(parents=True, exist_ok=True)
        path = FEATURES_DIR / f"{ticker}_features.parquet"
        df.to_parquet(path)
        logger.info("Features saved → %s", path.name)
