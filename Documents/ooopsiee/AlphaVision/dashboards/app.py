"""
AlphaVision Dashboard
=====================
Multi-page Dash app:
1) Market analysis page (single ticker charts + KPIs)
2) Opportunities page (region/country stock recommendations)
"""

import sys
import logging
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

import dash
from dash import dcc, html, dash_table, Input, Output, State
import dash_bootstrap_components as dbc

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.settings import (
    BUY_THRESHOLD,
    CACHE_DIR,
    CONFIDENCE_CUTOFF,
    DASHBOARD_PORT,
    DEFAULT_TICKERS,
    FEATURES_DIR,
    LOG_LEVEL,
    MODELS_DIR,
    RAW_DIR,
    REGION_TICKERS,
    SELL_THRESHOLD,
)
from dashboards.components.charts import candlestick_chart, rsi_chart, macd_chart, signals_chart
from scripts.data_collector import YFinanceCollector
from scripts.data_processor import DataProcessor
from scripts.feature_engineer import FeatureEngineer
from scripts.market_universe import build_screen_markets, load_country_tickers, pretty_market_label
from scripts.stock_screener import PotentialStockScreener

logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger(__name__)


COUNTRY_TICKERS = load_country_tickers()
SCREEN_MARKETS = build_screen_markets(REGION_TICKERS, COUNTRY_TICKERS)
AFRICAN_COUNTRY_KEYS = {
    "GHANA",
    "NIGERIA",
    "EGYPT",
    "KENYA",
    "MOROCCO",
    "SOUTH AFRICA",
    "SENEGAL",
    "CAMEROON",
    "COTE DIVOIRE",
}

# Ensure AFRICA market includes country-level African tickers too.
if "AFRICA" in SCREEN_MARKETS:
    africa_union = set(SCREEN_MARKETS["AFRICA"])
    for country_key in AFRICAN_COUNTRY_KEYS:
        africa_union.update(SCREEN_MARKETS.get(country_key, []))
    SCREEN_MARKETS["AFRICA"] = sorted(africa_union)

DROP_COLS = ["target_label", "target_return"]

app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.DARKLY],
    title="AlphaVision - AI Stock Platform",
    suppress_callback_exceptions=True,
    meta_tags=[{"name": "viewport", "content": "width=device-width, initial-scale=1"}],
)
server = app.server


def _kpi_card(card_id: str, label: str, value: str = "-", sub: str = "", cls: str = "") -> html.Div:
    return html.Div(className=f"kpi-card {cls}", children=[
        html.Div(label, className="kpi-label"),
        html.Div(value, id=card_id, className="kpi-value"),
        html.Div(sub, className="kpi-sub"),
    ])


