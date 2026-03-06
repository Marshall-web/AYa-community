"""
Model Zoo  (Phase 5 & 6)
==========================
Provides three model implementations behind a unified BaseModel interface:
  • RandomForestModel  – fast sklearn ensemble baseline
  • XGBoostModel       – gradient-boosted trees (best accuracy/speed)
  • LSTMModel          – deep-learning sequence model (TensorFlow/Keras)

All models support classification (BUY/SELL label) and regression
(predicted return) tasks.
"""

import logging
import pickle
from abc import ABC, abstractmethod
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score, classification_report,
    mean_squared_error, mean_absolute_error, r2_score,
    roc_auc_score,
)

from config.settings import (
    MODELS_DIR, CHECKPOINTS_DIR,
    RANDOM_STATE,
    SEQUENCE_LENGTH, BATCH_SIZE, EPOCHS, LEARNING_RATE,
    EARLY_STOPPING_PATIENCE,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Abstract base
# ─────────────────────────────────────────────────────────────────────────────
class BaseModel(ABC):
    """Shared interface for all AlphaVision predictive models."""

    name: str = "base"

    @abstractmethod
    def train(self, X_train, y_train, X_val=None, y_val=None):
        ...

    @abstractmethod
    def predict(self, X) -> np.ndarray:
        ...

    def evaluate(self, X_test, y_test, task: str = "classification") -> dict:
        """Compute metrics and log them; returns a metrics dict."""
        preds = self.predict(X_test)

        if task == "classification":
            acc     = accuracy_score(y_test, preds)
            report  = classification_report(y_test, preds, output_dict=True)
            metrics = {"accuracy": acc, "report": report}
            try:
                if hasattr(self, "predict_proba"):
                    probas = self.predict_proba(X_test)
                    p1 = probas[:, 1] if probas.ndim == 2 else probas
                    metrics["roc_auc"] = roc_auc_score(y_test, p1)
            except Exception:
                pass
            logger.info("[%s] Accuracy=%.4f | AUC=%.4f",
                        self.name, acc, metrics.get("roc_auc", float("nan")))
        else:
            rmse    = np.sqrt(mean_squared_error(y_test, preds))
            mae     = mean_absolute_error(y_test, preds)
            r2      = r2_score(y_test, preds)
            metrics = {"rmse": rmse, "mae": mae, "r2": r2}
            logger.info("[%s] RMSE=%.6f | MAE=%.6f | R²=%.4f",
                        self.name, rmse, mae, r2)
        return metrics

    def save(self, ticker: str = "model") -> Path:
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        path = MODELS_DIR / f"{self.name}_{ticker}.pkl"
        with open(path, "wb") as f:
            pickle.dump(self, f)
        logger.info("Model saved → %s", path)
        return path

    @classmethod
    def load(cls, path):
        with open(path, "rb") as f:
            return pickle.load(f)


# ─────────────────────────────────────────────────────────────────────────────
# Random Forest
# ─────────────────────────────────────────────────────────────────────────────
class RandomForestModel(BaseModel):
    name = "random_forest"

    def __init__(self, task: str = "classification", n_estimators: int = 300):
        self.task = task
        Cls = RandomForestClassifier if task == "classification" else RandomForestRegressor
        self.model = Cls(
            n_estimators=n_estimators,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
        )

    def train(self, X_train, y_train, X_val=None, y_val=None):
        logger.info("Training RandomForest [%s] on %d samples …", self.task, len(X_train))
        self.model.fit(X_train, y_train)
        if X_val is not None:
            self.evaluate(X_val, y_val, task=self.task)
        return self

    def predict(self, X) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X) -> np.ndarray:
        return self.model.predict_proba(X)

    def feature_importance(self, feature_names: list) -> pd.DataFrame:
        return (
            pd.DataFrame({
                "feature":    feature_names,
                "importance": self.model.feature_importances_,
            })
            .sort_values("importance", ascending=False)
            .reset_index(drop=True)
        )


# ─────────────────────────────────────────────────────────────────────────────
# XGBoost
# ─────────────────────────────────────────────────────────────────────────────
class XGBoostModel(BaseModel):
    name = "xgboost"

    def __init__(self, task: str = "classification"):
        self.task = task
        try:
            import xgboost as xgb
        except ImportError:
            raise ImportError("pip install xgboost")

        common = dict(
            n_estimators=500,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=RANDOM_STATE,
            tree_method="hist",
        )
        if task == "classification":
            self.model = xgb.XGBClassifier(
                **common,
                eval_metric="logloss",
                use_label_encoder=False,
            )
        else:
            self.model = xgb.XGBRegressor(**common, eval_metric="rmse")

    def train(self, X_train, y_train, X_val=None, y_val=None):
        logger.info("Training XGBoost [%s] on %d samples …", self.task, len(X_train))
        eval_set = [(X_val, y_val)] if X_val is not None else []
        self.model.fit(
            X_train, y_train,
            eval_set=eval_set,
            verbose=False,
        )
        if X_val is not None:
            self.evaluate(X_val, y_val, task=self.task)
        return self

    def predict(self, X) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X) -> np.ndarray:
        return self.model.predict_proba(X)


