"""
Tests for DataProcessor  (Phase 3 unit tests)
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.data_processor import DataProcessor


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────
def _make_ohlcv(n: int = 100, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    dates = pd.date_range("2020-01-01", periods=n, freq="B")
    price = 100 + rng.standard_normal(n).cumsum()
    price = np.abs(price) + 10          # ensure positive
    return pd.DataFrame({
        "Open":   price * (1 + rng.uniform(-0.01, 0.01, n)),
        "High":   price * (1 + rng.uniform(0.00,  0.02, n)),
        "Low":    price * (1 - rng.uniform(0.00,  0.02, n)),
        "Close":  price,
        "Volume": rng.integers(1_000_000, 5_000_000, n).astype(float),
    }, index=dates)


# ─────────────────────────────────────────────────────────────────────────────
# Tests
# ─────────────────────────────────────────────────────────────────────────────
class TestDataProcessor:

    def test_process_returns_dataframe(self):
        df  = _make_ohlcv()
        out = DataProcessor().process(df, ticker="_TEST")
        assert isinstance(out, pd.DataFrame)
        assert len(out) > 0

    def test_columns_standardised_lowercase(self):
        df  = _make_ohlcv()
        out = DataProcessor().process(df, ticker="_TEST")
        for col in ["open", "high", "low", "close", "volume"]:
            assert col in out.columns, f"Missing column: {col}"

    def test_no_nans_after_processing(self):
        df  = _make_ohlcv()
        # Introduce some NaN values
        df.iloc[5:8, 3] = np.nan
        out = DataProcessor().process(df, ticker="_TEST")
        assert not out[["open", "high", "low", "close", "volume"]].isnull().any().any()

    def test_all_close_prices_positive(self):
        df  = _make_ohlcv()
        out = DataProcessor().process(df, ticker="_TEST")
        assert (out["close"] > 0).all()

    def test_return_columns_added(self):
        df  = _make_ohlcv()
        out = DataProcessor().process(df, ticker="_TEST")
        for col in ["daily_return", "log_return", "cumulative_return"]:
            assert col in out.columns

    def test_outlier_removal(self):
        df = _make_ohlcv()
        # Inject a massive outlier
        df.iloc[50, df.columns.get_loc("Close")] = 1_000_000
        out = DataProcessor().process(df, ticker="_TEST")
        assert out["close"].max() < 1_000_000

    def test_missing_required_column_raises(self):
        df = _make_ohlcv().drop(columns=["Volume"])
        with pytest.raises(ValueError, match="missing required columns"):
            DataProcessor().process(df, ticker="_TEST")

    def test_fit_transform_scales_to_zero_one(self):
        df  = _make_ohlcv()
        proc = DataProcessor(scaler_type="minmax")
        out  = proc.process(df, ticker="_TEST")
        scaled = proc.fit_transform(out, cols=["close"])
        assert scaled["close"].min() >= 0.0 - 1e-6
        assert scaled["close"].max() <= 1.0 + 1e-6
