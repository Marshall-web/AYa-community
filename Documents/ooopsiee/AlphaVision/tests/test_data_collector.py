"""
Tests for data source fallback behavior in YFinanceCollector.
"""

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts import data_collector as dc


def _sample_ohlcv() -> pd.DataFrame:
    idx = pd.date_range("2024-01-01", periods=30, freq="B")
    return pd.DataFrame(
        {
            "Open": [10 + i * 0.1 for i in range(len(idx))],
            "High": [10.5 + i * 0.1 for i in range(len(idx))],
            "Low": [9.5 + i * 0.1 for i in range(len(idx))],
            "Close": [10.2 + i * 0.1 for i in range(len(idx))],
            "Volume": [1_000_000] * len(idx),
        },
        index=idx,
    )


class TestYFinanceFallback:

    def test_uses_alpha_fallback_when_yfinance_empty(self, monkeypatch):
        tmp_dir = Path("data/cache/test_tmp")
        tmp_dir.mkdir(parents=True, exist_ok=True)
        cache_file = tmp_dir / "TEST_1d_1y.parquet"
        monkeypatch.setattr(dc, "_cache_path", lambda ticker, interval, period: cache_file)
        monkeypatch.setattr(dc, "_is_fresh", lambda path, max_age_hours=6.0: False)
        monkeypatch.setattr(dc, "RAW_DIR", tmp_dir)
        monkeypatch.setattr(dc.yf, "download", lambda *a, **k: pd.DataFrame())

        fallback_df = _sample_ohlcv()
        monkeypatch.setattr(
            dc.YFinanceCollector,
            "_fetch_alpha_vantage_fallback",
            lambda self, ticker: fallback_df,
        )

        out = dc.YFinanceCollector(enable_fallback=True).fetch("TEST", period="1y")
        assert not out.empty
        assert "Close" in out.columns

    def test_uses_stale_cache_when_all_live_sources_fail(self, monkeypatch):
        tmp_dir = Path("data/cache/test_tmp")
        tmp_dir.mkdir(parents=True, exist_ok=True)
        cache_file = tmp_dir / "FAIL_1d_1y.parquet"
        stale_df = _sample_ohlcv()
        stale_df.to_parquet(cache_file)

        monkeypatch.setattr(dc, "_cache_path", lambda ticker, interval, period: cache_file)
        monkeypatch.setattr(dc, "_is_fresh", lambda path, max_age_hours=6.0: False)
        monkeypatch.setattr(dc, "RAW_DIR", tmp_dir)
        monkeypatch.setattr(dc.yf, "download", lambda *a, **k: pd.DataFrame())
        monkeypatch.setattr(
            dc.YFinanceCollector,
            "_fetch_alpha_vantage_fallback",
            lambda self, ticker: pd.DataFrame(),
        )

        out = dc.YFinanceCollector(enable_fallback=True).fetch("FAIL", period="1y")
        assert len(out) == len(stale_df)