# ─────────────────────────────────────────────────────────────────────────────
# LSTM  (TensorFlow / Keras)
# ─────────────────────────────────────────────────────────────────────────────
class LSTMModel(BaseModel):
    name = "lstm"

    def __init__(self, n_features: int = 1, task: str = "classification"):
        self.n_features = n_features
        self.task       = task
        self.history_   = None
        self._model     = None

    # Build Keras graph
    def _build(self):
        try:
            import tensorflow as tf
            from tensorflow.keras import layers, models, optimizers
        except ImportError:
            raise ImportError("pip install tensorflow")

        inp = layers.Input(shape=(SEQUENCE_LENGTH, self.n_features))
        x   = layers.LSTM(128, return_sequences=True)(inp)
        x   = layers.Dropout(0.2)(x)
        x   = layers.LSTM(64,  return_sequences=True)(x)
        x   = layers.Dropout(0.2)(x)
        x   = layers.LSTM(32,  return_sequences=False)(x)
        x   = layers.Dense(32, activation="relu")(x)
        x   = layers.BatchNormalization()(x)

        if self.task == "classification":
            out  = layers.Dense(1, activation="sigmoid")(x)
            loss = "binary_crossentropy"
            mets = ["accuracy"]
        else:
            out  = layers.Dense(1)(x)
            loss = "huber"
            mets = ["mae"]

        m = models.Model(inp, out)
        m.compile(optimizer=optimizers.Adam(LEARNING_RATE), loss=loss, metrics=mets)
        return m

    def train(self, X_train, y_train, X_val=None, y_val=None):
        try:
            from tensorflow.keras.callbacks import (
                EarlyStopping, ModelCheckpoint, ReduceLROnPlateau,
            )
        except ImportError:
            raise ImportError("pip install tensorflow")

        logger.info("Training LSTM [%s] — %d sequences ×  %d features …",
                    self.task, len(X_train), self.n_features)
        self._model = self._build()

        CHECKPOINTS_DIR.mkdir(parents=True, exist_ok=True)
        ckpt = str(CHECKPOINTS_DIR / "lstm_best.keras")
        callbacks = [
            EarlyStopping(patience=EARLY_STOPPING_PATIENCE, restore_best_weights=True),
            ModelCheckpoint(ckpt, save_best_only=True),
            ReduceLROnPlateau(patience=5, factor=0.5, min_lr=1e-6, verbose=0),
        ]
        val_data = (X_val, y_val) if X_val is not None else None
        self.history_ = self._model.fit(
            X_train, y_train,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            validation_data=val_data,
            callbacks=callbacks,
            verbose=1,
        )
        return self

    def predict(self, X) -> np.ndarray:
        raw = self._model.predict(X, verbose=0).flatten()
        return (raw >= 0.5).astype(int) if self.task == "classification" else raw

    def predict_proba(self, X) -> np.ndarray:
        return self._model.predict(X, verbose=0).flatten()

    # ── Sequence helper ───────────────────────────────────────────────────────
    @staticmethod
    def build_sequences(data: np.ndarray, seq_len: int = SEQUENCE_LENGTH):
        """
        Convert a 2-D array (timesteps × features) into supervised sequences.

        Parameters
        ----------
        data    : shape (T, F+1)  ← last column is the target
        seq_len : look-back window

        Returns
        -------
        X : (T-seq_len, seq_len, F)
        y : (T-seq_len,)
        """
        X, y = [], []
        for i in range(seq_len, len(data)):
            X.append(data[i - seq_len : i, :-1])
            y.append(data[i, -1])
        return np.array(X), np.array(y)


# ─────────────────────────────────────────────────────────────────────────────
# Registry / Factory
# ─────────────────────────────────────────────────────────────────────────────
MODEL_REGISTRY = {
    "random_forest": RandomForestModel,
    "xgboost":       XGBoostModel,
    "lstm":          LSTMModel,
}


def get_model(model_type: str, **kwargs) -> BaseModel:
    """Instantiate a model by name."""
    if model_type not in MODEL_REGISTRY:
        raise ValueError(
            f"Unknown model '{model_type}'. "
            f"Available: {list(MODEL_REGISTRY)}"
        )
    return MODEL_REGISTRY[model_type](**kwargs)
