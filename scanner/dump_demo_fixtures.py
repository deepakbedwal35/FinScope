"""
Utility script to dump and synchronize sanitized demo fixtures.
Generates:
  - client/src/demo/demoScan.json (Full scan ~50 stocks, also synced to server & scanner fallback)
  - client/src/demo/demoBacktest.json (Presets for backtest)
  - client/src/demo/demoStock.json (Complete tabbed detail for SUNPHARMA)
  - client/src/demo/demoRecommendations.json (Active & closed recommendations)

All data is processed through sanitize_for_json() and trimmed to UI fields.
"""

from __future__ import annotations

import json
from pathlib import Path
from scanner.utils.sanitize_json import sanitize_for_json

ROOT_DIR = Path(__file__).resolve().parent.parent
CLIENT_DEMO_DIR = ROOT_DIR / "client" / "src" / "demo"
SERVER_DATA_DIR = ROOT_DIR / "server" / "src" / "data"
SCANNER_DATA_DIR = ROOT_DIR / "scanner" / "data"


def load_existing_scan() -> dict:
    scan_file = SERVER_DATA_DIR / "demoFullScan.json"
    if scan_file.is_file():
        with open(scan_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"results": []}


def dump_all_fixtures():
    CLIENT_DEMO_DIR.mkdir(parents=True, exist_ok=True)
    SERVER_DATA_DIR.mkdir(parents=True, exist_ok=True)
    SCANNER_DATA_DIR.mkdir(parents=True, exist_ok=True)

    scan_raw = load_existing_scan()
    results = scan_raw.get("results", [])

    # 1. demoScan.json
    scan_fixture = {
        "isDemo": True,
        "demoAsOf": "2026-10-09",
        "total_scanned": len(results),
        "scanned_at": "09 Oct 2026  03:30 PM",
        "results": sanitize_for_json(results),
    }

    # Save to client/src/demo/demoScan.json and sync to server & scanner fallbacks
    with open(CLIENT_DEMO_DIR / "demoScan.json", "w", encoding="utf-8") as f:
        json.dump(scan_fixture, f, indent=2)
    with open(SERVER_DATA_DIR / "demoFullScan.json", "w", encoding="utf-8") as f:
        json.dump(scan_fixture, f, indent=2)
    with open(SCANNER_DATA_DIR / "demo_full_scan.json", "w", encoding="utf-8") as f:
        json.dump(scan_fixture, f, indent=2)

    # 2. demoBacktest.json
    backtest_fixture = {
        "isDemo": True,
        "demoAsOf": "2026-10-09",
        "presets": {
            "conservative": {
                "id": "conservative",
                "name": "NIFTY 50 Turtle Breakout (Conservative)",
                "description": "Turtle 10-day low stop loss, MA200 primary trend filter (Grade A/B setups, 2-Year window).",
                "filters": {
                    "symbol": "RELIANCE",
                    "years_back": 2,
                    "sl_atr_mult": 1.5,
                    "t1_atr_mult": 2.0,
                    "t2_atr_mult": 3.5,
                    "max_hold_days": 40,
                    "min_score": 10,
                    "min_grade": "B",
                },
                "outcomes": {
                    "T2_HIT": 44,
                    "T1_HIT": 31,
                    "PARTIAL_RALLY": 16,
                    "SL_HIT": 22,
                },
                "metrics": {
                    "win_rate": 68.2,
                    "total_trades": 113,
                    "profit_factor": 2.45,
                    "avg_gain": 8.4,
                    "avg_loss": 3.2,
                    "max_drawdown": 6.8,
                },
                "grade": {
                    "A": {"trades": 45, "win_rate": 77.8, "profit_factor": 2.8},
                    "B": {"trades": 68, "win_rate": 61.8, "profit_factor": 2.1},
                },
                "trades": [
                    {
                        "symbol": "RELIANCE",
                        "entry_date": "2026-03-12",
                        "exit_date": "2026-04-02",
                        "entry_price": 2850.0,
                        "exit_price": 3045.0,
                        "pnl_pct": 6.84,
                        "outcome": "T2_HIT",
                        "grade": "A",
                        "holding_days": 15,
                    },
                    {
                        "symbol": "RELIANCE",
                        "entry_date": "2026-05-18",
                        "exit_date": "2026-06-08",
                        "entry_price": 2920.0,
                        "exit_price": 3066.0,
                        "pnl_pct": 5.0,
                        "outcome": "T1_HIT",
                        "grade": "B",
                        "holding_days": 14,
                    },
                    {
                        "symbol": "RELIANCE",
                        "entry_date": "2026-07-02",
                        "exit_date": "2026-07-16",
                        "entry_price": 3110.0,
                        "exit_price": 3016.7,
                        "pnl_pct": -3.0,
                        "outcome": "SL_HIT",
                        "grade": "B",
                        "holding_days": 10,
                    },
                ],
            },
            "momentum": {
                "id": "momentum",
                "name": "High Momentum 52W Breakouts (Aggressive)",
                "description": "Explosive 52-week breakout filter with volume expansion (Grade A/B/C setups, 2-Year window).",
                "filters": {
                    "symbol": "TATASTEEL",
                    "years_back": 2,
                    "sl_atr_mult": 1.2,
                    "t1_atr_mult": 2.5,
                    "t2_atr_mult": 4.0,
                    "max_hold_days": 30,
                    "min_score": 8,
                    "min_grade": "C",
                },
                "outcomes": {
                    "T2_HIT": 58,
                    "T1_HIT": 24,
                    "PARTIAL_RALLY": 14,
                    "SL_HIT": 38,
                },
                "metrics": {
                    "win_rate": 61.2,
                    "total_trades": 134,
                    "profit_factor": 1.98,
                    "avg_gain": 11.2,
                    "avg_loss": 4.1,
                    "max_drawdown": 9.4,
                },
                "grade": {
                    "A": {"trades": 52, "win_rate": 73.1, "profit_factor": 2.5},
                    "B": {"trades": 50, "win_rate": 58.0, "profit_factor": 1.8},
                    "C": {"trades": 32, "win_rate": 46.9, "profit_factor": 1.4},
                },
                "trades": [
                    {
                        "symbol": "TATASTEEL",
                        "entry_date": "2026-02-10",
                        "exit_date": "2026-03-05",
                        "entry_price": 142.0,
                        "exit_price": 160.4,
                        "pnl_pct": 12.96,
                        "outcome": "T2_HIT",
                        "grade": "A",
                        "holding_days": 17,
                    },
                    {
                        "symbol": "TATASTEEL",
                        "entry_date": "2026-04-14",
                        "exit_date": "2026-04-28",
                        "entry_price": 158.0,
                        "exit_price": 151.7,
                        "pnl_pct": -4.0,
                        "outcome": "SL_HIT",
                        "grade": "C",
                        "holding_days": 10,
                    },
                ],
            },
        },
    }

    with open(CLIENT_DEMO_DIR / "demoBacktest.json", "w", encoding="utf-8") as f:
        json.dump(sanitize_for_json(backtest_fixture), f, indent=2)

    # 3. demoStock.json (SUNPHARMA complete detail)
    # Pick SUNPHARMA from results if available, else pick first result
    sunpharma = next((s for s in results if s.get("symbol") == "SUNPHARMA"), results[0] if results else {})

    demo_stock = {
        "isDemo": True,
        "demoAsOf": "2026-10-09",
        "symbol": "SUNPHARMA",
        "price": sunpharma.get("price", 1759.8),
        "change": sunpharma.get("change", -21.2),
        "change_percent": sunpharma.get("change_percent", -1.19),
        "w52h": sunpharma.get("w52h", 2046.9),
        "dist_52w": sunpharma.get("dist_52w", -14.03),
        "vol_ratio": sunpharma.get("vol_ratio", 0.99),
        "rsi": sunpharma.get("rsi", 33.6),
        "score": sunpharma.get("score", 11),
        "strength": sunpharma.get("strength", "MEDIUM"),
        "grade": sunpharma.get("grade", "C"),
        "grade_color": sunpharma.get("grade_color", "#f5a623"),
        "sl": sunpharma.get("sl", 1709.54),
        "t1": sunpharma.get("t1", 1826.82),
        "t2": sunpharma.get("t2", 1877.09),
        "fundamentals": {
            "info": {
                "name": "Sun Pharmaceutical Industries Ltd.",
                "sector": "Healthcare",
                "industry": "Pharmaceuticals",
                "marketCap": 4220000000000,
                "pe": 34.2,
                "forwardPE": 28.5,
                "pb": 6.8,
                "roe": 18.5,
                "debtToEquity": 0.05,
                "dividendYield": 0.75,
            },
            "financials": {
                "revenueGrowth": 10.4,
                "profitMargin": 23.2,
                "operatingMargin": 27.8,
            },
        },
        "indicators": sunpharma.get("indicators", {}),
        "patterns": sunpharma.get("patterns", {}),
        "reversal": sunpharma.get("reversal", {}),
        "cont": sunpharma.get("cont", {}),
        "dow": sunpharma.get("dow", {}),
        "entry": sunpharma.get("entry", {}),
        "candles": sunpharma.get("candles", {}),
        "ai": {
            "decision": "HOLD / ACCUMULATE ON PULLBACK",
            "confidence": 78,
            "summary": "Primary uptrend intact despite short-term consolidation. Strong institutional participation, low debt, and healthy operating margins.",
            "key_positives": [
                "SMA50 is above SMA200 (Long-term bullish trend intact)",
                "Support at ₹1691 with 3 strong touches",
                "Institutional volume healthy at 0.99x 20-day average",
            ],
            "risks": [
                "RSI is currently oversold (33.6) indicating near-term downward pressure",
                "Resistance cluster at ₹1790-₹1832",
            ],
        },
    }

    with open(CLIENT_DEMO_DIR / "demoStock.json", "w", encoding="utf-8") as f:
        json.dump(sanitize_for_json(demo_stock), f, indent=2)

    # 4. demoRecommendations.json
    demo_recommends = {
        "isDemo": True,
        "demoAsOf": "2026-10-09",
        "allRecommends": [
            {
                "symbol": "GLAND",
                "entryPrice": 3079.1,
                "stopLoss": 2935.76,
                "target1": 3270.22,
                "target2": 3413.56,
                "confidence": 80.6,
                "grade": "A",
                "isOpen": True,
                "target1Hit": False,
                "target2Hit": False,
                "stopLossHit": False,
                "createdAt": "2026-10-08T09:30:00Z",
            },
            {
                "symbol": "AUROPHARMA",
                "entryPrice": 1693.0,
                "stopLoss": 1630.68,
                "target1": 1806.36,
                "target2": 1883.32,
                "confidence": 69.2,
                "grade": "B",
                "isOpen": True,
                "target1Hit": False,
                "target2Hit": False,
                "stopLossHit": False,
                "createdAt": "2026-10-07T09:30:00Z",
            },
            {
                "symbol": "DIVISLAB",
                "entryPrice": 9246.6,
                "stopLoss": 8872.55,
                "target1": 9766.1,
                "target2": 10085.67,
                "confidence": 84.0,
                "grade": "B",
                "isOpen": False,
                "exitPrice": 9766.1,
                "target1Hit": True,
                "target2Hit": False,
                "stopLossHit": False,
                "createdAt": "2026-09-25T09:30:00Z",
            },
        ],
        "prices": {
            "GLAND": {"price": 3079.1, "change": -71.5, "change_percent": -2.27},
            "AUROPHARMA": {"price": 1693.0, "change": 48.0, "change_percent": 2.92},
            "DIVISLAB": {"price": 9340.0, "change": -21.0, "change_percent": -0.22},
        },
    }

    with open(CLIENT_DEMO_DIR / "demoRecommendations.json", "w", encoding="utf-8") as f:
        json.dump(sanitize_for_json(demo_recommends), f, indent=2)

    print("Successfully generated all demo fixtures in client/src/demo/")


if __name__ == "__main__":
    dump_all_fixtures()