def market_page_layout() -> html.Div:
    return html.Div([
        html.Div(className="control-panel", children=[
            html.Div([
                html.Div("Ticker", className="control-label"),
                dcc.Dropdown(
                    id="ticker-dropdown",
                    options=[{"label": t, "value": t} for t in DEFAULT_TICKERS],
                    value="AAPL",
                    clearable=False,
                    style={"color": "black"},
                ),
            ]),
            html.Div([
                html.Div("Period", className="control-label"),
                dcc.Dropdown(
                    id="period-dropdown",
                    options=[
                        {"label": "1 Month", "value": "1mo"},
                        {"label": "3 Months", "value": "3mo"},
                        {"label": "6 Months", "value": "6mo"},
                        {"label": "1 Year", "value": "1y"},
                        {"label": "2 Years", "value": "2y"},
                        {"label": "5 Years", "value": "5y"},
                    ],
                    value="1y",
                    clearable=False,
                    style={"color": "black"},
                ),
            ]),
            html.Div([
                html.Div("Model", className="control-label"),
                dcc.Dropdown(
                    id="model-dropdown",
                    options=[
                        {"label": "XGBoost", "value": "xgboost"},
                        {"label": "Random Forest", "value": "random_forest"},
                        {"label": "LSTM", "value": "lstm"},
                    ],
                    value="xgboost",
                    clearable=False,
                    style={"color": "black"},
                ),
            ]),
            html.Div([
                html.Div("Indicators", className="control-label"),
                dcc.Checklist(
                    id="indicator-checklist",
                    options=[
                        {"label": " RSI", "value": "rsi"},
                        {"label": " MACD", "value": "macd"},
                        {"label": " BB", "value": "bb"},
                    ],
                    value=["rsi", "macd", "bb"],
                    inline=True,
                    inputStyle={"marginRight": "4px"},
                    labelStyle={"marginRight": "12px", "color": "#8b949e"},
                ),
            ]),
            html.Div([
                html.Div("Auto Refresh", className="control-label"),
                html.Div([
                    dcc.Interval(id="auto-refresh", interval=60_000, n_intervals=0, disabled=True),
                    dbc.Switch(id="live-toggle", label="Live Mode", value=False,
                               style={"color": "#8b949e", "fontSize": "12px"}),
                ]),
            ]),
            html.Div([
                html.Div("\u00a0", className="control-label"),
                html.Button("Refresh", id="refresh-btn", n_clicks=0, className="av-btn"),
            ]),
        ]),

        html.Div(className="kpi-row", children=[
            _kpi_card("kpi-signal", "Latest Signal", "-", "AI Recommendation", "signal-buy"),
            _kpi_card("kpi-confidence", "Confidence", "-", "Model Accuracy"),
            _kpi_card("kpi-pred-ret", "Predicted Return", "-", "7-Day Forecast"),
            _kpi_card("kpi-price", "Current Price", "-", "Real-time Price"),
            _kpi_card("kpi-vol", "Volatility", "-", "20-Day Historical"),
        ]),

        html.Div(className="chart-card", children=[
            html.Div("Price Action & Technical Analysis", className="chart-title"),
            dcc.Loading(dcc.Graph(id="candle-chart", config={"displayModeBar": True})),
        ]),

        html.Div(className="chart-card", children=[
            html.Div("AI Predictions & Trading Signals", className="chart-title"),
            dcc.Loading(dcc.Graph(id="signal-chart")),
        ]),

        html.Div(className="chart-card", children=[
            html.Div("RSI (Relative Strength Index)", className="chart-title"),
            dcc.Loading(dcc.Graph(id="rsi-chart")),
        ]),

        html.Div(className="chart-card", children=[
            html.Div("MACD (Moving Average Convergence Divergence)", className="chart-title"),
            dcc.Loading(dcc.Graph(id="macd-chart")),
        ]),

        html.Div(
            id="status-bar",
            style={
                "color": "#8b949e",
                "fontSize": "11px",
                "textAlign": "right",
                "marginTop": "12px",
                "paddingBottom": "16px",
            },
        ),
        dcc.Store(id="feature-store"),
    ])


def opportunities_page_layout() -> html.Div:
    market_options = [
        {"label": pretty_market_label(key), "value": key}
        for key in sorted(SCREEN_MARKETS.keys())
    ]
    return html.Div([
        html.Div(className="control-panel", children=[
            html.Div([
                html.Div("Region / Country", className="control-label"),
                dcc.Dropdown(
                    id="market-scope-dropdown",
                    options=market_options,
                    value="US",
                    clearable=False,
                    style={"color": "black"},
                ),
            ]),
            html.Div([
                html.Div("Companies to Recommend", className="control-label"),
                dcc.Slider(
                    id="companies-count-slider",
                    min=3,
                    max=25,
                    step=1,
                    value=10,
                    marks={3: "3", 10: "10", 15: "15", 20: "20", 25: "25"},
                ),
            ]),
            html.Div([
                html.Div("Period", className="control-label"),
                dcc.Dropdown(
                    id="screener-period-dropdown",
                    options=[
                        {"label": "6 Months", "value": "6mo"},
                        {"label": "1 Year", "value": "1y"},
                        {"label": "2 Years", "value": "2y"},
                        {"label": "5 Years", "value": "5y"},
                    ],
                    value="1y",
                    clearable=False,
                    style={"color": "black"},
                ),
            ]),
            html.Div([
                html.Div("Max Price ($)", className="control-label"),
                dcc.Input(id="max-price-input", type="number", min=1, step=1, value=50, className="form-control"),
            ]),
            html.Div([
                html.Div("Min Confidence", className="control-label"),
                dcc.Input(
                    id="min-confidence-input",
                    type="number",
                    min=0.0,
                    max=1.0,
                    step=0.05,
                    value=0.55,
                    className="form-control",
                ),
            ]),
            html.Div([
                html.Div("Model", className="control-label"),
                dcc.Dropdown(
                    id="screener-model-dropdown",
                    options=[
                        {"label": "XGBoost", "value": "xgboost"},
                        {"label": "Random Forest", "value": "random_forest"},
                        {"label": "LSTM", "value": "lstm"},
                    ],
                    value="xgboost",
                    clearable=False,
                    style={"color": "black"},
                ),
            ]),
            html.Div([
                html.Div("\u00a0", className="control-label"),
                html.Button("Generate Picks", id="run-screener-btn", n_clicks=0, className="av-btn"),
            ]),
            html.Div([
                html.Div("Sync Limit", className="control-label"),
                dcc.Input(
                    id="sync-limit-input",
                    type="number",
                    min=1,
                    step=1,
                    value=25,
                    className="form-control",
                ),
            ]),
            html.Div([
                html.Div("\u00a0", className="control-label"),
                html.Button("Sync Market Data", id="sync-data-btn", n_clicks=0, className="av-btn"),
            ]),
        ]),
        html.Div(className="chart-card", children=[
            html.Div("AI Opportunity Recommendations", className="chart-title"),
            html.Div(id="screener-status", className="kpi-sub", style={"marginBottom": "12px"}),
            html.Div(id="screener-table-container"),
        ]),
        html.Div(className="chart-card", children=[
            html.Div("Data Sync Status", className="chart-title"),
            html.Div(id="sync-data-status", className="kpi-sub"),
        ]),
        html.Div(className="chart-card", children=[
            html.Div("Data Coverage", className="chart-title"),
            html.Div(id="coverage-status", className="kpi-sub", style={"marginBottom": "12px"}),
            html.Div(id="coverage-table-container"),
        ]),
    ])


