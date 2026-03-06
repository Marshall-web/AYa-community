"""
Tests for the FastAPI REST API  (Phase 9 unit tests)
Uses httpx.TestClient (no real server needed).
"""

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.main import app

# Use the dev API key (set in middleware as default)
HEADERS = {"X-API-Key": "alphavision-dev-key"}

client = TestClient(app, raise_server_exceptions=False)


class TestHealthEndpoint:

    def test_health_returns_200(self):
        r = client.get("/health")
        assert r.status_code == 200

    def test_health_response_schema(self):
        r = client.get("/health")
        data = r.json()
        assert data["status"] == "ok"
        assert "version" in data

    def test_root_returns_200(self):
        r = client.get("/")
        assert r.status_code == 200


class TestAuthMiddleware:

    def test_missing_key_returns_401(self):
        r = client.get("/stocks/AAPL")
        assert r.status_code == 401

    def test_wrong_key_returns_401(self):
        r = client.get("/stocks/AAPL", headers={"X-API-Key": "wrong"})
        assert r.status_code == 401

    def test_correct_key_passes(self):
        # Any non-404, non-401, non-500 response means auth passed
        r = client.get("/stocks/FAKE_TICKER_THAT_WONT_EXIST", headers=HEADERS)
        assert r.status_code != 401


class TestPredictEndpoint:

    def test_predict_no_model_returns_404(self):
        """No model has been trained, so 404 is expected."""
        payload = {
            "ticker":     "__NONEXISTENT__",
            "model_type": "xgboost",
            "task":       "classification",
            "lookback":   "1mo",
        }
        r = client.post("/predict", json=payload, headers=HEADERS)
        assert r.status_code == 404

    def test_predict_invalid_ticker_returns_error(self):
        payload = {
            "ticker":     "!!!INVALID!!!",
            "model_type": "xgboost",
            "task":       "classification",
            "lookback":   "1mo",
        }
        r = client.post("/predict", json=payload, headers=HEADERS)
        # Either 404 (no model) or 500 (data error) – both acceptable; not 200
        assert r.status_code in {404, 500}


class TestStocksEndpoint:

    def test_docs_accessible(self):
        r = client.get("/docs")
        assert r.status_code == 200

    def test_openapi_schema(self):
        r = client.get("/openapi.json")
        assert r.status_code == 200
        schema = r.json()
        assert "paths" in schema
        assert "/health" in schema["paths"]


class TestScreenerEndpoint:

    def test_screener_returns_ranked_rows(self, monkeypatch):
        fake = [{
            "ticker": "SOFI",
            "region": "US",
            "price": 8.5,
            "predicted_return": 0.041,
            "confidence": 0.73,
            "potential_score": 74.2,
            "signal": "BUY",
            "valuation_band": "ultra_cheap",
            "model_source": "heuristic",
        }]

        def _fake_screen(self, **kwargs):
            return fake

        monkeypatch.setattr(
            "api.routes.stocks.PotentialStockScreener.screen",
            _fake_screen,
        )

        r = client.get("/stocks/screener/picks?regions=US&max_price=20", headers=HEADERS)
        assert r.status_code == 200
        data = r.json()
        assert data["rows"] == 1
        assert data["data"][0]["ticker"] == "SOFI"
        assert data["data"][0]["potential_score"] > 0

    def test_screener_bad_region_returns_400(self, monkeypatch):
        def _bad(self, **kwargs):
            raise ValueError("Unknown region(s): ['MARS']")

        monkeypatch.setattr(
            "api.routes.stocks.PotentialStockScreener.screen",
            _bad,
        )

        r = client.get("/stocks/screener/picks?regions=MARS", headers=HEADERS)
        assert r.status_code == 400
