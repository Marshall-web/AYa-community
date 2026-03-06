"""
Multi-Region Cheap-Stock Screener
=================================
Ranks stocks by a blended "potential score" that favors:
1) low absolute price ("cheap")
2) positive expected move
3) higher prediction confidence

The screener uses a saved model per ticker when available and falls back to
a lightweight heuristic when no model exists.
"""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

from config.settings import MODELS_DIR, REGION_TICKERS
from models.model import BaseModel
from scripts.data_collector import YFinanceCollector
from scripts.data_processor import DataProcessor
from scripts.feature_engineer import FeatureEngineer

logger = logging.getLogger(__name__)

DROP_COLS = ["target_label", "target_return"]


class PotentialStockScreener:
    """Score and rank cheap, high-upside stocks across regions/countries."""

    def __init__(
        self,
        collector: YFinanceCollector | None = None,
        processor: DataProcessor | None = None,
        feature_engineer: FeatureEngineer | None = None,
        universe_by_region: dict[str, list[str]] | None = None,
    ):
        self.collector = collector or YFinanceCollector()
        self.processor = processor or DataProcessor()
        self.feature_engineer = feature_engineer or FeatureEngineer()
        self.universe_by_region = universe_by_region or REGION_TICKERS

    def screen(
        self,
        regions: list[str] | None = None,
        period: str = "1y",
        max_price: float = 50.0,
        min_confidence: float = 0.55,
        model_type: str = "xgboost",
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        region_lookup = {str(key).upper(): key for key in self.universe_by_region.keys()}
        requested = regions or list(self.universe_by_region.keys())
        normalized = [str(r).strip().upper() for r in requested]
        unknown = [r for r in normalized if r not in region_lookup]
        if unknown:
            raise ValueError(f"Unknown region(s): {unknown}")
        chosen_regions = [region_lookup[r] for r in normalized]

        rows: list[dict[str, Any]] = []
        for region in chosen_regions:
            for ticker in self.universe_by_region[region]:
                try:
                    raw = self.collector.fetch(ticker, period=period)
                    clean = self.processor.process(raw, ticker=ticker)
                    features = self.feature_engineer.build(clean, ticker=ticker)
                    latest = features.iloc[-1]
                    price = float(latest["close"])

                    if price > max_price:
                        continue

                    pred_return, confidence, source = self._predict_latest(
                        ticker=ticker,
                        model_type=model_type,
                        features=features,
                    )
                    if confidence < min_confidence:
                        continue

                    score = self._potential_score(
                        price=price,
                        max_price=max_price,
                        predicted_return=pred_return,
                        confidence=confidence,
                        volatility=float(latest.get("hist_vol_20", 0.0)),
                    )

                    rows.append(
                        {
                            "ticker": ticker,
                            "region": region,
                            "price": round(price, 4),
                            "predicted_return": round(pred_return, 6),
                            "confidence": round(confidence, 6),
                            "potential_score": round(score, 4),
                            "signal": "BUY" if pred_return > 0 else "HOLD",
                            "valuation_band": self._valuation_band(price),
                            "model_source": source,
                        }
                    )
                except Exception as exc:
                    logger.warning("Screener skipped %s (%s): %s", ticker, region, exc)
                    continue

        rows.sort(key=lambda x: x["potential_score"], reverse=True)
        return rows[:limit]

    def _predict_latest(
        self,
        ticker: str,
        model_type: str,
        features: pd.DataFrame,
    ) -> tuple[float, float, str]:
        model_path = MODELS_DIR / f"{model_type}_{ticker}.pkl"
        if model_path.exists():
            try:
                feature_cols = [c for c in features.columns if c not in DROP_COLS]
                X = features[feature_cols].values.astype(np.float32)
                model = BaseModel.load(model_path)
                pred = float(model.predict(X[-1:])[0])
                if hasattr(model, "predict_proba"):
                    probas = model.predict_proba(X[-1:])
                    conf = float(probas[0, 1] if np.ndim(probas) == 2 else probas[0])
                else:
                    conf = 0.5
                pred_return = (pred * 2 - 1) * 0.03
                return float(pred_return), float(np.clip(conf, 0.0, 1.0)), "model"
            except Exception as exc:
                logger.warning("Model prediction failed for %s: %s", ticker, exc)

        return self._heuristic_prediction(features), self._heuristic_confidence(features), "heuristic"

    @staticmethod
    def _heuristic_prediction(features: pd.DataFrame) -> float:
        latest = features.iloc[-1]
        momentum = (
            float(latest.get("roc_5", 0.0))
            + float(latest.get("roc_10", 0.0))
            + float(latest.get("roc_20", 0.0))
        ) / 300.0
        trend = (
            float(latest.get("price_to_sma_20", 0.0))
            + float(latest.get("price_to_sma_50", 0.0))
        ) / 2.0
        rsi = float(latest.get("rsi", 50.0))
        rsi_bonus = 0.01 if 35 <= rsi <= 65 else -0.01
        pred_return = 0.5 * momentum + 0.4 * trend + 0.1 * rsi_bonus
        return float(np.clip(pred_return, -0.2, 0.2))

    @staticmethod
    def _heuristic_confidence(features: pd.DataFrame) -> float:
        latest = features.iloc[-1]
        momentum = abs(
            float(latest.get("roc_5", 0.0))
            + float(latest.get("roc_10", 0.0))
            + float(latest.get("roc_20", 0.0))
        ) / 300.0
        trend = abs(
            float(latest.get("price_to_sma_20", 0.0))
            + float(latest.get("price_to_sma_50", 0.0))
        ) / 2.0
        vol = min(float(latest.get("hist_vol_20", 0.0)), 1.0)
        conf = 0.45 + (momentum * 2.0) + (trend * 1.5) - (vol * 0.15)
        return float(np.clip(conf, 0.35, 0.9))

    @staticmethod
    def _potential_score(
        price: float,
        max_price: float,
        predicted_return: float,
        confidence: float,
        volatility: float,
    ) -> float:
        upside = max(predicted_return, 0.0) * 100.0
        cheapness = max(0.0, (max_price - price) / max_price) * 100.0
        conf = confidence * 100.0
        vol_penalty = min(max(volatility, 0.0), 1.0) * 8.0
        score = (0.45 * upside) + (0.35 * cheapness) + (0.2 * conf) - vol_penalty
        return float(np.clip(score, 0.0, 100.0))

    @staticmethod
    def _valuation_band(price: float) -> str:
        if price <= 10:
            return "ultra_cheap"
        if price <= 25:
            return "cheap"
        if price <= 50:
            return "affordable"
        return "premium"