app.layout = html.Div(id="app-shell", children=[
    dcc.Location(id="url", refresh=False),
    html.Div(className="av-header", children=[
        html.Div([
            html.Div("AlphaVision", className="av-logo"),
            html.Div("AI-Powered Stock Prediction Platform", className="av-subtitle"),
        ]),
        html.Div(className="page-nav", children=[
            dcc.Link("Market Analysis", href="/", className="nav-pill"),
            dcc.Link("Opportunities", href="/opportunities", className="nav-pill"),
        ]),
    ]),
    html.Div(id="page-content"),
    html.Div(className="ai-chat-container", children=[
        html.Button(id="ai-chat-btn", className="ai-chat-button", children=[
            html.I(className="fas fa-robot"),
            html.Div(className="notification-badge", children="AI"),
        ])
    ]),
])


@app.callback(
    Output("page-content", "children"),
    Input("url", "pathname"),
)
def render_page(pathname: str):
    if pathname == "/opportunities":
        return opportunities_page_layout()
    return market_page_layout()


@app.callback(
    Output("auto-refresh", "disabled"),
    Input("live-toggle", "value"),
)
def toggle_live(value):
    return not value


@app.callback(
    Output("feature-store", "data"),
    Output("candle-chart", "figure"),
    Output("signal-chart", "figure"),
    Output("rsi-chart", "figure"),
    Output("macd-chart", "figure"),
    Output("kpi-signal", "children"),
    Output("kpi-signal", "className"),
    Output("kpi-confidence", "children"),
    Output("kpi-pred-ret", "children"),
    Output("kpi-price", "children"),
    Output("kpi-vol", "children"),
    Output("status-bar", "children"),
    Input("refresh-btn", "n_clicks"),
    Input("auto-refresh", "n_intervals"),
    Input("ticker-dropdown", "value"),
    Input("period-dropdown", "value"),
    State("model-dropdown", "value"),
    State("indicator-checklist", "value"),
    prevent_initial_call=False,
)
def update_dashboard(n_clicks, n_intervals, ticker, period, model_type, indicators):
    try:
        raw_df = YFinanceCollector().fetch(ticker, period=period)
        clean_df = DataProcessor().process(raw_df, ticker=ticker)
        feature_df = FeatureEngineer().build(clean_df, ticker=ticker)
        prediction_source = "none"

        sig_path = FEATURES_DIR / f"{ticker}_signals.csv"
        if sig_path.exists():
            sig_df = pd.read_csv(sig_path, index_col=0, parse_dates=True)
            merge_cols = [c for c in ["signal", "confidence", "predicted_return"] if c in sig_df.columns]
            if merge_cols:
                feature_df = feature_df.join(sig_df[merge_cols], how="left")
                prediction_source = "saved_signals"

        candle_fig = candlestick_chart(feature_df, ticker)
        signal_fig = signals_chart(feature_df, ticker)
        rsi_fig = rsi_chart(feature_df) if "rsi" in (indicators or []) else {}
        macd_fig = macd_chart(feature_df) if "macd" in (indicators or []) else {}

        latest = feature_df.iloc[-1]
        price = f"${latest['close']:,.2f}"
        vol = f"{latest.get('hist_vol_20', 0) * 100:.1f}%"

        if "signal" in feature_df.columns and feature_df["signal"].notna().any():
            last_sig = feature_df["signal"].dropna().iloc[-1]
            conf = f"{feature_df['confidence'].dropna().iloc[-1]:.1%}"
            pred_ret = f"{feature_df['predicted_return'].dropna().iloc[-1]:+.2%}"
        else:
            # Live inference fallback: model if available, otherwise heuristic.
            screener = PotentialStockScreener(universe_by_region={ticker: [ticker]})
            pred_val, conf_val, src = screener._predict_latest(
                ticker=ticker,
                model_type=model_type,
                features=feature_df,
            )
            if conf_val >= CONFIDENCE_CUTOFF and pred_val >= BUY_THRESHOLD:
                last_sig = "BUY"
            elif conf_val >= CONFIDENCE_CUTOFF and pred_val <= SELL_THRESHOLD:
                last_sig = "SELL"
            else:
                last_sig = "HOLD"
            conf = f"{conf_val:.1%}"
            pred_ret = f"{pred_val:+.2%}"
            prediction_source = src

        sig_cls_map = {
            "BUY": "kpi-value signal-buy",
            "SELL": "kpi-value signal-sell",
            "HOLD": "kpi-value signal-hold",
        }
        sig_cls = sig_cls_map.get(last_sig, "kpi-value")

        status = (
            f"Last updated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | "
            f"{len(feature_df)} rows | source: {prediction_source}"
        )
        return (
            feature_df.to_json(date_format="iso"),
            candle_fig,
            signal_fig,
            rsi_fig,
            macd_fig,
            last_sig,
            sig_cls,
            conf,
            pred_ret,
            price,
            vol,
            status,
        )
    except Exception as exc:
        logger.error("Dashboard error: %s", exc, exc_info=True)
        msg = f"Error: {exc}"
        return (
            None,
            {},
            {},
            {},
            {},
            "ERR",
            "kpi-value signal-sell",
            "-",
            "-",
            "-",
            "-",
            msg,
        )


