"""
Tests for DecisionEngine  (Phase 7 unit tests)
"""

import sys
from pathlib import Path

import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.decision_engine import DecisionEngine, Signal


class TestDecisionEngine:

    def setup_method(self):
        self.engine = DecisionEngine(
            buy_threshold     = 0.02,
            sell_threshold    = -0.02,
            confidence_cutoff = 0.65,
        )

    def test_buy_signal(self):
        ts = self.engine.generate_signal("AAPL", 0.05, 0.80, 150.0)
        assert ts.signal == Signal.BUY

    def test_sell_signal(self):
        ts = self.engine.generate_signal("AAPL", -0.05, 0.80, 150.0)
        assert ts.signal == Signal.SELL

    def test_hold_signal_small_return(self):
        ts = self.engine.generate_signal("AAPL", 0.005, 0.80, 150.0)
        assert ts.signal == Signal.HOLD

    def test_hold_signal_low_confidence(self):
        ts = self.engine.generate_signal("AAPL", 0.05, 0.50, 150.0)
        assert ts.signal == Signal.HOLD

    def test_position_size_zero_for_hold(self):
        ts = self.engine.generate_signal("AAPL", 0.005, 0.80, 150.0)
        assert ts.position_size == 0.0

    def test_position_size_positive_for_buy(self):
        ts = self.engine.generate_signal("AAPL", 0.05, 0.80, 150.0)
        assert ts.position_size > 0.0

    def test_position_size_capped_at_25_pct(self):
        ts = self.engine.generate_signal("AAPL", 1.0, 1.0, 150.0)  # Extreme return
        assert ts.position_size <= 0.25

    def test_batch_signals_returns_dataframe(self):
        df = pd.DataFrame({
            "close":            [150.0, 155.0, 148.0],
            "predicted_return": [ 0.03, -0.03,  0.005],
            "confidence":       [ 0.80,  0.75,  0.70],
        })
        result = self.engine.batch_signals(df, "AAPL")
        assert isinstance(result, pd.DataFrame)
        assert "signal"        in result.columns
        assert "position_size" in result.columns
        assert len(result) == 3

    def test_trade_signal_to_dict(self):
        ts = self.engine.generate_signal("MSFT", 0.04, 0.72, 300.0)
        d  = ts.to_dict()
        assert "signal"           in d
        assert "confidence"       in d
        assert "predicted_return" in d

    def test_signal_ticker_set_correctly(self):
        ts = self.engine.generate_signal("NVDA", 0.06, 0.85, 900.0)
        assert ts.ticker == "NVDA"
