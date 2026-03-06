"""
Reusable Chart Components  (Phase 8)
======================================
Factory functions that return Plotly figure objects consumed by app.py.
"""

import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots


COLOUR = {
    "bg":          "#0d1117",
    "panel":       "#161b22",
    "border":      "#30363d",
    "green":       "#3fb950",
    "red":         "#f85149",
    "yellow":      "#d29922",
    "blue":        "#58a6ff",
    "purple":      "#bc8cff",
    "text":        "#e6edf3",
    "muted":       "#8b949e",
    "buy":         "#3fb950",
    "sell":        "#f85149",
    "hold":        "#d29922",
}

LAYOUT_BASE = dict(
    paper_bgcolor = COLOUR["bg"],
    plot_bgcolor  = COLOUR["panel"],
    font          = dict(color=COLOUR["text"], family="Inter, sans-serif", size=12),
    margin        = dict(l=60, r=20, t=40, b=40),
    legend        = dict(bgcolor=COLOUR["panel"], bordercolor=COLOUR["border"], borderwidth=1),
    xaxis         = dict(gridcolor=COLOUR["border"], showgrid=True, zeroline=False),
    yaxis         = dict(gridcolor=COLOUR["border"], showgrid=True, zeroline=False),
)


# ─────────────────────────────────────────────────────────────────────────────
def candlestick_chart(df: pd.DataFrame, ticker: str) -> go.Figure:
    """Candlestick with Bollinger Bands and volume bars."""
    fig = make_subplots(
        rows=2, cols=1,
        shared_xaxes=True,
        row_heights=[0.75, 0.25],
        vertical_spacing=0.02,
    )

    # Candlestick
    fig.add_trace(go.Candlestick(
        x=df.index,
        open=df["open"], high=df["high"],
        low=df["low"],   close=df["close"],
        name=ticker,
        increasing_line_color=COLOUR["green"],
        decreasing_line_color=COLOUR["red"],
    ), row=1, col=1)

    # Bollinger Bands (if available)
    for col, color, name in [
        ("bb_upper", COLOUR["purple"], "BB Upper"),
        ("bb_mid",   COLOUR["blue"],   "BB Mid"),
        ("bb_lower", COLOUR["purple"], "BB Lower"),
    ]:
        if col in df.columns:
            fig.add_trace(go.Scatter(
                x=df.index, y=df[col],
                name=name,
                line=dict(color=color, width=1, dash="dot"),
                opacity=0.7,
            ), row=1, col=1)

    # SMA 50 / 200
    for col, color, name in [
        ("sma_50",  COLOUR["yellow"], "SMA 50"),
        ("sma_200", COLOUR["blue"],   "SMA 200"),
    ]:
        if col in df.columns:
            fig.add_trace(go.Scatter(
                x=df.index, y=df[col],
                name=name, line=dict(color=color, width=1.5),
            ), row=1, col=1)

    # Volume
    colours = [COLOUR["green"] if c >= o else COLOUR["red"]
               for c, o in zip(df["close"], df["open"])]
    fig.add_trace(go.Bar(
        x=df.index, y=df["volume"],
        marker_color=colours, name="Volume", opacity=0.7,
    ), row=2, col=1)

    layout = {**LAYOUT_BASE,
              "title": f"{ticker} – Price Chart",
              "xaxis_rangeslider_visible": False,
              "height": 600}
    fig.update_layout(**layout)
    return fig


# ─────────────────────────────────────────────────────────────────────────────
def rsi_chart(df: pd.DataFrame) -> go.Figure:
    """RSI panel with overbought/oversold bands."""
    fig = go.Figure()
    if "rsi" not in df.columns:
        return fig

    fig.add_trace(go.Scatter(
        x=df.index, y=df["rsi"],
        name="RSI", line=dict(color=COLOUR["blue"], width=1.5),
    ))
    for level, label, colour in [
        (70, "Overbought", COLOUR["red"]),
        (30, "Oversold",   COLOUR["green"]),
    ]:
        fig.add_hline(y=level, line_dash="dash", line_color=colour,
                      annotation_text=label, annotation_font_color=colour)

    fig.update_layout(
        **{**LAYOUT_BASE,
           "title": "RSI (14)",
           "yaxis": {**LAYOUT_BASE["yaxis"], "range": [0, 100]},
           "height": 220},
    )
    return fig


# ─────────────────────────────────────────────────────────────────────────────
def macd_chart(df: pd.DataFrame) -> go.Figure:
    """MACD line, signal, and histogram."""
    fig = go.Figure()
    if "macd" not in df.columns:
        return fig

    fig.add_trace(go.Scatter(
        x=df.index, y=df["macd"],
        name="MACD", line=dict(color=COLOUR["blue"], width=1.5),
    ))
    fig.add_trace(go.Scatter(
        x=df.index, y=df["macd_sig"],
        name="Signal", line=dict(color=COLOUR["yellow"], width=1.5),
    ))
    hist_cols = [COLOUR["green"] if v >= 0 else COLOUR["red"]
                 for v in df.get("macd_hist", [])]
    fig.add_trace(go.Bar(
        x=df.index, y=df.get("macd_hist"),
        name="Histogram", marker_color=hist_cols, opacity=0.8,
    ))
    fig.update_layout(**{**LAYOUT_BASE, "title": "MACD", "height": 220})
    return fig


# ─────────────────────────────────────────────────────────────────────────────
def signals_chart(df: pd.DataFrame, ticker: str) -> go.Figure:
    """Price line with BUY/SELL/HOLD annotation markers."""
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df.index, y=df["close"],
        name="Close", line=dict(color=COLOUR["blue"], width=2),
    ))

    if "signal" in df.columns:
        for sig, color, sym in [
            ("BUY",  COLOUR["buy"],  "triangle-up"),
            ("SELL", COLOUR["sell"], "triangle-down"),
        ]:
            mask = df["signal"] == sig
            if mask.any():
                fig.add_trace(go.Scatter(
                    x=df.index[mask], y=df["close"][mask],
                    mode="markers",
                    name=sig,
                    marker=dict(color=color, size=10, symbol=sym),
                ))

    if "predicted_return" in df.columns:
        fig.add_trace(go.Scatter(
            x=df.index,
            y=df["close"] * (1 + df["predicted_return"]),
            name="Predicted",
            line=dict(color=COLOUR["purple"], width=1.5, dash="dash"),
        ))

    fig.update_layout(**{**LAYOUT_BASE,
                         "title": f"{ticker} – Predictions & Signals",
                         "height": 400})
    return fig