@app.callback(
    Output("screener-table-container", "children"),
    Output("screener-status", "children"),
    Input("run-screener-btn", "n_clicks"),
    State("market-scope-dropdown", "value"),
    State("companies-count-slider", "value"),
    State("screener-period-dropdown", "value"),
    State("max-price-input", "value"),
    State("min-confidence-input", "value"),
    State("screener-model-dropdown", "value"),
    prevent_initial_call=False,
)
def update_screener(n_clicks, scope, count, period, max_price, min_confidence, model_type):
    try:
        scope = (scope or "US").upper()
        max_price = float(max_price or 50.0)
        min_confidence = float(min_confidence or 0.55)
        count = int(count or 10)

        screener = PotentialStockScreener(universe_by_region=SCREEN_MARKETS)
        picks = screener.screen(
            regions=[scope],
            period=period,
            max_price=max_price,
            min_confidence=min_confidence,
            model_type=model_type or "xgboost",
            limit=count,
        )
        status_suffix = ""

        # If strict filters produce no picks, retry with softer thresholds.
        if not picks:
            relaxed_conf = max(0.35, min_confidence - 0.20)
            relaxed_price = max(75.0, max_price)
            retry_scopes = [scope]
            if scope == "AFRICA":
                retry_scopes.extend([k for k in AFRICAN_COUNTRY_KEYS if k in SCREEN_MARKETS])
            if scope in AFRICAN_COUNTRY_KEYS and "AFRICA" in SCREEN_MARKETS:
                retry_scopes.append("AFRICA")

            for retry_scope in retry_scopes:
                picks = screener.screen(
                    regions=[retry_scope],
                    period=period,
                    max_price=relaxed_price,
                    min_confidence=relaxed_conf,
                    model_type=model_type or "xgboost",
                    limit=count,
                )
                if picks:
                    if retry_scope == scope:
                        status_suffix = (
                            f" (No strict matches; used relaxed filters: "
                            f"max_price={relaxed_price:.0f}, min_confidence={relaxed_conf:.2f})"
                        )
                    else:
                        status_suffix = (
                            f" (No strict matches in {pretty_market_label(scope)}; "
                            f"used Africa-wide relaxed fallback)"
                        )
                    break

        if not picks:
            status = "No companies matched your filters. Try higher max price or lower confidence."
            return html.Div(status, className="kpi-sub"), status

        df = pd.DataFrame(picks)
        df["region"] = df["region"].map(pretty_market_label)
        df["predicted_return"] = (df["predicted_return"] * 100).map(lambda x: f"{x:+.2f}%")
        df["confidence"] = (df["confidence"] * 100).map(lambda x: f"{x:.1f}%")
        df["price"] = df["price"].map(lambda x: f"${x:,.2f}")

        table = dash_table.DataTable(
            columns=[
                {"name": "Ticker", "id": "ticker"},
                {"name": "Region/Country", "id": "region"},
                {"name": "Price", "id": "price"},
                {"name": "Predicted Return", "id": "predicted_return"},
                {"name": "Confidence", "id": "confidence"},
                {"name": "Potential Score", "id": "potential_score"},
                {"name": "Signal", "id": "signal"},
                {"name": "Valuation", "id": "valuation_band"},
                {"name": "Source", "id": "model_source"},
            ],
            data=df.to_dict("records"),
            page_size=min(len(df), 15),
            style_as_list_view=True,
            style_table={"overflowX": "auto"},
            style_header={
                "backgroundColor": "#1a1f2e",
                "color": "#f1f3f5",
                "fontWeight": "700",
                "border": "1px solid #2a3441",
            },
            style_cell={
                "backgroundColor": "#141923",
                "color": "#d0d7e2",
                "border": "1px solid #2a3441",
                "padding": "8px",
                "fontSize": "13px",
                "textAlign": "left",
            },
        )
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        status = (
            f"Generated {len(df)} recommendation(s) for {pretty_market_label(scope)} at {ts}."
            f"{status_suffix}"
        )
        return table, status
    except Exception as exc:
        logger.error("Screener dashboard error: %s", exc, exc_info=True)
        msg = f"Failed to generate recommendations: {exc}"
        return html.Div(msg, className="kpi-sub"), msg


