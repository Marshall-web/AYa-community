"""
Tests for the multi-region stock screener.
"""

import sys
from pathlib import Path
from types import MethodType

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.stock_screener import PotentialStockScreener


def _raw_df(base_price: float) -> pd.DataFrame:
    n = 260
    dates = pd.date_range("2022-01-01", periods=n, freq="B")
    rng = np.random.default_rng(int(base_price * 100))
    noise = rng.normal(0, 0.6, n).cumsum()
    price = np.maximum(base_price + noise, 1.0)
    return pd.DataFrame(
        {
            "Open": price * 0.99,
            "High": price * 1.01,
            "Low": price * 0.98,
            "Close": price,
            "Volume": np.full(n, 1_500_000.0),
        },
        index=dates,
    )


class _FakeCollector:
    def fetch(self, ticker: str, period: str = "1y", interval: str = "1d", force_refresh: bool = False):
        if ticker == "CHEAP":
            return _raw_df(8.0)
        if ticker == "MID":
            return _raw_df(20.0)
        return _raw_df(90.0)


class TestPotentialStockScreener:

    def test_filters_expensive_and_low_confidence_and_sorts(self):
        screener = PotentialStockScreener(
            collector=_FakeCollector(),
            universe_by_region={"US": ["CHEAP", "MID", "EXPENSIVE"]},
        )

        def _fake_predict(self, ticker, model_type, features):
            if ticker == "CHEAP":
                return 0.06, 0.75, "heuristic"
            if ticker == "MID":
                return 0.04, 0.60, "heuristic"
            return 0.09, 0.80, "heuristic"

        screener._predict_latest = MethodType(_fake_predict, screener)
        rows = screener.screen(
            regions=["US"],
            max_price=30.0,
            min_confidence=0.65,
            limit=5,
        )

        assert len(rows) == 1
        assert rows[0]["ticker"] == "CHEAP"
        assert rows[0]["price"] <= 30.0
        assert rows[0]["confidence"] >= 0.65

    def test_unknown_region_raises_value_error(self):
        screener = PotentialStockScreener(collector=_FakeCollector(), universe_by_region={"US": ["CHEAP"]})
        try:
            screener.screen(regions=["MARS"])
            assert False, "Expected ValueError for unknown region"
        except ValueError as exc:
            assert "Unknown region" in str(exc)
