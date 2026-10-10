
import pandas as pd
import numpy as np
from scanner.ml.model_loader import get_ml_win_probability

from datetime import datetime
import time
from .scanner_page import analyze
import redis
import json
import os

signal_map = {
    "BEARISH": -2,
    "OVERBOUGHT": -1,  
    "NONE": 0,
    "OVERSOLD": 1,     
    "BULLISH": 2,
    }

MACD_cross_map = {
"BULLISH_CROSS": 1,
"BEARISH_CROSS": -1,
"NONE": 0,
} 

dow_signal_map = {
    "STRONG SELL / AVOID": -2,
    "AVOID": -1,
    "NEUTRAL": 0,
    "BUY": 1,
    "STRONG BUY": 2,
    }

grade_map = {
    'A+' : 5,
    'A' : 4,
    'B':3,
    'C':2,
    'D':1 ,
    'F':0

    }


pat_map = {
    "BULLISH" : 1,
    "BEARISH" : -1,
    "NONE" : 0,
    "NEUTRAL" : 0
    
}

def _extract_pat_feature(d: dict, best_key: str = "best") -> float:
  
    best = d.get(best_key) if isinstance(d, dict) else None
    if not best or not isinstance(best, dict):
        return "NONE", 0
 
    direction = best.get("direction", "NONE")
   
    confidence = best.get("confidence", 50)
    dir_map = pat_map.get(direction , 0)
    
    return (confidence * dir_map)/100


def ml_win_confidence(data):
    # data =  analyze(symbol)
    
    _grade = grade_map.get(data.get('grade') , 'F')
    lat = data.get("df2" ,{})
    _macd       = float(lat.get("MACD", 0) or 0)
    _macd_sig   = float(lat.get("MACD_signal", 0) or 0)
    _macd_hist  = float(lat.get("MACD_hist", 0) or 0)
    macd_cross = lat.get("MACD_cross" , 'NONE')
    _macd_cross = MACD_cross_map.get(macd_cross)
    
    _bb_width = float(lat.get("BB_width", 0) or 0)
    _bb_pct   = float(lat.get("BB_pct", 0) or 0)
    _atr_pct = float(lat.get("ATR_pct", 0) or 0)
    _vol_ratio = float(lat.get("Vol_ratio", 0) or 0)
    _dist_200ma = float(lat.get("Dist_from_200MA", 0) or 0)
    
    dow = data.get("dow" , {}).get("signal" , "NEUTRAL")
    _dow_signal_encoded = dow_signal_map.get(dow , 0)
    
    sma50 = lat.get("SMA_50")
    sma200 = lat.get("SMA_200")
    ema9 = lat.get("EMA_9")
    entry_price = data.get("trade_action" ,{}).get("entry" , 0.0)
    
    _sma50_above_sma200 = int(sma50 is not None and sma200 is not None and sma50 > sma200)
    _price_above_ema9   = int(ema9 is not None and entry_price > ema9)
    _price_above_sma50  = int(sma50 is not None and entry_price > sma50)
 
    ema21 = lat.get("EMA_21")
    sma20 = lat.get("SMA_20")
    
    _perfect_bullish_alignment = int(
        ema9 is not None and ema21 is not None and sma20 is not None
        and sma50 is not None and sma200 is not None
        and ema9 > ema21 > sma20 > sma50 > sma200
    )
    
    ind = data.get('indicators')
    rsi_signal = ind.get("rsi", {}).get("signal")
    _rsi_signal = signal_map.get(rsi_signal , 0)
    
    _rev_pat = _extract_pat_feature(data.get("reversal" , {}) , "best")
    _cont_pat = _extract_pat_feature(data.get("cont" , {}) , "best")
    _candles_pat = _extract_pat_feature(data.get("candles" , {}) , "latest")
    
    ml_features = row = {
        "grade": _grade,
        "RSI_signal": _rsi_signal,
        "MACD": _macd,
        "MACD_signal": _macd_sig,
        "MACD_hist": _macd_hist,
        "MACD_cross": _macd_cross,
        "BB_width": _bb_width,
        "BB_pct": _bb_pct,
        "ATR_pct": _atr_pct,
        "Vol_ratio": _vol_ratio,
        "Dist_from_200MA": _dist_200ma,
        "sma50_above_sma200": _sma50_above_sma200,
        "perfect_bullish_alignment": _perfect_bullish_alignment,
        # "price_above_ema9": price_above_ema9,
        "price_above_sma50": _price_above_sma50,
        "rev_pat": _rev_pat,
        "cont_pat": _cont_pat,
        "candle_pat": _candles_pat,
        "dow_signal_encoded":_dow_signal_encoded,
    }
    return get_ml_win_probability(ml_features)
import asyncio

async def main():
    data = await analyze("BEL")
    result = ml_win_confidence(data)
    print(result)

if __name__ == "__main__":
    asyncio.run(main())

# the error is 
# grade = grade_map.get(data.get('grade') , 'F')                       ^^^^^^^^
# AttributeError: 'coroutine' object has no attribute 'get'
# <sys>:0: RuntimeWarning: coroutine 'analyze' was never awaited
# it can solve by using await analyze("BEL") instead of analyze("BEL")
    
    
    