@app.callback(
    Output("coverage-table-container", "children"),
    Output("coverage-status", "children"),
    Input("market-scope-dropdown", "value"),
    Input("screener-model-dropdown", "value"),
    Input("screener-period-dropdown", "value"),
    Input("run-screener-btn", "n_clicks"),
    Input("sync-data-btn", "n_clicks"),
    prevent_initial_call=False,
)
def update_coverage(scope, model_type, period, n_clicks, sync_clicks):
    try:
        scope = (scope or "US").upper()
        tickers = SCREEN_MARKETS.get(scope, [])
        if not tickers:
            msg = f"No tickers mapped for {pretty_market_label(scope)}."
            return html.Div(msg, className="kpi-sub"), msg

        rows = []
        for ticker in tickers:
            has_cache = any(CACHE_DIR.glob(f"{ticker}_*.parquet"))
            has_raw = any(RAW_DIR.glob(f"{ticker}_*.csv"))
            has_features = (FEATURES_DIR / f"{ticker}_features.parquet").exists()
            has_signals = (FEATURES_DIR / f"{ticker}_signals.csv").exists()
            has_model = (MODELS_DIR / f"{model_type}_{ticker}.pkl").exists()

            if has_model:
                readiness = "model_ready"
            elif has_features or has_cache or has_raw:
                readiness = "heuristic_ready"
            else:
                readiness = "missing_data"

            source_hint = "cached" if has_cache else ("raw_only" if has_raw else "none")
            rows.append(
                {
                    "ticker": ticker,
                    "cache": "yes" if has_cache else "no",
                    "raw_data": "yes" if has_raw else "no",
                    "features": "yes" if has_features else "no",
                    "signals": "yes" if has_signals else "no",
                    "model": "yes" if has_model else "no",
                    "source_hint": source_hint,
                    "readiness": readiness,
                }
            )

        df = pd.DataFrame(rows)
        model_ready = int((df["model"] == "yes").sum())
        heuristic_ready = int((df["readiness"] == "heuristic_ready").sum())
        missing = int((df["readiness"] == "missing_data").sum())

        table = dash_table.DataTable(
            columns=[
                {"name": "Ticker", "id": "ticker"},
                {"name": "Cache", "id": "cache"},
                {"name": "Raw Data", "id": "raw_data"},
                {"name": "Features", "id": "features"},
                {"name": "Signals", "id": "signals"},
                {"name": "Model", "id": "model"},
                {"name": "Source Hint", "id": "source_hint"},
                {"name": "Readiness", "id": "readiness"},
            ],
            data=df.to_dict("records"),
            page_size=min(len(df), 15),
            style_as_list_view=True,
            style_table={"overflowX": "auto"},
            style_header={
                "backgroundColor": "#1a1f2e",
                "color": "#f1f3f5",
                "fontWeight": "700",
                "border": "1px solid #2a3441",
            },
            style_cell={
                "backgroundColor": "#141923",
                "color": "#d0d7e2",
                "border": "1px solid #2a3441",
                "padding": "8px",
                "fontSize": "13px",
                "textAlign": "left",
            },
            style_data_conditional=[
                {
                    "if": {"filter_query": "{readiness} = 'model_ready'"},
                    "backgroundColor": "rgba(0, 212, 170, 0.12)",
                    "color": "#9ff5df",
                },
                {
                    "if": {"filter_query": "{readiness} = 'heuristic_ready'"},
                    "backgroundColor": "rgba(255, 217, 61, 0.10)",
                    "color": "#ffe792",
                },
                {
                    "if": {"filter_query": "{readiness} = 'missing_data'"},
                    "backgroundColor": "rgba(255, 71, 87, 0.12)",
                    "color": "#ffb2ba",
                },
            ],
        )
        status = (
            f"{pretty_market_label(scope)} coverage ({period}): {len(df)} tickers | "
            f"model_ready={model_ready}, heuristic_ready={heuristic_ready}, missing_data={missing}"
        )
        return table, status
    except Exception as exc:
        logger.error("Coverage dashboard error: %s", exc, exc_info=True)
        msg = f"Failed to build coverage view: {exc}"
        return html.Div(msg, className="kpi-sub"), msg


