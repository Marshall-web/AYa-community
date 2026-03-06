"""
Tests for FeatureEngineer  (Phase 4 unit tests)
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.data_processor   import DataProcessor
from scripts.feature_engineer import FeatureEngineer


def _make_clean(n: int = 250) -> pd.DataFrame:
    rng   = np.random.default_rng(0)
    dates = pd.date_range("2019-01-01", periods=n, freq="B")
    price = np.abs(100 + rng.standard_normal(n).cumsum()) + 10
    raw   = pd.DataFrame({
        "Open":   price * 0.99,
        "High":   price * 1.01,
        "Low":    price * 0.98,
        "Close":  price,
        "Volume": rng.integers(500_000, 2_000_000, n).astype(float),
    }, index=dates)
    return DataProcessor().process(raw, ticker="_FEAT_TEST")


class TestFeatureEngineer:

    def setup_method(self):
        self.clean = _make_clean()
        self.eng   = FeatureEngineer()

    def test_build_returns_dataframe(self):
        out = self.eng.build(self.clean, ticker="_FEAT_TEST")
        assert isinstance(out, pd.DataFrame)
        assert len(out) > 0

    def test_moving_average_columns_present(self):
        out = self.eng.build(self.clean, ticker="_FEAT_TEST")
        for w in [5, 10, 20, 50, 200]:
            assert f"sma_{w}" in out.columns
            assert f"ema_{w}" in out.columns

    def test_rsi_in_bounds(self):
        out = self.eng.build(self.clean, ticker="_FEAT_TEST")
        assert "rsi" in out.columns
        assert out["rsi"].between(0, 100).all()

    def test_macd_columns_present(self):
        out = self.eng.build(self.clean, ticker="_FEAT_TEST")
        for col in ["macd", "macd_sig", "macd_hist"]:
            assert col in out.columns

    def test_bollinger_bands_ordering(self):
        out = self.eng.build(self.clean, ticker="_FEAT_TEST")
        assert "bb_upper" in out.columns
        assert (out["bb_upper"] >= out["bb_lower"]).all()

    def test_target_columns_present(self):
        out = self.eng.build(self.clean, ticker="_FEAT_TEST")
        assert "target_return"  in out.columns
        assert "target_label"   in out.columns

    def test_target_label_binary(self):
        out = self.eng.build(self.clean, ticker="_FEAT_TEST")
        assert set(out["target_label"].unique()).issubset({0, 1})

    def test_no_nans_after_dropna(self):
        out = self.eng.build(self.clean, ticker="_FEAT_TEST")
        assert not out.isnull().any().any()
