"""
Bulk Training Script
====================
Trains an XGBoost model for every ticker that has a feature parquet file
in data/features/ but does NOT yet have a saved model in models/saved/.

Usage:
    python scripts/train_all.py
    python scripts/train_all.py --model xgboost --task classification --period 5y
    python scripts/train_all.py --retrain   # force-retrain even if model exists
"""

import argparse
import logging
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.settings import FEATURES_DIR, MODELS_DIR, LOG_LEVEL, LOG_FORMAT, LOG_DATE_FORMAT
from scripts.train import run_pipeline

logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="AlphaVision – Bulk Training Pipeline")
    p.add_argument("--model",   default="xgboost",        help="Model type (default: xgboost)")
    p.add_argument("--task",    default="classification",  help="Task type (default: classification)")
    p.add_argument("--period",  default="5y",              help="yfinance period (default: 5y)")
    p.add_argument("--retrain", action="store_true",       help="Retrain even if model already exists")
    return p.parse_args()


def main():
    args = parse_args()

    # ── Discover all tickers with feature files ──────────────────────────────
    feature_files = sorted(FEATURES_DIR.glob("*_features.parquet"))
    if not feature_files:
        logger.error("No feature files found in %s — run data collection first.", FEATURES_DIR)
        sys.exit(1)

    all_tickers = [f.name.replace("_features.parquet", "") for f in feature_files]

    # ── Filter out tickers that already have a saved model ───────────────────
    if args.retrain:
        to_train = all_tickers
        logger.info("--retrain flag set: will retrain ALL %d tickers.", len(to_train))
    else:
        to_train = [
            t for t in all_tickers
            if not (MODELS_DIR / f"{args.model}_{t}.pkl").exists()
        ]
        skipped = len(all_tickers) - len(to_train)
        logger.info(
            "Found %d tickers with features. %d already trained → training %d remaining.",
            len(all_tickers), skipped, len(to_train),
        )

    if not to_train:
        logger.info("All models are already trained. Use --retrain to force retraining.")
        return

    # ── Bulk training loop ───────────────────────────────────────────────────
    trained_ok: list[str] = []
    failed:     list[tuple[str, str]] = []

    total = len(to_train)
    for idx, ticker in enumerate(to_train, start=1):
        banner = f"[{idx}/{total}]"
        logger.info("%s Training  %s  (model=%s, task=%s)", banner, ticker, args.model, args.task)
        t0 = time.time()
        try:
            _, metrics = run_pipeline(
                ticker=ticker,
                model_type=args.model,
                task=args.task,
                period=args.period,
                save=True,
            )
            elapsed = time.time() - t0
            logger.info("%s ✅  %s done in %.1fs  |  metrics: %s", banner, ticker, elapsed, metrics)
            trained_ok.append(ticker)
        except Exception as exc:
            elapsed = time.time() - t0
            logger.warning("%s ❌  %s FAILED after %.1fs: %s", banner, ticker, elapsed, exc)
            failed.append((ticker, str(exc)))

    # ── Summary ──────────────────────────────────────────────────────────────
    sep = "=" * 60
    print(f"\n{sep}")
    print(f"  Bulk Training Complete")
    print(f"  ✅  Trained  : {len(trained_ok)}")
    print(f"  ⏭️  Skipped  : {len(all_tickers) - len(to_train)}")
    print(f"  ❌  Failed   : {len(failed)}")
    print(sep)

    if trained_ok:
        print("\nSuccessfully trained:")
        for t in trained_ok:
            print(f"   • {t}")

    if failed:
        print("\nFailed tickers (check logs above for details):")
        for t, err in failed:
            print(f"   • {t}  —  {err}")

    print()


if __name__ == "__main__":
    main()
