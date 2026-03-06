"""
AlphaVision – Global Configuration Settings
============================================
Centralizes all tuneable parameters so every module imports from one place.
"""

import os
from pathlib import Path

# ─────────────────────────────────────────────
# Root Paths
# ─────────────────────────────────────────────
ROOT_DIR        = Path(__file__).resolve().parent.parent
DATA_DIR        = ROOT_DIR / "data"
RAW_DIR         = DATA_DIR / "raw"
PROCESSED_DIR   = DATA_DIR / "processed"
FEATURES_DIR    = DATA_DIR / "features"
CACHE_DIR       = DATA_DIR / "cache"
REFERENCE_DIR   = DATA_DIR / "reference"
COUNTRY_TICKERS_FILE = REFERENCE_DIR / "country_tickers.csv"
MODELS_DIR      = ROOT_DIR / "models" / "saved"
CHECKPOINTS_DIR = ROOT_DIR / "models" / "checkpoints"
LOGS_DIR        = ROOT_DIR / "logs"

# ─────────────────────────────────────────────
# Data Collection
# ─────────────────────────────────────────────
DEFAULT_TICKERS = [
    # A representative sample across regions shown in the dashboard on first load
    "AAPL", "MSFT", "TSLA", "NVDA",       # US Tech
    "SAP.DE", "ASML.AS",                   # Europe
    "SHEL.L", "HSBA.L",                    # UK
    "9988.HK", "TSM",                      # Asia
    "RELIANCE.NS", "TCS.NS",               # India
    "VALE", "PBR",                         # Latin America
    "NPN.JO", "GFI",                       # Africa
]
DEFAULT_INTERVAL   = "1d"          # yfinance interval: 1m, 5m, 1h, 1d, 1wk
DEFAULT_PERIOD     = "5y"          # yfinance period
API_RATE_LIMIT_SEC = 1.2           # Seconds between requests