@app.callback(
    Output("sync-data-status", "children"),
    Input("sync-data-btn", "n_clicks"),
    State("market-scope-dropdown", "value"),
    State("screener-period-dropdown", "value"),
    State("sync-limit-input", "value"),
    prevent_initial_call=False,
)
def sync_market_data(n_clicks, scope, period, sync_limit):
    if not n_clicks:
        return "Use this to backfill missing raw/features data for the selected market."
    try:
        scope = (scope or "US").upper()
        tickers = SCREEN_MARKETS.get(scope, [])
        if not tickers:
            return f"No tickers mapped for {pretty_market_label(scope)}."

        limit = int(sync_limit or 25)
        limit = max(1, min(limit, len(tickers)))
        selected = tickers[:limit]

        collector = YFinanceCollector()
        processor = DataProcessor()
        engineer = FeatureEngineer()

        ok = 0
        failed = 0
        failed_samples = []
        for ticker in selected:
            try:
                raw_df = collector.fetch(ticker, period=period)
                clean_df = processor.process(raw_df, ticker=ticker)
                engineer.build(clean_df, ticker=ticker)
                ok += 1
            except Exception as exc:
                failed += 1
                if len(failed_samples) < 5:
                    failed_samples.append(f"{ticker}: {exc}")

        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        if failed_samples:
            sample_text = " | ".join(failed_samples)
            return (
                f"Sync complete for {pretty_market_label(scope)} at {now}: "
                f"ok={ok}, failed={failed}. Sample failures -> {sample_text}"
            )
        return f"Sync complete for {pretty_market_label(scope)} at {now}: ok={ok}, failed={failed}."
    except Exception as exc:
        logger.error("Sync data error: %s", exc, exc_info=True)
        return f"Sync failed: {exc}"


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=DASHBOARD_PORT)
