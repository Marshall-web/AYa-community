"""
End-to-End Training Pipeline  (Phase 5/6)
==========================================
Orchestrates data collection → processing → feature engineering →
model training → evaluation → model saving.

Usage:
    python scripts/train.py --ticker AAPL --model xgboost --task classification
    python scripts/train.py --ticker TSLA --model lstm    --task regression
"""

import argparse
import logging
import sys
from pathlib import Path

import numpy as np
from sklearn.model_selection import train_test_split

# Make project root importable regardless of CWD
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.settings import (
    TEST_SIZE, VALIDATION_SIZE, RANDOM_STATE,
    SEQUENCE_LENGTH,
    LOG_LEVEL, LOG_FORMAT, LOG_DATE_FORMAT,
)
from scripts.data_collector   import YFinanceCollector
from scripts.data_processor   import DataProcessor
from scripts.feature_engineer import FeatureEngineer
from models.model             import get_model, LSTMModel, MODEL_REGISTRY

logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
logger = logging.getLogger(__name__)

DROP_COLS = ["target_label", "target_return"]


# ─────────────────────────────────────────────────────────────────────────────
def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="AlphaVision – Training Pipeline")
    p.add_argument("--ticker",    default="AAPL",           help="Stock ticker (default: AAPL)")
    p.add_argument("--model",     default="xgboost",       choices=list(MODEL_REGISTRY),
                   help="Model type (default: xgboost)")
    p.add_argument("--task",      default="classification", choices=["classification", "regression"],
                   help="Prediction task (default: classification)")
    p.add_argument("--period",    default="5y",            help="yfinance period (default: 5y)")
    p.add_argument("--no-save",   action="store_true",     help="Skip saving the trained model")
    return p.parse_args()


# ─────────────────────────────────────────────────────────────────────────────
def run_pipeline(
    ticker:     str  = "AAPL",
    model_type: str  = "xgboost",
    task:       str  = "classification",
    period:     str  = "5y",
    save:       bool = True,
):
    """
    Full training pipeline. Returns (model, metrics_dict).
    Can be imported and called programmatically (e.g. from the API).
    """
    banner = "=" * 60
    logger.info("%s\n  AlphaVision Training Pipeline\n  Ticker=%s | Model=%s | Task=%s\n%s",
                banner, ticker, model_type, task, banner)

    # ── Phase 2: Collect ─────────────────────────────────────────────────────
    logger.info("▶ PHASE 2 – Data Collection")
    raw_df = YFinanceCollector().fetch(ticker, period=period)

    # ── Phase 3: Process ─────────────────────────────────────────────────────
    logger.info("▶ PHASE 3 – Data Processing")
    clean_df = DataProcessor().process(raw_df, ticker=ticker)

    # ── Phase 4: Features ────────────────────────────────────────────────────
    logger.info("▶ PHASE 4 – Feature Engineering")
    feature_df = FeatureEngineer().build(clean_df, ticker=ticker)

    # ── Split ────────────────────────────────────────────────────────────────
    target_col   = "target_label" if task == "classification" else "target_return"
    feature_cols = [c for c in feature_df.columns if c not in DROP_COLS]

    X = feature_df[feature_cols].values.astype(np.float32)
    y = feature_df[target_col].values.astype(np.float32)

    if model_type == "lstm":
        data = np.column_stack([X, y])
        X, y = LSTMModel.build_sequences(data, SEQUENCE_LENGTH)
        n_features = X.shape[2]

    X_tv, X_test, y_tv, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, shuffle=False, random_state=RANDOM_STATE
    )
    val_frac = VALIDATION_SIZE / (1 - TEST_SIZE)
    X_train, X_val, y_train, y_val = train_test_split(
        X_tv, y_tv, test_size=val_frac, shuffle=False, random_state=RANDOM_STATE
    )

    logger.info("Dataset split → train=%d  val=%d  test=%d",
                len(X_train), len(X_val), len(X_test))

    # ── Phase 5: Train ───────────────────────────────────────────────────────
    logger.info("▶ PHASE 5 – Model Training")
    kwargs = {"task": task}
    if model_type == "lstm":
        kwargs["n_features"] = n_features

    model = get_model(model_type, **kwargs)
    model.train(X_train, y_train, X_val, y_val)

    # ── Phase 6: Evaluate ────────────────────────────────────────────────────
    logger.info("▶ PHASE 6 – Evaluation")
    metrics = model.evaluate(X_test, y_test, task=task)

    # Feature importance (tree models only)
    if hasattr(model, "feature_importance"):
        fi = model.feature_importance(feature_cols)
        logger.info("Top-10 features:\n%s", fi.head(10).to_string(index=False))

    # ── Save ─────────────────────────────────────────────────────────────────
    if save:
        model.save(ticker)

    return model, metrics


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    args = parse_args()
    run_pipeline(
        ticker     = args.ticker,
        model_type = args.model,
        task       = args.task,
        period     = args.period,
        save       = not args.no_save,
    )
