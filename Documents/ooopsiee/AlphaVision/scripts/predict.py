"""
Prediction Script  (Phase 7)
==============================
Loads a trained model, builds feature data for the last N months,
generates predictions, and outputs a signals CSV with BUY/SELL/HOLD.

Usage:
    python scripts/predict.py --ticker AAPL --model-path models/saved/xgboost_AAPL.pkl
"""

import argparse
import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.settings import LOG_LEVEL, LOG_FORMAT, LOG_DATE_FORMAT, FEATURES_DIR
from scripts.data_collector   import YFinanceCollector
from scripts.data_processor   import DataProcessor
from scripts.feature_engineer import FeatureEngineer
from scripts.decision_engine  import DecisionEngine
from models.model             import BaseModel

logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
logger = logging.getLogger(__name__)

DROP_COLS = ["target_label", "target_return"]


def predict(
    ticker:     str,
    model_path: str,
    lookback:   str = "2y",   # 2 years ≈ 500 rows — safely covers SMA-200
) -> pd.DataFrame:
    """
    Generate predictions and trading signals for *ticker*.

    Returns a DataFrame with columns:
        close, prediction, confidence, predicted_return, signal, position_size
    """
    # Rebuild recent features
    raw      = YFinanceCollector().fetch(ticker, period=lookback)
    clean    = DataProcessor().process(raw, ticker=ticker)
    features = FeatureEngineer().build(clean, ticker=ticker)

    feature_cols = [c for c in features.columns if c not in DROP_COLS]
    X            = features[feature_cols].values.astype(np.float32)

    # Load model
    model  = BaseModel.load(model_path)
    preds  = model.predict(X)

    # Confidence (probability of class 1 for classifiers)
    if hasattr(model, "predict_proba"):
        probas = model.predict_proba(X)
        conf   = probas[:, 1] if probas.ndim == 2 else probas
    else:
        conf = np.full(len(preds), 0.5)

    # Map binary prediction to approximate expected return
    predicted_return = (preds * 2 - 1) * 0.03   # ±3% proxy

    result  = features[["close"]].copy()
    result["prediction"]       = preds
    result["confidence"]       = conf
    result["predicted_return"] = predicted_return

    # Generate trading signals
    engine  = DecisionEngine()
    signals = engine.batch_signals(result, ticker)

    # Merge signal columns only if they exist in the signals DataFrame
    sig_cols = [c for c in ["signal", "position_size"] if c in signals.columns]
    if sig_cols:
        result = pd.concat([result, signals[sig_cols]], axis=1)

    # Save
    FEATURES_DIR.mkdir(parents=True, exist_ok=True)
    out = FEATURES_DIR / f"{ticker}_signals.csv"
    result.to_csv(out)
    logger.info("Signals saved → %s", out)

    # Log preview (non-fatal if formatting fails)
    try:
        preview_cols = [c for c in ["close", "signal", "confidence", "predicted_return", "position_size"]
                        if c in result.columns]
        logger.info("\nLast 10 predictions:\n%s", result[preview_cols].tail(10).to_string())
    except Exception:
        pass

    return result


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="AlphaVision – Prediction CLI")
    p.add_argument("--ticker",     required=True, help="Stock ticker symbol")
    p.add_argument("--model-path", required=True, help="Path to saved .pkl model")
    p.add_argument("--lookback",   default="2y",
                   help="History period for features (default: 2y, min 1y recommended)")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    predict(args.ticker, args.model_path, args.lookback)