# ──────────────────────────────────────────────────────────────────────────────
# Global Stock Universe  (yfinance-compatible tickers)
# Suffix guide:
#   .DE = Xetra/Frankfurt  .PA = Euronext Paris  .AS = Amsterdam
#   .L  = London LSE       .HK = Hong Kong       .T  = Tokyo TSE
#   .KS = Korea KRX        .SS = Shanghai         .SZ = Shenzhen
#   .NS = India NSE        .BO = India BSE        .AX = Australia ASX
#   .JO = Johannesburg     .SA = Brazil B3 (BRL)  .CA = Toronto TSX (via yf)
# ──────────────────────────────────────────────────────────────────────────────
REGION_TICKERS = {

    # ── United States ─────────────────────────────────────────────────────────
    "US – Mega Cap Tech": [
        "AAPL",  "MSFT",  "GOOGL", "AMZN",  "META",  "NVDA",  "TSLA",
        "AVGO",  "ORCL",  "AMD",   "INTC",  "QCOM",  "TXN",   "MU",
    ],
    "US – Finance": [
        "JPM",   "BAC",   "WFC",   "GS",    "MS",    "C",     "BLK",
        "AXP",   "V",     "MA",    "PYPL",  "SQ",    "SOFI",  "COIN",
    ],
    "US – Healthcare": [
        "JNJ",   "UNH",   "PFE",   "ABBV",  "MRK",   "LLY",   "AMGN",
        "GILD",  "BIIB",  "REGN",  "MRNA",  "BMY",
    ],
    "US – Energy & Industrials": [
        "XOM",   "CVX",   "COP",   "OXY",   "SLB",   "HAL",
        "BA",    "CAT",   "GE",    "RTX",   "LMT",   "NOC",   "DE",
    ],
    "US – Consumer & Retail": [
        "WMT",   "COST",  "TGT",   "HD",    "LOW",   "NKE",   "MCD",
        "SBUX",  "CMG",   "DIS",   "NFLX",  "SNAP",  "UBER",  "LYFT",
    ],
    "US – Small / Mid Cap": [
        "PLTR",  "RIVN",  "LCID",  "HOOD",  "AFRM",  "UPST",  "OPEN",
        "DKNG",  "RBLX",  "PATH",  "AI",    "BBAI",  "SOUN",
    ],

    # ── Europe ────────────────────────────────────────────────────────────────
    "Europe – Germany (Xetra)": [
        "SAP.DE",   "SIE.DE",   "BAYN.DE",  "BASF.DE",  "BMW.DE",
        "VOW3.DE",  "MBG.DE",   "ALV.DE",   "DTE.DE",   "DB1.DE",
        "ADS.DE",   "MUV2.DE",  "HEI.DE",   "RWE.DE",   "BAS.DE",
    ],
    "Europe – France (Euronext)": [
        "AIR.PA",  "TTE.PA",  "SAN.PA",  "MC.PA",   "OR.PA",
        "BNP.PA",  "ACA.PA",  "GLE.PA",  "DG.PA",   "VIE.PA",
        "CAP.PA",  "CS.PA",   "RNO.PA",  "STM.PA",
    ],
    "Europe – Netherlands & Other": [
        "ASML.AS", "PHIA.AS", "HEIA.AS", "NN.AS",   "AKZA.AS",
        "INGA.AS", "ABN.AS",  "WKL.AS",
        "NESN.SW", "ROG.SW",  "NOVN.SW", "UHR.SW",  # Switzerland
        "ENEL.MI", "ISP.MI",  "UCG.MI",  "ENI.MI",  # Italy
        "IBE.MC",  "SAN.MC",  "BBVA.MC", "ITX.MC",  # Spain
    ],

    # ── United Kingdom ────────────────────────────────────────────────────────
    "UK – London (LSE)": [
        "SHEL.L",  "BP.L",    "HSBA.L",  "LLOY.L",  "BARC.L",
        "VOD.L",   "GSK.L",   "AZN.L",   "RIO.L",   "BHP.L",
        "GLEN.L",  "RR.L",    "IAG.L",   "EZJ.L",   "TSCO.L",
        "EXPN.L",  "DGE.L",   "ULVR.L",  "BA.L",    "CRH.L",
    ],

    # ── Asia – Japan ──────────────────────────────────────────────────────────
    "Asia – Japan (TSE)": [
        "7203.T",  # Toyota
        "6758.T",  # Sony
        "6861.T",  # Keyence
        "9432.T",  # NTT
        "8306.T",  # Mitsubishi UFJ
        "9984.T",  # SoftBank
        "6501.T",  # Hitachi
        "4063.T",  # Shin-Etsu Chemical
        "6367.T",  # Daikin
        "8035.T",  # Tokyo Electron
        "7974.T",  # Nintendo
        "4661.T",  # Oriental Land (Disney Japan)
        "9433.T",  # KDDI
        "6902.T",  # Denso
    ],

    # ── Asia – China & Hong Kong ──────────────────────────────────────────────
    "Asia – China / HK": [
        "9988.HK",  # Alibaba HK
        "0700.HK",  # Tencent
        "3690.HK",  # Meituan
        "1810.HK",  # Xiaomi
        "9999.HK",  # NetEase HK
        "2318.HK",  # Ping An Insurance
        "0941.HK",  # China Mobile
        "1398.HK",  # ICBC
        "BABA",     # Alibaba ADR
        "JD",       # JD.com ADR
        "PDD",      # PDD Holdings ADR
        "BIDU",     # Baidu ADR
        "NIO",      # NIO ADR
        "XPEV",     # XPeng ADR
        "LI",       # Li Auto ADR
    ],

    # ── Asia – South Korea ────────────────────────────────────────────────────
    "Asia – South Korea (KRX)": [
        "005930.KS",  # Samsung Electronics
        "000660.KS",  # SK Hynix
        "035420.KS",  # NAVER
        "035720.KS",  # Kakao
        "051910.KS",  # LG Chem
        "006400.KS",  # Samsung SDI
        "005380.KS",  # Hyundai Motor
        "000270.KS",  # Kia
        "012330.KS",  # Hyundai Mobis
        "SSNLF",      # Samsung Electronics OTC
    ],

    # ── Asia – India ──────────────────────────────────────────────────────────
    "Asia – India (NSE)": [
        "RELIANCE.NS",  "TCS.NS",     "HDFCBANK.NS", "INFY.NS",
        "ICICIBANK.NS", "HINDUNILVR.NS","ITC.NS",    "SBIN.NS",
        "BAJFINANCE.NS","AXISBANK.NS", "WIPRO.NS",   "ULTRACEMCO.NS",
        "TATAMOTORS.NS","MARUTI.NS",   "ADANIENT.NS","HCLTECH.NS",
        "SUNPHARMA.NS", "NTPC.NS",     "ONGC.NS",    "POWERGRID.NS",
    ],

    # ── Asia – Australia ──────────────────────────────────────────────────────
    "Asia – Australia (ASX)": [
        "BHP.AX",   "CBA.AX",   "CSL.AX",   "NAB.AX",   "ANZ.AX",
        "WBC.AX",   "WES.AX",   "RIO.AX",   "FMG.AX",   "MQG.AX",
        "WOW.AX",   "TLS.AX",   "NCM.AX",   "APX.AX",   "ZIP.AX",
    ],

    # ── Africa ────────────────────────────────────────────────────────────────
    "Africa": [
        "NPN.JO",   # Naspers (Johannesburg)
        "BTI.JO",   # British American Tobacco SA
        "SOL.JO",   # Sasol
        "FSR.JO",   # FirstRand Bank
        "SBK.JO",   # Standard Bank
        "ABG.JO",   # Absa Group
        "MTN.JO",   # MTN Group
        "SHP.JO",   # Shoprite
        "CFR.JO",   # Compagnie Financière Richemont
        "GFI",      # Gold Fields (NYSE ADR)
        "AU",       # AngloGold Ashanti (NYSE)
        "NPSNY",    # Naspers ADR
        "MTNOY",    # MTN ADR
        "SGBLY",    # Standard Bank ADR
        "SSL",      # Sasol ADR
    ],

    # ── Latin America ─────────────────────────────────────────────────────────
    "Latin America": [
        "VALE",     # Vale (Brazil, NYSE)
        "PBR",      # Petrobras (Brazil, NYSE)
        "ITUB",     # Itaú Unibanco (Brazil, NYSE)
        "BBDO",     # Banco Bradesco
        "NU",       # Nubank
        "XP",       # XP Inc
        "GGAL",     # Grupo Financiero Galicia (Argentina)
        "CRESY",    # Cresud (Argentina)
        "YPF",      # YPF (Argentina)
        "MELI",     # Mercado Libre
        "SQM",      # SQM Chile (Lithium)
        "AMXL.MX",  # América Móvil (Mexico)
        "WALMEX.MX",# Walmart Mexico
        "CEMEX",    # CEMEX ADR
    ],

    # ── Middle East & Canada ──────────────────────────────────────────────────
    "Middle East & Canada": [
        "ARAMCO.SR",  # Saudi Aramco (Tadawul – via yf)
        "SABIC.SR",   # SABIC
        "SNB.SR",     # Saudi National Bank
        "STC.SR",     # Saudi Telecom
        # Canada (TSX via yfinance)
        "SHOP",       # Shopify (NYSE listed)
        "RY",         # Royal Bank of Canada
        "TD",         # Toronto-Dominion Bank
        "ENB",        # Enbridge
        "CNQ",        # Canadian Natural Resources
        "CP",         # Canadian Pacific Railway
        "BCE",        # Bell Canada
        "BAM",        # Brookfield Asset Management
    ],
}

