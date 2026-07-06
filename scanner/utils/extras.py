

import pandas as pd
import numpy as np
from datetime import datetime

SECTOR_MAP = {
    # IT
    "TCS":"IT","INFY":"IT","WIPRO":"IT","HCLTECH":"IT","TECHM":"IT",
    "LTIM":"IT","MPHASIS":"IT","COFORGE":"IT","PERSISTENT":"IT","CYIENT":"IT",
    # Banking
    "HDFCBANK":"Banking","ICICIBANK":"Banking","SBIN":"Banking","KOTAKBANK":"Banking",
    "AXISBANK":"Banking","INDUSINDBK":"Banking","BANKBARODA":"Banking","PNB":"Banking",
    "CANBK":"Banking","UNIONBANK":"Banking","IDFCFIRSTB":"Banking",
    # FMCG
    "HINDUNILVR":"FMCG","ITC":"FMCG","NESTLEIND":"FMCG","BRITANNIA":"FMCG",
    "DABUR":"FMCG","MARICO":"FMCG","COLPAL":"FMCG","EMAMILTD":"FMCG",
    # Pharma
    "SUNPHARMA":"Pharma","DRREDDY":"Pharma","CIPLA":"Pharma","DIVISLAB":"Pharma",
    "AUROPHARMA":"Pharma","LUPIN":"Pharma","ALKEM":"Pharma","IPCALAB":"Pharma",
    # Auto
    "MARUTI":"Auto","TATAMOTORS":"Auto","M&M":"Auto","BAJAJ-AUTO":"Auto",
    "HEROMOTOCO":"Auto","EICHERMOT":"Auto","TVSMOTOR":"Auto","ASHOKLEY":"Auto",
    # Infra/Capital Goods
    "LT":"Infra","ADANIPORTS":"Infra","BHEL":"Infra","SIEMENS":"Infra",
    "ABB":"Infra","THERMAX":"Infra","CUMMINSIND":"Infra",
    # PSU/Defence
    "HAL":"Defence","BEL":"Defence","BDL":"Defence","MIDHANI":"Defence",
    "RVNL":"Railways","IRFC":"Railways","IRCTC":"Railways","IRCON":"Railways",
    # Energy
    "RELIANCE":"Energy","ONGC":"Energy","BPCL":"Energy","IOC":"Energy",
    "NTPC":"Power","POWERGRID":"Power","NHPC":"Power","SJVN":"Power",
    # Metals
    "TATASTEEL":"Metals","JSWSTEEL":"Metals","HINDALCO":"Metals","VEDL":"Metals",
    "NMDC":"Metals","COALINDIA":"Metals","MOIL":"Metals",
    # Finance/NBFC
    "BAJFINANCE":"NBFC","BAJAJFINSV":"NBFC","CHOLAFIN":"NBFC","MUTHOOTFIN":"NBFC",
    "MANAPPURAM":"NBFC","PFC":"NBFC","RECLTD":"NBFC",
}

def get_sector(symbol: str) -> str:
    return SECTOR_MAP.get(symbol.upper(), "Others")

def get_sector_summary(results: list) -> dict:
    
    sectors = {}
    for r in results:
        sec = get_sector(r["symbol"])
        if sec not in sectors:
            sectors[sec] = {"count": 0, "scores": [], "rsi_vals": [], "stocks": []}
        sectors[sec]["count"]    += 1
        sectors[sec]["scores"].append(r.get("score", 0))
        sectors[sec]["rsi_vals"].append(r.get("rsi", 50))
        sectors[sec]["stocks"].append(r["symbol"])

    summary = {}
    for sec, data in sectors.items():
        avg_score = round(sum(data["scores"]) / len(data["scores"]), 1) if data["scores"] else 0
        avg_rsi   = round(sum(data["rsi_vals"]) / len(data["rsi_vals"]), 1) if data["rsi_vals"] else 50
        summary[sec] = {
            "count":     data["count"],
            "avg_score": avg_score,
            "avg_rsi":   avg_rsi,
            "stocks":    data["stocks"],
            "strength":  "HOT 🔥" if avg_score >= 15 else "WARM" if avg_score >= 10 else "COOL",
            "color":     "#3dd68c" if avg_score >= 15 else "#f5a623" if avg_score >= 10 else "#6b6b80",
        }

    return dict(sorted(summary.items(), key=lambda x: x[1]["avg_score"], reverse=True))
