"""
Decision Engine  (Phase 7)
===========================
Converts model predictions into actionable BUY / SELL / HOLD signals
with Kelly-criterion position sizing.

Usage:
    from scripts.decision_engine import DecisionEngine
    engine = DecisionEngine()
    signal = engine.generate_signal("AAPL", predicted_return=0.03,
                                    confidence=0.75, current_price=185.0)
    print(signal)  # [BUY] AAPL @ $185.00 | conf=75.00% | Δ=+3.00% | size=5.00%
"""

import logging
from dataclasses import dataclass, field
from enum import Enum

import numpy as np
import pandas as pd

from config.settings import BUY_THRESHOLD, SELL_THRESHOLD, CONFIDENCE_CUTOFF

logger = logging.getLogger(__name__)


class Signal(str, Enum):
    BUY  = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


@dataclass
class TradeSignal:
    ticker:           str
    signal:           Signal
    confidence:       float
    predicted_return: float
    price:            float
    position_size:    float = 0.0
    notes:            list  = field(default_factory=list)

    def __str__(self) -> str:
        return (
            f"[{self.signal.value:4s}] {self.ticker} @ ${self.price:.2f} | "
            f"conf={self.confidence:.2%} | Δ={self.predicted_return:+.2%} | "
            f"size={self.position_size:.2%}"
        )

    def to_dict(self) -> dict:
        return {
            "ticker":           self.ticker,
            "signal":           self.signal.value,
            "confidence":       round(self.confidence, 4),
            "predicted_return": round(self.predicted_return, 4),
            "price":            round(self.price, 4),
            "position_size":    round(self.position_size, 4),
            "notes":            self.notes,
        }


class DecisionEngine:
    """
    Rules-based signal generator layered on top of ML predictions.

    The buy/sell decision is gated by both:
      1. predicted return magnitude (vs. BUY/SELL thresholds), and
      2. model confidence (vs. confidence_cutoff).

    Position size is computed using the half-Kelly criterion,
    capped at 25 % of portfolio to limit single-stock concentration.
    """

    def __init__(
        self,
        buy_threshold:     float = BUY_THRESHOLD,
        sell_threshold:    float = SELL_THRESHOLD,
        confidence_cutoff: float = CONFIDENCE_CUTOFF,
    ):
        self.buy_threshold     = buy_threshold
        self.sell_threshold    = sell_threshold
        self.confidence_cutoff = confidence_cutoff

    # ─────────────────────────────────────────────────────────────────────────
    def generate_signal(
        self,
        ticker:           str,
        predicted_return: float,
        confidence:       float,
        current_price:    float,
    ) -> TradeSignal:
        notes: list[str] = []

        # Confidence gate
        if confidence < self.confidence_cutoff:
            notes.append(
                f"Low confidence ({confidence:.2%} < threshold {self.confidence_cutoff:.2%})"
            )
            return TradeSignal(ticker, Signal.HOLD, confidence,
                               predicted_return, current_price, 0.0, notes)

        # Signal determination
        if predicted_return >= self.buy_threshold:
            signal = Signal.BUY
        elif predicted_return <= self.sell_threshold:
            signal = Signal.SELL
        else:
            signal = Signal.HOLD
            notes.append(
                f"Return {predicted_return:+.2%} within dead-band "
                f"[{self.sell_threshold:.2%}, {self.buy_threshold:.2%}]"
            )

        position_size = (
            self._kelly_position(predicted_return, confidence)
            if signal != Signal.HOLD
            else 0.0
        )

        ts = TradeSignal(ticker, signal, confidence, predicted_return,
                         current_price, position_size, notes)
        logger.debug(str(ts))   # use debug so batch calls don't flood outputs
        return ts

    # ─────────────────────────────────────────────────────────────────────────
    def batch_signals(
        self,
        df:             pd.DataFrame,
        ticker:         str,
        return_col:     str = "predicted_return",
        confidence_col: str = "confidence",
        price_col:      str = "close",
    ) -> pd.DataFrame:
        """Apply generate_signal to every row; returns annotated DataFrame."""
        rows = []
        for _, row in df.iterrows():
            ts = self.generate_signal(
                ticker,
                float(row[return_col]),
                float(row[confidence_col]),
                float(row[price_col]),
            )
            rows.append({
                "signal":           ts.signal.value,
                "confidence":       ts.confidence,
                "predicted_return": ts.predicted_return,
                "position_size":    ts.position_size,
            })
        result = pd.DataFrame(rows, index=df.index)
        # Single summary log
        counts = result["signal"].value_counts().to_dict()
        logger.info("Signals for %s: %s  (latest: %s)",
                    ticker, counts, result["signal"].iloc[-1])
        return result

    # ─────────────────────────────────────────────────────────────────────────
    def backtest_signals(
        self,
        df: pd.DataFrame,
        signal_col: str = "signal",
        return_col: str = "daily_return",
    ) -> dict:
        """
        Simple backtest: go long on BUY, short on SELL, flat on HOLD.
        Returns cumulative strategy return and Sharpe ratio.
        """
        pos = df[signal_col].map({"BUY": 1, "SELL": -1, "HOLD": 0}).fillna(0)
        strategy_returns = pos.shift(1) * df[return_col]
        cumulative = (1 + strategy_returns).cumprod().iloc[-1] - 1
        sharpe     = (strategy_returns.mean() / (strategy_returns.std() + 1e-10)) * np.sqrt(252)
        return {"cumulative_return": cumulative, "annualised_sharpe": sharpe}

    # ─────────────────────────────────────────────────────────────────────────
    @staticmethod
    def _kelly_position(predicted_return: float, win_prob: float) -> float:
        """
        Half-Kelly position size for stock returns, capped at 25 %.

        For stock returns (R << 1) the classic odds-based Kelly formula
        produces negative values. Instead we use the edge-scaled version:

            f* = edge × |R|    where edge = 2W - 1   (positive when W > 0.5)

        Half-Kelly (×0.5) is applied for conservatism.
        Returns a fraction in [0, 0.25].
        """
        if predicted_return <= 0 or win_prob <= 0.5:
            return 0.0
        edge  = 2 * win_prob - 1          # ranges (0, 1) when W > 0.5
        R     = abs(predicted_return)
        kelly = edge * R                  # scale edge by magnitude of move
        return float(np.clip(kelly * 0.5, 0.0, 0.25))
