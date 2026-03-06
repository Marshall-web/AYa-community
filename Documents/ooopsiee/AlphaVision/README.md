# AlphaVision 🚀

> An end-to-end AI-powered stock market prediction and trading signal platform.

## Architecture

```
AlphaVision/
├── config/              # Global settings & environment config
├── data/
│   ├── raw/             # Raw OHLCV CSVs from APIs
│   ├── processed/       # Cleaned & normalised Parquet files
│   ├── features/        # Feature-engineered Parquet files
│   └── cache/           # Cached API responses
├── models/
│   ├── saved/           # Trained model .pkl files
│   ├── checkpoints/     # LSTM Keras checkpoints
│   └── logs/            # Training logs
├── scripts/
│   ├── data_collector.py    # Phase 2 – Data ingestion
│   ├── data_processor.py    # Phase 3 – Cleaning & normalisation
│   ├── feature_engineer.py  # Phase 4 – Technical indicators
│   ├── train.py             # Phase 5/6 – Training pipeline CLI
│   ├── predict.py           # Phase 7 – Prediction CLI
│   └── decision_engine.py   # Phase 7 – BUY/SELL/HOLD signals
├── dashboards/
│   ├── app.py               # Phase 8 – Plotly-Dash UI
│   ├── components/charts.py # Reusable chart factories
│   └── assets/style.css     # Dark-mode theme
├── api/
│   ├── main.py              # Phase 9 – FastAPI entry point
│   ├── schemas.py           # Pydantic models
│   ├── routes/              # predict.py, stocks.py
│   └── middleware/auth.py   # API-key authentication
├── tests/                   # Pytest test suite
├── notebooks/               # Jupyter notebooks for exploration
├── Dockerfile               # Phase 10 – Container image
├── docker-compose.yml       # Phase 10 – Multi-service orchestration
├── requirements.txt         # Pinned dependencies
└── .env.example             # Environment variable template
```

## Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Train a model
```bash
python scripts/train.py --ticker AAPL --model xgboost --task classification
```

### 3b. Train a whole market/country universe
```bash
# Example: train Africa universe
python scripts/train_universe.py --market AFRICA --model xgboost --task classification --period 5y

# Example: Ghana only (first 5 tickers)
python scripts/train_universe.py --market GHANA --limit 5
```

### 4. Generate predictions & signals
```bash
python scripts/predict.py --ticker AAPL --model-path models/saved/xgboost_AAPL.pkl
```

### 5. Launch the Dashboard
```bash
python dashboards/app.py
# Open http://localhost:8050
```

### 6. Launch the REST API
```bash
uvicorn api.main:app --reload
# Docs at http://localhost:8000/docs
```

### 7. Docker (all services)
```bash
docker-compose up --build
```

## Available Models

| Model | Type | Speed | Best For |
|---|---|---|---|
| `random_forest` | Ensemble | ⚡ Fast | Baseline, feature importance |
| `xgboost` | Gradient Boost | ⚡ Fast | Best accuracy/speed tradeoff |
| `lstm` | Deep Learning | 🐢 Slow (GPU recommended) | Sequence patterns |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict` | Generate BUY/SELL/HOLD signal |
| `GET` | `/stocks/{ticker}` | Fetch processed OHLCV + features |
| `GET` | `/stocks/screener/picks` | Rank cheap high-potential stocks across regions |
| `GET` | `/health` | Health check |

Country-level screening universe is loaded from:
`data/reference/country_tickers.csv`

## Technology Stack

- **Data:** `yfinance`, `pandas`, `numpy`, `pyarrow`
- **ML:** `scikit-learn`, `xgboost`, `tensorflow`
- **Dashboard:** `plotly`, `dash`, `dash-bootstrap-components`
- **API:** `fastapi`, `uvicorn`, `pydantic`
- **Deployment:** `Docker`, `docker-compose`

## Signals Explained

| Signal | Condition |
|---|---|
| 🟢 **BUY** | Predicted return ≥ +2% AND confidence ≥ 65% |
| 🔴 **SELL** | Predicted return ≤ −2% AND confidence ≥ 65% |
| 🟡 **HOLD** | Return between thresholds OR low confidence |

Position sizes are calculated using the half-Kelly criterion (capped at 25% of portfolio).

## License

MIT
