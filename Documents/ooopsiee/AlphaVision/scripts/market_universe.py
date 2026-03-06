"""
Market universe helpers for region/country stock screening.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from config.settings import COUNTRY_TICKERS_FILE, REGION_TICKERS

COUNTRY_CODE_MAP = {
    "NG": "NIGERIA",
    "GH": "GHANA",
    "KE": "KENYA",
    "EG": "EGYPT",
    "ZA": "SOUTH AFRICA",
    "MA": "MOROCCO",
    "SN": "SENEGAL",
    "CM": "CAMEROON",
    "CI": "COTE DIVOIRE",
    "BR": "BRAZIL",
    "MX": "MEXICO",
    "AR": "ARGENTINA",
    "CL": "CHILE",
    "CO": "COLOMBIA",
    "PE": "PERU",
    "SA": "SAUDI ARABIA",
    "AE": "UNITED ARAB EMIRATES",
    "QA": "QATAR",
    "KW": "KUWAIT",
    "BH": "BAHRAIN",
    "PK": "PAKISTAN",
    "BD": "BANGLADESH",
    "LK": "SRI LANKA",
    "VN": "VIETNAM",
    "TH": "THAILAND",
    "ID": "INDONESIA",
    "MY": "MALAYSIA",
    "SG": "SINGAPORE",
    "PH": "PHILIPPINES",
    "US": "USA",
    "UK": "UNITED KINGDOM",
    "EU": "EUROPE",
}


def load_country_tickers(path: Path | None = None) -> dict[str, list[str]]:
    csv_path = path or COUNTRY_TICKERS_FILE
    if not Path(csv_path).exists():
        return {}

    df = pd.read_csv(csv_path, dtype=str)
    if "ticker" not in df.columns:
        raise ValueError("country_tickers.csv must contain a 'ticker' column.")

    if "country" in df.columns:
        country_col = "country"
    elif "country_code" in df.columns:
        country_col = "country_code"
    else:
        raise ValueError("country_tickers.csv must contain either 'country' or 'country_code'.")

    out: dict[str, list[str]] = {}
    for _, row in df.dropna(subset=["ticker", country_col]).iterrows():
        raw_country = str(row[country_col]).strip().upper()
        country = COUNTRY_CODE_MAP.get(raw_country, raw_country)
        ticker = str(row["ticker"]).strip().upper()
        if not ticker:
            continue
        out.setdefault(country, [])
        if ticker not in out[country]:
            out[country].append(ticker)
    return out


def build_screen_markets(
    regions: dict[str, list[str]] | None = None,
    countries: dict[str, list[str]] | None = None,
) -> dict[str, list[str]]:
    region_map = regions or REGION_TICKERS
    merged: dict[str, list[str]] = {}

    def _add(key: str, items: set[str]) -> None:
        if not items:
            return
        merged.setdefault(key, [])
        current = set(merged[key])
        current.update(items)
        merged[key] = sorted(current)

    for key, tickers in region_map.items():
        key_u = str(key).upper()
        items = {str(t).upper() for t in tickers if str(t).strip()}
        _add(key_u, items)

        # Build canonical aliases from prefixed region keys, e.g. "US - Tech" -> "US".
        prefix = key_u.split(" - ")[0].split(" – ")[0].split(" — ")[0].strip()
        alias = None
        if prefix.startswith("US"):
            alias = "US"
        elif prefix.startswith("EUROPE"):
            alias = "EU"
        elif prefix.startswith("UK"):
            alias = "UK"
        elif prefix.startswith("ASIA"):
            alias = "ASIA"
        elif prefix.startswith("AFRICA"):
            alias = "AFRICA"
        elif prefix.startswith("LATIN AMERICA"):
            alias = "LATAM"
        elif prefix.startswith("MIDDLE EAST"):
            alias = "MIDEAST"
        if alias:
            _add(alias, items)

    for key, tickers in (countries or {}).items():
        if not tickers:
            continue
        _add(key.upper(), {str(t).upper() for t in tickers if str(t).strip()})
    return merged


def pretty_market_label(market_key: str) -> str:
    if market_key in {"US", "EU", "UK", "ASIA", "AFRICA", "LATAM", "MIDEAST"}:
        return market_key
    words = market_key.replace("_", " ").split()
    return " ".join(w.capitalize() for w in words)
