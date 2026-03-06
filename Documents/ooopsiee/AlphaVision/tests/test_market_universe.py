"""
Tests for market universe dataset loading/merging helpers.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.market_universe import build_screen_markets, load_country_tickers, pretty_market_label


class TestMarketUniverse:

    def test_load_country_tickers_reads_csv(self):
        data = load_country_tickers()
        assert "NIGERIA" in data
        assert len(data["NIGERIA"]) >= 1
        assert all(isinstance(t, str) and t for t in data["NIGERIA"])

    def test_build_screen_markets_merges_regions_and_countries(self):
        regions = {"US - TECH": ["AAPL", "MSFT"]}
        countries = {"UNITED KINGDOM": ["SHEL.L", "BP.L"]}
        merged = build_screen_markets(regions=regions, countries=countries)
        assert "US" in merged
        assert "US - TECH" in merged
        assert "UNITED KINGDOM" in merged
        assert "AAPL" in merged["US"]
        assert "SHEL.L" in merged["UNITED KINGDOM"]

    def test_pretty_market_label(self):
        assert pretty_market_label("US") == "US"
        assert pretty_market_label("UNITED_KINGDOM") == "United Kingdom"
