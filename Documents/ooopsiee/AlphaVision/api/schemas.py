"""
Pydantic Request/Response Schemas  (Phase 9)
"""

from pydantic import BaseModel, Field
from typing import Optional


class PredictRequest(BaseModel):
    ticker:     str = Field(..., example="AAPL", description="Stock ticker symbol")
    model_type: str = Field("xgboost", example="xgboost",
                            description="Model type: random_forest | xgboost | lstm")
    task:       str = Field("classification", example="classification",
                            description="Task type: classification | regression")
    lookback:   str = Field("6mo", example="6mo",
                            description="yfinance period for feature generation")


class TradeSignalResponse(BaseModel):
    ticker:           str
    signal:           str           # BUY | SELL | HOLD
    confidence:       float
    predicted_return: float
    price:            float
    position_size:    float
    notes:            list[str]


class PredictResponse(BaseModel):
    ticker:       str
    latest_signal: TradeSignalResponse
    model_type:   str
    rows_analysed: int


class OHLCVRow(BaseModel):
    date:   str
    open:   float
    high:   float
    low:    float
    close:  float
    volume: float


class StockResponse(BaseModel):
    ticker:   str
    period:   str
    rows:     int
    data:     list[OHLCVRow]


class PotentialStockRow(BaseModel):
    ticker: str
    region: str
    price: float
    predicted_return: float
    confidence: float
    potential_score: float
    signal: str
    valuation_band: str
    model_source: str


class ScreenerResponse(BaseModel):
    regions: list[str]
    period: str
    max_price: float
    min_confidence: float
    model_type: str
    rows: int
    data: list[PotentialStockRow]
    generated_at: str


class HealthResponse(BaseModel):
    status:  str
    version: str
    message: Optional[str] = None


class TrainRequest(BaseModel):
    ticker:     str = Field(..., example="AAPL")
    model_type: str = Field("xgboost", example="xgboost")
    task:       str = Field("classification", example="classification")
    period:     str = Field("5y", example="5y")


class TrainResponse(BaseModel):
    ticker:     str
    model_type: str
    task:       str
    model_path: str
    metrics:    dict
