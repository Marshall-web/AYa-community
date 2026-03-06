"""
Prediction Route  (Phase 9)
============================
POST /predict  – Generate BUY/SELL/HOLD signal for a ticker.
POST /train    – Trigger a new training run and save the model.
"""

import sys
import logging
from pathlib import Path

import numpy as np
from fastapi import APIRouter, HTTPException

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from api.schemas import PredictRequest, PredictResponse, TrainRequest, TrainResponse
from config.settings import MODELS_DIR
from scripts.data_collector   import YFinanceCollector
from scripts.data_processor   import DataProcessor
from scripts.feature_engineer import FeatureEngineer
from scripts.decision_engine  import DecisionEngine
from models.model             import BaseModel, get_model, MODEL_REGISTRY

router = APIRouter(prefix="/predict", tags=["Predictions"])
logger = logging.getLogger(__name__)

DROP_COLS = ["target_label", "target_return"]


@router.post("", response_model=PredictResponse, summary="Generate trading signal")
async def predict_signal(req: PredictRequest):
    """
    Build feature data for *ticker*, load the matching saved model,
    and return the latest BUY / SELL / HOLD signal.
    """
    model_file = MODELS_DIR / f"{req.model_type}_{req.ticker}.pkl"
    if not model_file.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                f"No trained model found for ticker '{req.ticker}' / model '{req.model_type}'. "
                f"Call POST /predict/train first."
            ),
        )

    try:
        raw      = YFinanceCollector().fetch(req.ticker, period=req.lookback)
        clean    = DataProcessor().process(raw, ticker=req.ticker)
        features = FeatureEngineer().build(clean, ticker=req.ticker)

        feature_cols = [c for c in features.columns if c not in DROP_COLS]
        X            = features[feature_cols].values.astype(np.float32)

        model  = BaseModel.load(model_file)
        pred   = model.predict(X[-1:])

        if hasattr(model, "predict_proba"):
            probas = model.predict_proba(X[-1:])
            conf   = float(probas[0, 1] if probas.ndim == 2 else probas[0])
        else:
            conf = 0.5

        pred_return = (float(pred[0]) * 2 - 1) * 0.03
        price       = float(features["close"].iloc[-1])

        engine = DecisionEngine()
        ts     = engine.generate_signal(req.ticker, pred_return, conf, price)

        return PredictResponse(
            ticker        = req.ticker,
            latest_signal = ts.to_dict(),
            model_type    = req.model_type,
            rows_analysed = len(features),
        )

    except Exception as exc:
        logger.error("Prediction failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/train", response_model=TrainResponse, summary="Train and save a model")
async def train_model(req: TrainRequest):
    """
    Run the full training pipeline for *ticker* and save the model.
    This may take several minutes.
    """
    try:
        from scripts.train import run_pipeline
        model, metrics = run_pipeline(
            ticker     = req.ticker,
            model_type = req.model_type,
            task       = req.task,
            period     = req.period,
            save       = True,
        )
        model_path = str(MODELS_DIR / f"{req.model_type}_{req.ticker}.pkl")
        return TrainResponse(
            ticker     = req.ticker,
            model_type = req.model_type,
            task       = req.task,
            model_path = model_path,
            metrics    = {k: v for k, v in metrics.items() if k != "report"},
        )
    except Exception as exc:
        logger.error("Training failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