# ─────────────────────────────────────────────
# Feature Engineering
# ─────────────────────────────────────────────
FEATURE_WINDOWS   = [5, 10, 20, 50, 200]   # Moving-average windows (days)
RSI_PERIOD        = 14
MACD_FAST         = 12
MACD_SLOW         = 26
MACD_SIGNAL       = 9
BOLLINGER_WINDOW  = 20
BOLLINGER_STD     = 2
PREDICTION_HORIZON = 5             # Days ahead to predict

# ─────────────────────────────────────────────
# Model Training
# ─────────────────────────────────────────────
TEST_SIZE          = 0.2
VALIDATION_SIZE    = 0.1
RANDOM_STATE       = 42
SEQUENCE_LENGTH    = 60            # Lookback window for LSTM (days)
BATCH_SIZE         = 32
EPOCHS             = 100
LEARNING_RATE      = 0.001
EARLY_STOPPING_PATIENCE = 10

# ─────────────────────────────────────────────
# Decision Engine Thresholds
# ─────────────────────────────────────────────
BUY_THRESHOLD      = 0.02          # +2 % predicted gain → BUY signal
SELL_THRESHOLD     = -0.02         # -2 % predicted loss → SELL signal
CONFIDENCE_CUTOFF  = 0.65          # Minimum model confidence to act

# ─────────────────────────────────────────────
# API / Dashboard
# ─────────────────────────────────────────────
API_HOST           = "0.0.0.0"
API_PORT           = 8000
DASHBOARD_PORT     = 8050
DEBUG_MODE         = os.getenv("DEBUG", "false").lower() == "true"

# ─────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────
LOG_LEVEL          = "INFO"
LOG_FORMAT         = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
LOG_DATE_FORMAT    = "%Y-%m-%d %H:%M:%S"
