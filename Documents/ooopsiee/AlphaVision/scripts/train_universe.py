"""
Bulk model training for market universes.

Examples:
  python scripts/train_universe.py --market AFRICA --model xgboost --period 5y
  python scripts/train_universe.py --market GHANA --limit 5 --force
  python scripts/train_universe.py --all-markets --dry-run
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.settings import MODELS_DIR, REGION_TICKERS, LOG_LEVEL, LOG_FORMAT, LOG_DATE_FORMAT
from scripts.market_universe import build_screen_markets, load_country_tickers
from scripts.train import run_pipeline

logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Train models for a market/country universe")
    p.add_argument("--market", default="AFRICA", help="Market/country key (e.g. AFRICA, GHANA, US)")
    p.add_argument("--all-markets", action="store_true", help="Train all market groups")
    p.add_argument("--model", default="xgboost", choices=["xgboost", "random_forest", "lstm"])
    p.add_argument("--task", default="classification", choices=["classification", "regression"])
    p.add_argument("--period", default="5y", help="yfinance lookback period")
    p.add_argument("--limit", type=int, default=0, help="Optional max tickers to process per market")
    p.add_argument("--force", action="store_true", help="Retrain even if model file already exists")
    p.add_argument("--dry-run", action="store_true", help="Print training plan without training")
    return p.parse_args()


def _normalize_markets(market: str, all_markets: bool) -> tuple[dict[str, list[str]], list[str]]:
    countries = load_country_tickers()
    screen_markets = build_screen_markets(REGION_TICKERS, countries)
    if all_markets:
        targets = sorted(screen_markets.keys())
        return screen_markets, targets

    lookup = {k.upper(): k for k in screen_markets.keys()}
    mk = market.strip().upper()
    if mk not in lookup:
        raise ValueError(f"Unknown market '{market}'. Available: {sorted(screen_markets.keys())[:20]} ...")
    return screen_markets, [lookup[mk]]


def main() -> int:
    args = parse_args()
    screen_markets, target_markets = _normalize_markets(args.market, args.all_markets)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    total_success = 0
    total_failed = 0
    total_skipped = 0

    for market in target_markets:
        tickers = screen_markets[market]
        if args.limit and args.limit > 0:
            tickers = tickers[: args.limit]
        logger.info("Market=%s | Tickers=%d", market, len(tickers))

        for ticker in tickers:
            model_file = MODELS_DIR / f"{args.model}_{ticker}.pkl"
            if model_file.exists() and not args.force:
                logger.info("Skip %s (model exists)", ticker)
                total_skipped += 1
                continue

            if args.dry_run:
                logger.info("[DRY RUN] Train %s -> %s", ticker, model_file.name)
                continue

            try:
                run_pipeline(
                    ticker=ticker,
                    model_type=args.model,
                    task=args.task,
                    period=args.period,
                    save=True,
                )
                total_success += 1
            except Exception as exc:
                total_failed += 1
                logger.error("Failed %s: %s", ticker, exc)

    logger.info(
        "Training summary | success=%d failed=%d skipped=%d",
        total_success,
        total_failed,
        total_skipped,
    )
    return 0 if total_failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
