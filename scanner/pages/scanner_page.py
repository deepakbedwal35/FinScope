"""
pages/scanner_page.py — NSE Pro Scanner v18
"""

"""
app.py — NSE Pro Scanner
========================
Full technical analysis scanner combining:
  1. Dow Theory   (Primary / Secondary / Minor trend)
  2. Indicators   (RSI, MACD, Bollinger Bands, MAs, ATR)
  3. Patterns     (Triangles & Wedges — Murphy Chapter 6)
  4. Breakout     (52W High + Volume + Trend filter)


"""


import pandas as pd
import heapq
import numpy as np
import yfinance as yf
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import matplotlib.pyplot as plt
from datetime import datetime
import time
from scanner.data.nse_symbols              import CATEGORIES, get_symbols, INDEX_SYMBOLS, INDEX_GROUPS, FO_INDICES, get_index_yf_symbol, get_index_nse_symbol, search_symbols
from scanner.patterns.dow_theory               import full_dow_analysis
from scanner.data.indicators               import  get_indicator_summary , get_indicator_summary_for_backtest
from scanner.patterns.patterns                 import get_pattern_summary
from scanner.patterns.reversal_patterns        import get_reversal_summary
from scanner.patterns.continuation_patterns    import get_continuation_summary
from scanner.patterns.candlesticks_oscillators import get_candle_oscillator_summary
from scanner.strategy.backtest                 import   compute_score
from scanner.data.news_sentiment            import get_news_sentiment, get_company_name
from scanner.strategy.entry_engine              import get_full_entry_analysis
from scanner.strategy.risk_analysis             import get_full_risk_report

from scanner.data.fundamentals              import get_fundamentals, get_summary
from scanner.ai.gemini_analyst import analyse_news_with_gemini, get_ai_decision,  GROQ_AVAILABLE as GENAI_AVAILABLE
from scanner.utils.config         import is_gemini_ready, get_key, GROQ_MODEL , GROQ_TEMPERATURE 

from scanner.utils.sanitize_json import sanitize_for_json
from concurrent.futures import ThreadPoolExecutor

from scanner.data.market_intelligence import   get_sector_rotation
  
   
    

from scanner.utils.extras import get_sector

import numpy as _np_algo  # for algo signals
import redis
import json
redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

def fetch(symbol: str, period: str = "2y") -> pd.DataFrame | None:
    bare = symbol.replace(".NS", "").replace(".BO", "")

    if symbol.endswith(".NS"):
        candidates = [symbol, bare + ".BO"]
    elif symbol.endswith(".BO"):
        candidates = [symbol, bare + ".NS"]
    else:
        candidates = [bare + ".NS", bare + ".BO", symbol]

    periods = [period, "1y"] if period == "2y" else [period]
    required_cols = ["Open", "High", "Low", "Close", "Volume"]

    print("symbol", symbol)
    print(candidates)

    for sym in candidates:
        for per in periods:
            try:
                df = yf.Ticker(sym).history(period=per, auto_adjust=True)

                # ── Guard 1: empty or missing columns ──
                if df is None or df.empty:
                    continue
                if not all(c in df.columns for c in required_cols):
                    continue

                # ── Guard 2: drop ANY row where OHLCV has NaN ──
                df = df.dropna(subset=required_cols)

                # ── Guard 3: drop rows where Close/Volume is 0 or negative ──
                df = df[(df["Close"] > 0) & (df["Volume"] > 0)]

                # ── Guard 4: drop rows where High < Low (corrupted candle) ──
                df = df[df["High"] >= df["Low"]]

                # ── Guard 5: minimum viable rows for indicators ──
                if len(df) < 60:
                    continue

                # ── Guard 6: clean datetime index ──
                df.index = pd.to_datetime(df.index)
                df = df.sort_index()                    # ensure chronological order
                df = df[~df.index.duplicated(keep="last")]  # drop duplicate dates

                # ── Guard 7: forward-fill tiny gaps (1-2 missing days max) ──
                df = df[required_cols].copy()           # keep only what you need
                
                return df

            except Exception as e:
                print(f"  ✗ {sym} / {per}: {e}")
                continue

    return None



# Redis :

#  list : 1. curr_stock , market_scan






def fetch_price(symbols: list[str]):

    # yfinance supports multi-ticker fetch in a single request
    tickers_str = " ".join(f"{s}.NS" for s in symbols)
    data = yf.Tickers(tickers_str)

    results = {}
    for symbol in symbols:
        try:
            ticker = data.tickers.get(f"{symbol}.NS")
            if not ticker:
                results[symbol] = None
                continue

            hist = ticker.history(period="2d")
            if len(hist) < 1:
                results[symbol] = None
                continue

            price = float(hist["Close"].iloc[-1])
            prev_close = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else price
            change = price - prev_close
            change_pct = round((change / prev_close) * 100, 2) if prev_close else 0

            results[symbol] = {
                "price": round(price, 2),
                "change": round(change, 2),
                "change_percent": change_pct,
            }
        except Exception:
            results[symbol] = None

    return results


def analyze(symbol: str):
    data = redis_client.get("curr_stock")
    if data :
        print("Using cached Stock Details from Redis")
        return json.loads(data)
  
    
    df = fetch(symbol)
    if df is None:
        return None

    try:
        # ── Indicators ──
        ind , df2 = get_indicator_summary(df)
        # ── Dow Theory ──
        dow = full_dow_analysis(df2)
        
        # ── All Pattern Modules ──
        pat     = get_pattern_summary(df2)        
        reversal = get_reversal_summary(df2)        
        cont    = get_continuation_summary(df2)     
        candles  = get_candle_oscillator_summary(df2)
        entry = get_full_entry_analysis(df2 , dow , ind , pat , cont , reversal , candles)
        print(type(entry))
        # ── Basic metrics — v19 FIX: NaN guards ──
        lat = df2.iloc[-1]
        prv = df2.iloc[-2]
        p   = float(lat["Close"])
        if p != p or p <= 0:  # isnan check
            return None
        _w52h_raw = df2["High"].rolling(252, min_periods=30).max().iloc[-1]
        w52h = float(_w52h_raw) if (_w52h_raw == _w52h_raw and _w52h_raw > 0) else p
        
        _w52l_raw = df2["Low"].rolling(252, min_periods=30).min().iloc[-1]
        w52l = float(_w52l_raw) if (_w52l_raw == _w52l_raw and _w52l_raw > 0) else p
        
        
        vr_raw = lat.get("Vol_ratio", 0.0)
        vr = float(vr_raw) if pd.notna(vr_raw) else 0.0
        
        rsi_val = ind["rsi"]["value"]
        rsi = float(rsi_val) if rsi_val is not None else 0.0
        _prev_c = float(prv["Close"]) if float(prv["Close"]) > 0 else p
        chg_percent = ((p - _prev_c) / _prev_c) * 100
        chg = (p - _prev_c)
        dist_52w = ((p - w52h) / w52h) * 100 if w52h > 0 else 0.0
        

     
        atr = ind["atr"]["value"] or (p * 0.02)
        sl  = round(p - 1.5 * atr, 2)
        t1  = round(p + 2.0 * atr, 2)
        t2  = round(p + 3.5 * atr, 2)

     
        score, strength, _grade, _gc = compute_score(
            ind, dow, pat, cont, candles, reversal, dist_52w, vr)
        # fundamentals = get
        
        company_name = get_company_name(symbol)
        fundamentals = get_fundamentals(symbol)
        news_data = get_news_sentiment(symbol =symbol ,company_name = company_name)
        risk_data = get_full_risk_report(df = df, ind_result = ind, pat_result = pat, cont_result = cont,
                                rev_result = reversal, candle_result = candles, dow_result = dow,
                                news_sentiment = news_data)
        
   
       
        
        summary =   {
            "symbol":    symbol.replace(".NS",""),
            "company_name" : company_name,
            "price":     float(p),
            "change":    float(round(chg, 2)),
            "change_percent" : float(round(chg_percent, 2)),
            
            "w52h":      float(round(w52h, 2)),
            "w52l" :     float(round(w52l, 2)),
           
            "dist_52w":  float(round(dist_52w, 2)),
            "vol_ratio": float(round(vr, 2)),
            "rsi":       float(rsi),
            "score":     int(score),
            "strength":  strength,
            "grade":     _grade,
            "grade_color": _gc,
            # "sl":        float(sl), "t1": float(t1), "t2": float(t2),
            "fundamentals" : fundamentals,
            "trade_action" : entry,
            "dow":       dow,
            "indicators":ind,
            "patterns":  pat,
            "reversal":  reversal,
            "cont":      cont,
            "candles":   candles,
            "risks" : risk_data,
             
             "df2": df2.iloc[-1].to_dict()   
        }
        
        summary =  sanitize_for_json(summary)
        
        try :
            redis_client.setex("curr_stock", 18000, json.dumps(summary))
        except Exception as e:
            print("Failed to cache curr stock  in Redis:", e)  
        return summary
    except Exception as e:
        print(f" ERROR in analyze: {e}")
   
    return None 



# CHART
def build_chart_demo(symbol)->go.Figure:

    data = {
    'Date': pd.date_range(start='2024-01-01', periods=5, freq='D'),
    'Open': [150.00, 152.50, 155.00, 153.20, 158.10],
    'High': [153.20, 156.00, 158.40, 157.00, 162.50],
    'Low':  [148.50, 151.00, 154.20, 151.50, 156.30],
    'Close': [152.50, 155.00, 153.20, 158.10, 160.00]
    } 
      
    df = pd.DataFrame(data)
    df["Date"] = df["Date"].astype(str)
    fig = go.Figure(data = [go.Candlestick(
        x=df['Date'].tolist() ,
        open=df['Open'].tolist(),
        high=df['High'].tolist(),
        low=df['Low'].tolist(),
        close=df['Close'].tolist()
    )])


    
    return fig.to_dict()

def build_chart(symbol , timeframe)->go.Figure:
    r = analyze(symbol)
    df   = fetch(symbol).tail(120)
    # pat  = r["patterns"]
    # dow  = r["dow"]
    # ind  = r["indicators"]
    
    fig = make_subplots(
        rows=4, cols=1, shared_xaxes=True,
        row_heights=[0.50, 0.18, 0.16, 0.16],
        vertical_spacing=0.025,
        subplot_titles=("Price · MAs · Bollinger Bands", "Volume", "RSI", "MACD")
    )

    # ── Candlesticks ──
    fig.add_trace(go.Candlestick(
        x=df.index, open=df["Open"], high=df["High"],
        low=df["Low"], close=df["Close"], name="Price",
        increasing_fillcolor="#3dd68c", increasing_line_color="#3dd68c",
        decreasing_fillcolor="#f75f5f", decreasing_line_color="#f75f5f"
    ), row=1, col=1)

    # ── Bollinger Bands ──
    if "BB_upper" in df.columns:
        fig.add_trace(go.Scatter(x=df.index, y=df["BB_upper"],
            line=dict(color="rgba(124,106,247,0.4)", width=1), name="BB Upper"), row=1, col=1)
        fig.add_trace(go.Scatter(x=df.index, y=df["BB_lower"],
            line=dict(color="rgba(124,106,247,0.4)", width=1),
            fill="tonexty", fillcolor="rgba(124,106,247,0.04)", name="BB Lower"), row=1, col=1)

    # ── Moving Averages ──
    ma_styles = [("SMA_20","#7c6af7","SMA20"),("SMA_50","#f5a623","SMA50"),("SMA_200","#e06cf5","SMA200")]
    for col, color, name in ma_styles:
        if col in df.columns:
            fig.add_trace(go.Scatter(x=df.index, y=df[col],
                line=dict(color=color, width=1.5), name=name), row=1, col=1)

    # ── 52W High ──
    fig.add_hline(y=r["w52h"], line_dash="dash", line_color="#3dd68c", line_width=1.5,
                  annotation_text=f"52W High ₹{r['w52h']}", row=1, col=1)

    # ── SL / Targets ──
    for y, c, lbl in [(r["sl"],"#f75f5f",f"SL ₹{r['sl']}"),
                      (r["t1"],"#3dd68c",f"T1 ₹{r['t1']}"),
                      (r["t2"],"#2ab870",f"T2 ₹{r['t2']}")]:
        fig.add_hline(y=y, line_dash="dot", line_color=c, line_width=1,
                      annotation_text=lbl, row=1, col=1)

    # ── Swing Highs / Lows from Dow ──
    sh = dow["primary"]["swing_highs"]
    sl_pts = dow["primary"]["swing_lows"]
    if len(sh) > 0:
        fig.add_trace(go.Scatter(
            x=sh.index, y=sh["price"],
            mode="markers", marker=dict(symbol="triangle-down", size=10, color="#f75f5f"),
            name="Swing High"), row=1, col=1)
    if len(sl_pts) > 0:
        fig.add_trace(go.Scatter(
            x=sl_pts.index, y=sl_pts["price"],
            mode="markers", marker=dict(symbol="triangle-up", size=10, color="#3dd68c"),
            name="Swing Low"), row=1, col=1)

    # ── Volume ──
    colors = ["#3dd68c" if c >= o else "#f75f5f" for c, o in zip(df["Close"], df["Open"])]
    fig.add_trace(go.Bar(x=df.index, y=df["Volume"], marker_color=colors,
                         opacity=0.8, name="Volume"), row=2, col=1)
    if "Vol_MA20" in df.columns:
        fig.add_trace(go.Scatter(x=df.index, y=df["Vol_MA20"],
            line=dict(color="#f5a623", width=1.5), name="Vol MA20"), row=2, col=1)

    # ── RSI ──
    if "RSI" in df.columns:
        fig.add_trace(go.Scatter(x=df.index, y=df["RSI"],
            line=dict(color="#7c6af7", width=2), name="RSI"), row=3, col=1)
        for lvl, clr in [(70,"#f75f5f"),(50,"#6b6b80"),(30,"#3dd68c")]:
            fig.add_hline(y=lvl, line_dash="dash", line_color=clr, line_width=1, row=3, col=1)

    # ── MACD ──
    if "MACD" in df.columns:
        fig.add_trace(go.Scatter(x=df.index, y=df["MACD"],
            line=dict(color="#7c6af7", width=1.5), name="MACD"), row=4, col=1)
        fig.add_trace(go.Scatter(x=df.index, y=df["MACD_signal"],
            line=dict(color="#f5a623", width=1.5), name="Signal"), row=4, col=1)
        hist_colors = ["#3dd68c" if v >= 0 else "#f75f5f" for v in df["MACD_hist"].fillna(0)]
        fig.add_trace(go.Bar(x=df.index, y=df["MACD_hist"],
            marker_color=hist_colors, opacity=0.7, name="Histogram"), row=4, col=1)
        fig.add_hline(y=0, line_dash="dot", line_color="#6b6b80", line_width=1, row=4, col=1)

    fig.update_layout(
        height=680, paper_bgcolor="#0d0d0f", plot_bgcolor="#0d0d0f",
        font=dict(color="#f0f0f5", family="JetBrains Mono"),
        xaxis_rangeslider_visible=False,
        margin=dict(l=10, r=10, t=30, b=10),
        legend=dict(orientation="h", y=1.01, bgcolor="rgba(0,0,0,0)", font_size=10),
        showlegend=True
    )
    fig.update_xaxes(showgrid=True, gridcolor="#1e1e26", zeroline=False)
    fig.update_yaxes(showgrid=True, gridcolor="#1e1e26", zeroline=False)
    return fig
    
    
    
    
# Run full scan

def analyze_full_scan(symbol: str ):
    df = fetch(symbol)
    if df is None:
        return None

    try:
        # ── Indicators ──
        ind , df2 = get_indicator_summary(df)
        # df2 = ind["df"]   # df with all indicators added

        # ── Dow Theory ──
        dow = full_dow_analysis(df2)
        
        # All Pattern Modules 
        pat     = get_pattern_summary(df2)         
        reversal = get_reversal_summary(df2)       
        cont    = get_continuation_summary(df2)    
        candles  = get_candle_oscillator_summary(df2)
        
        entry = get_full_entry_analysis(df2 , dow , ind , pat , cont , reversal , candles)
       
        # ── Basic metrics — v19 FIX: NaN guards ──
        lat = df2.iloc[-1]
        prv = df2.iloc[-2]
        p   = float(lat["Close"])
        if p != p or p <= 0:  # isnan check
            return None
        _w52_raw = df2["High"].rolling(252, min_periods=30).max().iloc[-1]
        w52 = float(_w52_raw) if (_w52_raw == _w52_raw and _w52_raw > 0) else p
        
        vr_raw = lat.get("Vol_ratio", 0.0)
        vr = float(vr_raw) if pd.notna(vr_raw) else 0.0
        
        rsi_val = ind["rsi"]["value"]
        rsi = float(rsi_val) if rsi_val is not None else 0.0
        _prev_c = float(prv["Close"]) if float(prv["Close"]) > 0 else p
        chg_percent = ((p - _prev_c) / _prev_c) * 100
        chg = (p - _prev_c)
        dist_52w = ((p - w52) / w52) * 100 if w52 > 0 else 0.0
       
        # ── ATR-based SL/Target ──
        atr = ind["atr"]["value"] or (p * 0.02)
        sl  = round(p - 1.5 * atr, 2)
        t1  = round(p + 2.0 * atr, 2)
        t2  = round(p + 3.5 * atr, 2)

        # ── Composite score — unified function (same as search + time machine) ──
        score, strength, _grade, _gc = compute_score(
            ind, dow, pat, cont, candles, reversal, dist_52w, vr)
        
        trend = "DOWNTREND" 
        if dow["primary"]["trend"] == trend and dow["secondary"]["trend"] == trend and dow["minor"]["trend"] == trend :
            return None
        
        if score < 10:
            return None
        if(vr < 0.4): 
            return None
   
        clean_symbol = symbol.replace(".NS", "").replace(".BO", "")

         
        results = {
            "symbol":    clean_symbol,
            # "sector": get_sector(),   
            "price":     float(p),
            "change":    float(round(chg, 2)),
            "change_percent":float(round(chg_percent , 2)),
            "w52h":      float(round(w52, 2)),
            "dist_52w":  float(round(dist_52w, 2)),
            "vol_ratio": float(round(vr, 2)),
            "rsi":       float(rsi),
            "score":     int(score),
            "strength":  strength,
            "grade":     _grade,
            "grade_color": _gc,
            "sl":        float(sl), "t1": float(t1), "t2": float(t2),
            "entry" : entry,
            "dow":       dow,
            "indicators":ind,
            "patterns":  pat,
            "reversal":  reversal,
             "cont":      cont,
             "candles":   candles,
           
        }    
        
        return sanitize_for_json(results) 
   

    except Exception as e:
      
        print(f" ERROR in analyze: {e}")
   
    return None 



             
def run_full_scan(sel_cats = ["Pharma" ],  use_cache = True):
    
    data = redis_client.get("market_scan")
    if data and use_cache:
        print("Using cached scan results from Redis")
        return json.loads(data)
    if data and not use_cache:
        print("Cache exists but use_cache=False, ignoring cache and running fresh scan")
        redis_client.delete("market_scan")
    # print(type(sel_cats) , sel_cats)
    if not sel_cats:
        raise ValueError("sel_cats cannot be empty")   
    # str_order = {"WEAK":0,"MEDIUM":1,"STRONG":2}
    symbols = get_symbols(sel_cats)
   
    results = []
    
    for sym in symbols:
        try:
            r = analyze_full_scan(sym )
            if r :
                results.append(r)
                print(f"Found {sym}: {r['score']}")
        except Exception as e:
            print("error is" , e)
        
    results.sort(key = lambda x: x['score'] , reverse=True)
    # sanitize_for_json(results)
    # Add this before redis_client.setex
    
    payload = {
        "cached":         True,
        "results":        results,
        "total_scanned":  len(symbols),
        "total_found":    len(results),
        "scanned_at":     datetime.now().strftime("%d %b %Y  %I:%M %p"),
    }
    
    for key, val in payload["results"][0].items():
        try:
            json.dumps(val)
        except Exception:
            print(f" Not serializable: {key} → {type(val)}")

    
    
    try :
        redis_client.setex("market_scan", 7200, json.dumps(payload))
    except Exception as e:
        print("Failed to cache scan results in Redis:", e)  
    

    return payload



def  get_market_scan_cache( filters: dict = { "min_vol": 0.2, "rsi_min": 30, "rsi_max": 80, "dist_thr": 20 , "min_grade" : "D" , "sectors" : ["Pharma"] }
) -> dict:
    if filters is None:
        filters = {}
        
    min_vol     = filters.get("min_vol", 0.2)
    rsi_min     = filters.get("rsi_min", 30)
    rsi_max     = filters.get("rsi_max", 80)
    dist_thr    = filters.get("dist_thr", 20)
    min_grade   = filters.get("min_grade", "D")
    sectors     = filters.get("sectors", [])
    indicators  = filters.get("indicators", [])  
    category    = filters.get("category")
    limit       = filters.get("limit", None)  
    
    grade_rank = {"A+": 5, "A": 4, "B": 3, "C": 2, "D": 1}
    # str_rank   = {"WEAK": 0, "MEDIUM": 1, "STRONG": 2}
    
    data = redis_client.get("market_scan")
    if not data:
        return {
            "success":  False,
            "msg":      "Scan not ready. Please trigger a scan first.",
            "results":  [],
        }
    
    cached  = json.loads(data)
    results = cached.get("results", [])

   
    filtered = results

    # filtered = [s for s in filtered if s.get("score", 0)     >= min_score]
    filtered = [s for s in filtered if s.get("vol_ratio", 0) >= min_vol]
    filtered = [s for s in filtered if rsi_min <= s.get("rsi", 0) <= rsi_max]
    filtered = [s for s in filtered if s.get("dist_52w", -999) >= -dist_thr]
    filtered = [s for s in filtered if grade_rank.get(s.get("grade", "D"), 1) >= grade_rank.get(min_grade, 1)]
    
    # if sectors:
    #     filtered = [s for s in filtered if s.get("sector") in sectors]
    # if category:
    #     filtered = [s for s in filtered if s.get("category") == category]
    def check_indicator(stock: dict, condition: str) -> bool:
        ind = stock.get("indicators", {})
        rsi_d = ind.get("rsi", {})
        macd  = ind.get("macd", {})
        ma    = ind.get("ma", {})
        price = stock.get("price", 0)

        if condition == "Bullish RSI":  return rsi_d.get("signal") == "BULLISH"
        if condition == "Bearish RSI":  return rsi_d.get("signal") == "BEARISH"
        if condition == "MACD > 0":     return (macd.get("macd") or 0) > 0
        if condition == "MACD < 0":     return (macd.get("macd") or 0) < 0

        sma_20 , sma_50 , sma_200 = (
            ma.get("sma_20"), ma.get("sma_50"),
             ma.get("sma_200"),
        )
        if condition == "Golden Cross": return sma_50 and sma_200 and sma_50 > sma_200
        if condition == "Death cross":  return sma_50 and sma_200 and sma_50 < sma_200
        if condition == "Price > 20SMA":  return sma_20  and price > sma_20
        if condition == "Price > 50SMA": return sma_50 and price > sma_50
        if condition == "Price > 200SMA": return sma_200 and price > sma_200

        # ema_10, ema_100 = ma.get("ema_10"), ma.get("ema_100")
        # if condition == "Price > 10EMA":  return ema_10  and price > ema_10
        # if condition == "Price > 100EMA": return ema_100 and price > ema_100

        return False
    
    if indicators:
        filtered = [s for s in filtered if all(check_indicator(s, c) for c in indicators)]
    
    filtered = sorted(filtered, key=lambda x: x.get("score", 0), reverse=True)
    if limit:
        filtered = filtered[:limit]
   

    return {
        "success":        True,
        "results":        filtered,
        "total_found":    len(filtered),
        "total_scanned":  cached.get("total_scanned"),
       
        "scanned_at":     cached.get("scanned_at"),
        "filters_applied": filters,
    }
    


    
def get_all_cache_stocks():
    data = redis_client.get("market_scan")
    if not data:
        return {
            "success":  False,
            "msg":      "Scan not ready. Please trigger a scan first.",
            "results":  [],
        }
    
    cached  = json.loads(data)
    results = cached.get("results", [])
    
    sanitize_for_json(cached)
    return cached
    

def search_symbols_detail(query: str, limit: int = 15) -> list[dict]:
    raw_results = search_symbols(query, limit=limit)
    return raw_results
    
          

# search_symbols_detail("ji")

def sectors_analysis():
    data = redis_client.get("sector_rotation")
    if data :
        print("Using cached Stock Details from Redis")
        return json.loads(data)
    
    try:
        sector_rotation = get_sector_rotation()
        try :
            redis_client.setex("sector_rotation", 18000, json.dumps(sector_rotation))
        except Exception as e:
            print("Failed to cache curr stock  in Redis:", e)
    except Exception:
        sector_rotation = {}
    
    return sector_rotation
    



# Ai Decision
def run_ai_analysis(symbol: str) -> dict:
    data = redis_client.get("ai_analysis")
    if data :
        print("Ai decision from cache")
        return json.loads(data)
    
        
    df = fetch(symbol)
    model_name: GROQ_MODEL
    api_key = get_key()
    model_name = GROQ_MODEL
    sel = analyze(symbol)
    
   
    dow = sel['dow']
    ind = sel['indicators']
    pat = sel['patterns']
    rev = sel['reversal']
    candles = sel['candles']
    cont = sel['cont']
    entry_data = get_full_entry_analysis(df , dow , ind , pat ,cont , rev  , candles)
    
    company_name = get_company_name(symbol)
    fundamentals = get_fundamentals(symbol)
    news_data = get_news_sentiment(symbol =symbol ,company_name = company_name)
    risk_data = get_full_risk_report(df = df, ind_result = ind, pat_result = pat, cont_result = cont,
                                rev_result = rev, candle_result = candles, dow_result = dow,
                                news_sentiment = news_data)
    
    
    
    fd  = fundamentals or {}
    rat = fd.get("ratios",   {})
    ann = fd.get("annual",   [])
    qts = fd.get("quarterly",[])

    rev_growth_yoy  = ann[1]["rev_growth"]  if len(ann) >= 2 else None
    prof_growth_yoy = ann[1]["prof_growth"] if len(ann) >= 2 else None
    last_q_profit   = qts[0]["profit_str"]  if qts else None
    last_q_trend    = qts[0]["prof_arrow"]  if qts else None
    
    
    ed = entry_data
    has_entry  = ed.get("found" , False)
    
   
    rv_d = risk_data or {}
    mtf = rv_d.get("mtf", {})
    rf_list = [r["title"] for r in rv_d.get("risks", [])[:5]] if rv_d else []
    mtf_s   = mtf.get("alignment", "") if mtf else ""
    
    nd = news_data or {}
    existing_articles = nd.get("articles", [])
    
    gemini_news = analyse_news_with_gemini( symbol=symbol, company_name=company_name, api_key=api_key, model_name=model_name, existing_headlines= existing_articles)
    pos_headlines = [n.get("title", "") for n in gemini_news.get("positive", [])[:6]]
    neg_headlines = [n.get("title", "") for n in gemini_news.get("negative", [])[:6]]
    
    decision = get_ai_decision(
        symbol=symbol,
        company_name=company_name,
        api_key=api_key,
        model_name=model_name,

        # Technical
        score         = sel.get("score"),
        grade         = sel.get("grade"),
        cmp           = sel["price"],
        entry         = ed.get("entry") if has_entry else None,
        sl            = ed.get("sl")    if has_entry else None,
        t1            = ed.get("t1")    if has_entry else None,
        t2            = ed.get("t2")    if has_entry else None,
        rsi           = sel.get("rsi"),
        macd_signal   = sel["indicators"]["macd"]["signal"],
        dow_signal    = sel["dow"]["signal"],
        dow_primary   = sel["dow"]["primary"]["trend"],
        strength      = sel.get("strength"),

        # Fundamentals
        pe_ratio           = rat.get("pe_ratio"),
        pb_ratio           = rat.get("pb_ratio"),
        roe                = rat.get("roe"),
        debt_equity        = rat.get("debt_to_equity"),
        profit_margin      = rat.get("profit_margin"),
        revenue_growth_yoy = rev_growth_yoy,
        profit_growth_yoy  = prof_growth_yoy,
        market_cap         = rat.get("market_cap"),
        eps                = rat.get("eps_ttm"),
        last_quarter_profit= last_q_profit,
        last_quarter_trend = last_q_trend,
        dividend_yield     = rat.get("dividend_yield"),

        # News
        vader_score           = nd.get("overall_score"),
        vader_sentiment       = nd.get("overall_sentiment"),
        gemini_news_score     = gemini_news.get("overall_news_score"),
        gemini_news_sentiment = gemini_news.get("overall_news_sentiment"),
        top_positive_news     = pos_headlines,
        top_negative_news     = neg_headlines,
        news_summary          = gemini_news.get("news_summary", ""),

        # Risk
        risk_level  = rv_d.get("overall")    if rv_d else None,
        high_risks  = rv_d.get("high_count", 0) if rv_d else 0,
        risk_factors= rf_list,

        # MTF
        mtf_alignment = mtf_s,
    )
    
    summary =  {
        "symbol":       symbol,
        "company_name": company_name,
        "timestamp":    datetime.now().strftime("%d %b %Y %H:%M"),
        "news":         gemini_news,
        "decision":     decision,
    }
    
    try:
        redis_client.setex("ai_analysis" , 3600 , json.dumps(summary))
    
    except Exception as e :
        print("Something went wrong in Ai Analysis cache" , e)
    return summary




def get_risks(symbol : str):
    df = fetch(symbol)
    sel = analyze(symbol)
    dow = sel['dow']
    ind = sel['indicators']
    pat = sel['patterns']
    rev = sel['reversal']
    candles = sel['candles']
    cont = sel['cont']
    entry_data = get_full_entry_analysis(df , dow , ind , pat , rev , cont , candles)
    # if not entry_data.get("found"):
    #     return {
    #         "error": "No valid entry found",
    #         "reason": entry_data.get("reason", "Unknown"),
    #         "regime": entry_data.get("regime"),
    #     }

    # entry = entry_data["entry"]
    company_name = get_company_name(symbol)
    fundamentals = get_fundamentals(symbol)
    news_data = get_news_sentiment(symbol =symbol ,company_name = company_name)
    risk_data = get_full_risk_report(df = df, ind_result = ind, pat_result = pat, cont_result = cont,
                                rev_result = rev, candle_result = candles, dow_result = dow,
                                news_sentiment = news_data)
    
    return  {
        "risk_data": risk_data,
        "entry_analysis": entry_data,
            "fundamentals": fundamentals,
            "news_sentiment": news_data
        }
    

# print(get_risks("BEL"))

def get_candlesticks_stocks(filters:dict = None , limit:int = 20):
 
    
    if filters is None:
        filters = {}

    data = redis_client.get("market_scan")
    if not data:
        return {"success": False, "msg": "Scan not ready", "results": []}
    
    cached  = json.loads(data)
    results = cached.get("results", [])
    
    # Filter params
    # now comment out see after 
    # direction = filters.get("direction")   # "BULLISH" / "BEARISH" / "NEUTRAL" / None = all
    # strength  = filters.get("strength")    # "STRONG" / "MEDIUM" / "WEAK" / None = all
    # pattern   = filters.get("pattern")     # e.g. "DOJI" / None = all
    
    found = []
    
    for stock in results:
        candles = stock.get("candles", {})
        if not candles:
            continue
        # lastest candle
        latest = candles.get("latest")
        if not latest:
            continue
        
        # if direction and latest.get("direction") != direction:
        #     continue
        # if strength and latest.get("strength") != strength:
        #     continue
        # if pattern and latest.get("name") != pattern:
        #     continue
        found.append({
            # Stock info
            "symbol":      stock.get("symbol"),
            "company_name" : stock.get("fundamentals", {}).get("info", {}).get("name", "Unknown Company"),
            "price":       stock.get("price"),
            "change":      stock.get("change"),
            "change_percent" : stock.get("change_percent"),
            "w52h":        stock.get("w52h"),
            "dist_52w":    stock.get("dist_52w"),
            "vol_ratio":   stock.get("vol_ratio"),
            "rsi":         stock.get("rsi"),
            "score":       stock.get("score"),
            "strength":    stock.get("strength"),
            "grade":       stock.get("grade"),
            "grade_color": stock.get("grade_color"),
            "sl":          stock.get("sl"),
            "t1":          stock.get("t1"),
            "t2":          stock.get("t2"),
            # Candle info
            "candle": {
                "name":      latest.get("name"),
                "signal":    latest.get("signal"),
                "direction": latest.get("direction"),
                "strength":  latest.get("strength"),
                "desc":      latest.get("desc"),
                "color":     latest.get("color"),
                "date":      latest.get("date"),
                "bars_ago":  latest.get("bars_ago"),
            },
            # Stochastic context
            "stochastic": candles.get("stochastic"),
        })
        
    found = heapq.nlargest(limit, found, key=lambda x: x.get("score", 0))
        
    # Group by direction for UI
    bullish = [s for s in found if s["candle"]["direction"] == "BULLISH"]
    bearish = [s for s in found if s["candle"]["direction"] == "BEARISH"]
    neutral = [s for s in found if s["candle"]["direction"] == "NEUTRAL"]
    
    r = {
        "success":  True,
        "total":    len(found),
        "results":  found,
        "bullish":  bullish,
        "bearish":  bearish,
        "neutral":  neutral,
        "scanned_at": cached.get("scanned_at"),
    }
    
    
        
    r = sanitize_for_json(r)
    
    return r
    

def get_reversal_pattern_Stocks(filters:dict = None , limit:int =20):
    if filters is None:
        filters = {}

    data = redis_client.get("market_scan")
    if not data:
        return {"success": False, "msg": "Scan not ready", "results": []}
    
    cached  = json.loads(data)
    results = cached.get("results", [])
    
    found = []
    
    for stock in results:
        rev_pattern = stock.get("reversal", {})
        if not rev_pattern.get("patterns"):
            continue
        # lastest candle
        best = rev_pattern.get("best")
        if not best:
            continue
        # if current price is greater than reversal target  skip
        if best.get("price_target") < stock.get("price"):
            continue
        found.append({
                # Stock info
                "symbol":      stock.get("symbol"),
                "price":       stock.get("price"),
                "change":      stock.get("change"),
                "change_percent" : stock.get("change_percent"),
                "w52h":        stock.get("w52h"),
                "dist_52w":    stock.get("dist_52w"),
                "vol_ratio":   stock.get("vol_ratio"),
                "rsi":         stock.get("rsi"),
                "score":       stock.get("score"),
                "strength":    stock.get("strength"),
                "grade":       stock.get("grade"),
                "grade_color": stock.get("grade_color"),
                "sl":          stock.get("sl"),
                "t1":          stock.get("t1"),
                "t2":          stock.get("t2"),
            
                "reversal":  best ,
                "recent_gaps" : rev_pattern.get("recent_gaps")
                # Stochastic context
                
            })
        
    found = heapq.nlargest(limit, found, key=lambda x: x.get("score", 0))
        
    # Group by direction for UI
    # bullish = [s for s in found if s["reversal"]["direction"] == "BULLISH"]
    # bearish = [s for s in found if s["reversal"]["direction"] == "BEARISH"]
    # neutral = [s for s in found if s["reversal"]["direction"] == "NEUTRAL"]
    
    r = {
        "success":  True,
        "total":    len(found),
        "results":  found,
        # "bullish":  bullish,
        # "bearish":  bearish,
        # "neutral":  neutral,
        "scanned_at": cached.get("scanned_at"),
    }
    sanitize_for_json(r)
    return r
    
        
        
    
    
# print(get_reversal_pattern_Stocks())
def get_cont_pattern_Stocks(filters:dict = None , limit:int = 20):
    if filters is None:
        filters = {}

    data = redis_client.get("market_scan")
    if not data:
        return {"success": False, "msg": "Scan not ready", "results": []}
    
    cached  = json.loads(data)
    results = cached.get("results", [])
    
    found = []
    
    for stock in results:
        cont_pattern = stock.get("cont", {})
        if not cont_pattern.get("patterns"):
            continue
        # lastest candle
        best = cont_pattern.get("best")
        if not best:
            continue
        # if current price is greater than reversal target  skip
        if best.get("price_target") < stock.get("price"):
            continue
        
        
        found.append({
                # Stock info
                "symbol":      stock.get("symbol"),
                "price":       stock.get("price"),
                "change":      stock.get("change"),
                "change_percent" : stock.get("change_percent"),
                "w52h":        stock.get("w52h"),
                "dist_52w":    stock.get("dist_52w"),
                "vol_ratio":   stock.get("vol_ratio"),
                "rsi":         stock.get("rsi"),
                "score":       stock.get("score"),
                "strength":    stock.get("strength"),
                "grade":       stock.get("grade"),
                "grade_color": stock.get("grade_color"),
                "sl":          stock.get("sl"),
                "t1":          stock.get("t1"),
                "t2":          stock.get("t2"),
            
                "cont":  best ,
                 "sr":          cont_pattern.get("sr"),
                "trendlines":  cont_pattern.get("trendlines"),
                "ma_crosses":  cont_pattern.get("ma_crosses"),
                # "recent_gaps" : rev_pattern.get("recent_gaps")
                # Stochastic context
                
            })
        
    found = heapq.nlargest(limit, found, key=lambda x: x.get("score", 0))
        
    # Group by direction for UI
    # bullish = [s for s in found if s["reversal"]["direction"] == "BULLISH"]
    # bearish = [s for s in found if s["reversal"]["direction"] == "BEARISH"]
    # neutral = [s for s in found if s["reversal"]["direction"] == "NEUTRAL"]
    
    r = {
        "success":  True,
        "total":    len(found),
        "results":  found,
        # "bullish":  bullish,
        # "bearish":  bearish,
        # "neutral":  neutral,
        "scanned_at": cached.get("scanned_at"),
    }
    sanitize_for_json(r)
    return r
    
# def get_triangle_wedges_pattern_Stocks(filters:dict = None , limit:int = 20):
#     if filters is None:
#         filters = {}

#     data = redis_client.get("market_scan")
#     if not data:
#         return {"success": False, "msg": "Scan not ready", "results": []}
    
#     cached  = json.loads(data)
#     results = cached.get("results", [])
    
#     found = []
    
#     for stock in results:
#         wedge_pattern = stock.get("cont", {})
#         if not wedge_pattern.get("patterns"):
#             continue
#         # lastest candle
#         best = cont_pattern.get("best")
#         if not best:
#             continue
#         # if current price is greater than reversal target  skip
#         if best.get("price_target") < stock.get("price"):
#             continue
        
        
#         found.append({
#                 # Stock info
#                 "symbol":      stock.get("symbol"),
#                 "price":       stock.get("price"),
#                 "change":      stock.get("change"),
#                 "change_percent" : stock.get("change_percent"),
#                 "w52h":        stock.get("w52h"),
#                 "dist_52w":    stock.get("dist_52w"),
#                 "vol_ratio":   stock.get("vol_ratio"),
#                 "rsi":         stock.get("rsi"),
#                 "score":       stock.get("score"),
#                 "strength":    stock.get("strength"),
#                 "grade":       stock.get("grade"),
#                 "grade_color": stock.get("grade_color"),
#                 "sl":          stock.get("sl"),
#                 "t1":          stock.get("t1"),
#                 "t2":          stock.get("t2"),
            
#                 "cont":  best ,
#                  "sr":          cont_pattern.get("sr"),
#                 "trendlines":  cont_pattern.get("trendlines"),
#                 "ma_crosses":  cont_pattern.get("ma_crosses"),
#                 # "recent_gaps" : rev_pattern.get("recent_gaps")
#                 # Stochastic context
                
#             })
        
#     found = heapq.nlargest(limit, found, key=lambda x: x.get("score", 0))
        
#     # Group by direction for UI
#     # bullish = [s for s in found if s["reversal"]["direction"] == "BULLISH"]
#     # bearish = [s for s in found if s["reversal"]["direction"] == "BEARISH"]
#     # neutral = [s for s in found if s["reversal"]["direction"] == "NEUTRAL"]
    
#     r = {
#         "success":  True,
#         "total":    len(found),
#         "results":  found,
#         # "bullish":  bullish,
#         # "bearish":  bearish,
#         # "neutral":  neutral,
#         "scanned_at": cached.get("scanned_at"),
#     }
#     sanitize_for_json(r)
#     return r
    
      

def fin_recommendation(filters: dict = None, top_n: int = 10) -> dict:
    if filters is None:
        filters = {
            "min_vol":   0.4,      
            "rsi_min":   40,     
            "rsi_max":   70,      
            "dist_thr":  15,       
            "min_grade": "C",      
            "sectors":   [],       
            "min_score": 15,       
        }
        
    scan_result = get_market_scan_cache(filters)
    if not scan_result.get("success"):
        return {
            "success": False,
            "msg":     scan_result.get("msg", "Scan not available"),
            "recommendations": [],
        }
    
    stocks = scan_result.get("results", [])
    
    if not stocks:
        return {
            "success": True,
            "msg":     "No stocks matched filters",
            "recommendations": [],
            "total_scanned": scan_result.get("total_scanned"),
        }
    
    
    strong_stocks = []
    
    for stock in stocks:
        
        entry = stock.get("entry" , [])
        strength = stock.get("strength", "WEAK")
        is_strong = (
            strength in ("STRONG", "MEDIUM") and 
            entry.get("grade") in ("A" , "B" , "C")
            
        )
        if is_strong:
            strong_stocks.append(stock)
    
    strong_stocks.sort(key=lambda x: x.get("score", 0), reverse=True)
    
    top_picks = strong_stocks[:top_n]
    recommendations = []
    
    for stock in top_picks:
        entry = stock.get("entry" , {})
        reversal = stock.get("reversal", {}).get("best")
        candle  = stock.get("candles", {}).get("latest", {})
        cont  = stock.get("cont", {}).get("best", {})
        ind =  candle  = stock.get("indicators", {})
        
        recommendations.append({
            "symbol":      stock.get("symbol"),
            "sector":      stock.get("sector"),
            "price":       stock.get("price"),
            "change":      stock.get("change"),
            "score":       stock.get("score"),
            "grade":       stock.get("grade"),
            "grade_color": stock.get("grade_color"),
            "strength":    stock.get("strength"),
            "rsi":         stock.get("rsi"),
            "vol_ratio":   stock.get("vol_ratio"),
            "dist_52w":    stock.get("dist_52w"),
            # "indicators" : ind,
            "entry" : entry,
            # "candle_pattern": candle ,
            # "rev_pattern": reversal ,
            # "cont_pattern" : cont
        })
    
    return {
        "success":          True,
        "total_scanned":    scan_result.get("total_scanned"),
        "total_matched":    len(stocks),
        "total_strong":     len(strong_stocks),
        "recommendations":  recommendations,
        "filters_applied":  filters,
        "scanned_at":       scan_result.get("scanned_at"),
    }
        
     
        

    
    
    
    
    


    
    



# get_candlesticks_stocks()
    
    
    
   
    
    
    
    
    
#     {
#   "success": true,
#   "results": [
#     {
#       "symbol": "SUNPHARMA",
#       "price": 1801.300048828125,
#       "change": -0.35,
#       "w52h": 1916.6,
#       "dist_52w": -6.02,
#       "vol_ratio": 0.21,
#       "rsi": 49.2,
#       "score": 13,
#       "strength": "MEDIUM",
#       "grade": "C",
#       "grade_color": "#f5a623",
#       "sl": 1749.57,
#       "t1": 1870.28,
#       "t2": 1922.02,
#       "dow": {
#         "primary": {
#           "trend": "UPTREND",
#           "description": "Primary Uptrend (Bullish Tide) — Trade LONG only",
#           "color": "#3dd68c",
#           "emoji": "🌊⬆️",
#           "swing_highs": [
#             {
#               "Date": "2024-09-30",
#               "price": 1929.6780973997247,
#               "type": "high"
#             },
#             {
#               "Date": "2024-12-31",
#               "price": 1880.1158074439886,
#               "type": "high"
#             },
#             {
#               "Date": "2025-03-24",
#               "price": 1802.3209171523695,
#               "type": "high"
#             },
#             {
#               "Date": "2025-05-02",
#               "price": 1833.2178100929195,
#               "type": "high"
#             },
#             {
#               "Date": "2025-07-31",
#               "price": 1736.7186855343634,
#               "type": "high"
#             },
#             {
#               "Date": "2025-12-01",
#               "price": 1837.0668475095704,
#               "type": "high"
#             },
#             {
#               "Date": "2026-03-11",
#               "price": 1843,
#               "type": "high"
#             }
#           ],
#           "swing_lows": [
#             {
#               "Date": "2024-11-28",
#               "price": 1696.4353857445187,
#               "type": "low"
#             },
#             {
#               "Date": "2025-03-05",
#               "price": 1537.9641709934328,
#               "type": "low"
#             },
#             {
#               "Date": "2025-05-12",
#               "price": 1607.8286641572022,
#               "type": "low"
#             },
#             {
#               "Date": "2025-06-19",
#               "price": 1620.1082848742983,
#               "type": "low"
#             },
#             {
#               "Date": "2025-09-26",
#               "price": 1538.0094080385923,
#               "type": "low"
#             },
#             {
#               "Date": "2026-01-29",
#               "price": 1573.4790131992938,
#               "type": "low"
#             },
#             {
#               "Date": "2026-04-24",
#               "price": 1613.5999755859375,
#               "type": "low"
#             }
#           ]
#         },
#         "secondary": {
#           "trend": "SIDEWAYS",
#           "description": "Secondary Consolidation",
#           "color": "#f5a623",
#           "emoji": "🌊➡️",
#           "swing_highs": [
#             {
#               "Date": "2026-01-07",
#               "price": 1794.9404444357126,
#               "type": "high"
#             },
#             {
#               "Date": "2026-03-11",
#               "price": 1843,
#               "type": "high"
#             },
#             {
#               "Date": "2026-05-19",
#               "price": 1916.5999755859375,
#               "type": "high"
#             }
#           ],
#           "swing_lows": [
#             {
#               "Date": "2025-12-30",
#               "price": 1695.9832619186739,
#               "type": "low"
#             },
#             {
#               "Date": "2026-01-29",
#               "price": 1573.4790131992938,
#               "type": "low"
#             },
#             {
#               "Date": "2026-04-02",
#               "price": 1620,
#               "type": "low"
#             },
#             {
#               "Date": "2026-04-24",
#               "price": 1613.5999755859375,
#               "type": "low"
#             }
#           ],
#           "retracement_pct": 135.9,
#           "retracement_label": "⚠️ Retracement 135.9% (outside classic zone)"
#         },
#         "minor": {
#           "trend": "UPTREND",
#           "description": "Minor Uptrend (Ripple Up — good entry in primary uptrend)",
#           "color": "#3dd68c",
#           "emoji": "〰️⬆️",
#           "swing_highs": [
#             {
#               "Date": "2026-05-11",
#               "price": 1885.800048828125,
#               "type": "high"
#             },
#             {
#               "Date": "2026-05-19",
#               "price": 1916.5999755859375,
#               "type": "high"
#             }
#           ],
#           "swing_lows": [
#             {
#               "Date": "2026-06-03",
#               "price": 1756.800048828125,
#               "type": "low"
#             },
#             {
#               "Date": "2026-06-09",
#               "price": 1766.0999755859375,
#               "type": "low"
#             }
#           ]
#         },
#         "signal": "BUY",
#         "signal_color": "#7c6af7",
#         "signal_desc": "Primary trend is UP, minor trend confirming"
#       },
#       "indicators": {
#         "rsi": {
#           "value": 49.2,
#           "signal": "BEARISH",
#           "divergence": "BULLISH_DIVERGENCE"
#         },
#         "macd": {
#           "signal": "BEARISH",
#           "color": "#f75f5f",
#           "description": "MACD below zero and signal — downward momentum",
#           "macd": -3.418,
#           "signal_line": 0.949,
#           "histogram": -4.367,
#           "cross": "NONE"
#         },
#         "bb": {
#           "signal": "NEUTRAL",
#           "color": "#aaaaaa",
#           "description": "Price inside bands (37.7%B) — no extreme reading",
#           "upper": 1902.23,
#           "lower": 1740.15,
#           "mid": 1821.19,
#           "pct_b": 37.7,
#           "squeeze": false
#         },
#         "ma": {
#           "sma_20": 1821.19,
#           "sma_50": 1777.92,
#           "sma_200": 1717.75,
#           "dist_200ma": 4.86
#         },
#         "atr": {
#           "value": 34.49,
#           "pct": 1.91
#         },
#         "volume": {
#           "ratio": 0.21
#         }
#       },
#       "patterns": {
#         "found": false,
#         "patterns": [],
#         "best": null,
#         "signal": "NO PATTERN",
#         "color": "#aaaaaa"
#       },
#       "reversal": {
#         "patterns": [
#           {
#             "type": "TRIPLE_BOTTOM",
#             "emoji": "🏔️🏔️🏔️",
#             "direction": "BULLISH",
#             "confirmed": false,
#             "confidence": 45,
#             "description": "Triple Bottom at ≈₹1714.4 | Resistance ₹1843.0 | Watching",
#             "trade_note": "Buy above ₹1843.0. Target ₹1971.6",
#             "neckline": 1843,
#             "price_target": 1971.57,
#             "vol_ok": true,
#             "bars_formed": 22
#           }
#         ],
#         "gaps": [
#           {
#             "type": "COMMON_GAP",
#             "emoji": "⬜",
#             "direction": "DOWN",
#             "gap_size": 0.77,
#             "vol_ratio": 1,
#             "gap_filled": true,
#             "is_recent": false,
#             "significance": "LOW",
#             "description": "Common Gap (DOWN) — already filled. No trend significance.",
#             "color": "#6b6b80",
#             "bar_index": 11,
#             "date": "11"
#           }
#         ],
#         "recent_gaps": [],
#         "found": true,
#         "best": {
#           "type": "TRIPLE_BOTTOM",
#           "emoji": "🏔️🏔️🏔️",
#           "direction": "BULLISH",
#           "confirmed": false,
#           "confidence": 45,
#           "description": "Triple Bottom at ≈₹1714.4 | Resistance ₹1843.0 | Watching",
#           "trade_note": "Buy above ₹1843.0. Target ₹1971.6",
#           "neckline": 1843,
#           "price_target": 1971.57,
#           "vol_ok": true,
#           "bars_formed": 22
#         }
#       },
#       "cont": {
#         "patterns": [
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 100,
#             "description": "Bull Flag: Pole +10.3% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1961.4 (pole height projected).",
#             "pole_move": 10.32,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1961.35,
#             "bars_formed": 14,
#             "neckline": 1789.15
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 100,
#             "description": "Bull Flag: Pole +10.8% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1969.4 (pole height projected).",
#             "pole_move": 10.76,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1969.45,
#             "bars_formed": 13,
#             "neckline": 1790.35
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 85,
#             "description": "Bull Flag: Pole +11.0% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1960.0 (pole height projected).",
#             "pole_move": 10.99,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1960.03,
#             "bars_formed": 20,
#             "neckline": 1771.33
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 85,
#             "description": "Bull Flag: Pole +13.7% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1999.9 (pole height projected).",
#             "pole_move": 13.74,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1999.92,
#             "bars_formed": 19,
#             "neckline": 1772.52
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 85,
#             "description": "Bull Flag: Pole +13.8% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹2003.7 (pole height projected).",
#             "pole_move": 13.81,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 2003.73,
#             "bars_formed": 18,
#             "neckline": 1775.63
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 85,
#             "description": "Bull Flag: Pole +11.5% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1972.0 (pole height projected).",
#             "pole_move": 11.48,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1971.96,
#             "bars_formed": 17,
#             "neckline": 1777.26
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 80,
#             "description": "Bull Flag: Pole +10.6% in 21 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1948.6 (pole height projected).",
#             "pole_move": 10.57,
#             "pole_bars": 21,
#             "vol_ok": false,
#             "price_target": 1948.61,
#             "bars_formed": 21,
#             "neckline": 1781.11
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 80,
#             "description": "Bull Flag: Pole +10.4% in 22 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1924.1 (pole height projected).",
#             "pole_move": 10.44,
#             "pole_bars": 22,
#             "vol_ok": false,
#             "price_target": 1924.07,
#             "bars_formed": 21,
#             "neckline": 1758.58
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 80,
#             "description": "Bull Flag: Pole +12.6% in 23 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1940.9 (pole height projected).",
#             "pole_move": 12.59,
#             "pole_bars": 23,
#             "vol_ok": false,
#             "price_target": 1940.86,
#             "bars_formed": 21,
#             "neckline": 1741.36
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 80,
#             "description": "Bull Flag: Pole +13.5% in 24 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1948.0 (pole height projected).",
#             "pole_move": 13.53,
#             "pole_bars": 24,
#             "vol_ok": false,
#             "price_target": 1947.96,
#             "bars_formed": 21,
#             "neckline": 1733.56
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 80,
#             "description": "Bull Flag: Pole +14.0% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1946.5 (pole height projected).",
#             "pole_move": 14.03,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1946.5,
#             "bars_formed": 21,
#             "neckline": 1724.11
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 80,
#             "description": "Bull Flag: Pole +12.1% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1906.3 (pole height projected).",
#             "pole_move": 12.08,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1906.27,
#             "bars_formed": 21,
#             "neckline": 1710.86
#           },
#           {
#             "type": "CUP_AND_HANDLE",
#             "emoji": "☕",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 80,
#             "description": "Cup & Handle: Rim ≈₹1736.7 | Bottom ≈₹1553.2 | Depth 10.6%\n⚡ BREAKOUT above rim!",
#             "trade_note": "Buy on close above ₹1736.7. Target ₹1920.2. SL: below handle low.",
#             "neckline": 1736.72,
#             "price_target": 1920.23,
#             "cup_depth": 10.57,
#             "vol_ok": false,
#             "bars_formed": 34
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 75,
#             "description": "Bull Flag: Pole +8.3% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1937.1 (pole height projected).",
#             "pole_move": 8.34,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1937.11,
#             "bars_formed": 21,
#             "neckline": 1792.91
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 75,
#             "description": "Bull Flag: Pole +9.0% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1937.7 (pole height projected).",
#             "pole_move": 8.98,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1937.71,
#             "bars_formed": 21,
#             "neckline": 1785.61
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 75,
#             "description": "Bull Flag: Pole +7.7% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1910.5 (pole height projected).",
#             "pole_move": 7.68,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1910.47,
#             "bars_formed": 21,
#             "neckline": 1780.27
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 75,
#             "description": "Bull Flag: Pole +8.5% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1920.9 (pole height projected).",
#             "pole_move": 8.45,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1920.88,
#             "bars_formed": 21,
#             "neckline": 1775.68
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 75,
#             "description": "Bull Flag: Pole +9.5% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1936.8 (pole height projected).",
#             "pole_move": 9.54,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1936.83,
#             "bars_formed": 21,
#             "neckline": 1773.23
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 75,
#             "description": "Bull Flag: Pole +8.9% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1932.8 (pole height projected).",
#             "pole_move": 8.95,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1932.82,
#             "bars_formed": 16,
#             "neckline": 1781.32
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 75,
#             "description": "Bull Flag: Pole +9.9% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1953.3 (pole height projected).",
#             "pole_move": 9.85,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1953.35,
#             "bars_formed": 15,
#             "neckline": 1788.25
#           },
#           {
#             "type": "CUP_AND_HANDLE",
#             "emoji": "☕",
#             "direction": "BULLISH",
#             "confirmed": false,
#             "confidence": 75,
#             "description": "Cup & Handle: Rim ≈₹1843.0 | Bottom ≈₹1579.0 | Depth 14.0%\nHandle forming — buy on break above ₹1843.0",
#             "trade_note": "Buy on close above ₹1843.0. Target ₹2101.0. SL: below handle low.",
#             "neckline": 1843,
#             "price_target": 2101.02,
#             "cup_depth": 14.05,
#             "vol_ok": true,
#             "bars_formed": 68
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 70,
#             "description": "Bull Flag: Pole +8.0% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1829.2 (pole height projected).",
#             "pole_move": 7.97,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1829.19,
#             "bars_formed": 21,
#             "neckline": 1694.41
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 70,
#             "description": "Bear Flag: Pole -5.6% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1757.9 (pole height projected).",
#             "pole_move": -5.62,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1757.94,
#             "bars_formed": 21,
#             "neckline": 1856.24
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 65,
#             "description": "Bear Flag: Pole -5.7% in 9 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1680.4 (pole height projected).",
#             "pole_move": -5.74,
#             "pole_bars": 9,
#             "vol_ok": true,
#             "price_target": 1680.4,
#             "bars_formed": 11,
#             "neckline": 1789.7
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 65,
#             "description": "Bear Flag: Pole -6.1% in 10 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1677.5 (pole height projected).",
#             "pole_move": -6.08,
#             "pole_bars": 10,
#             "vol_ok": true,
#             "price_target": 1677.51,
#             "bars_formed": 10,
#             "neckline": 1793.41
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 65,
#             "description": "Bear Flag: Pole -6.2% in 11 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1678.1 (pole height projected).",
#             "pole_move": -6.15,
#             "pole_bars": 11,
#             "vol_ok": true,
#             "price_target": 1678.08,
#             "bars_formed": 9,
#             "neckline": 1795.38
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 65,
#             "description": "Bear Flag: Pole -5.2% in 13 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1696.0 (pole height projected).",
#             "pole_move": -5.22,
#             "pole_bars": 13,
#             "vol_ok": true,
#             "price_target": 1695.96,
#             "bars_formed": 8,
#             "neckline": 1794.06
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 65,
#             "description": "Bear Flag: Pole -5.1% in 14 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1699.1 (pole height projected).",
#             "pole_move": -5.11,
#             "pole_bars": 14,
#             "vol_ok": true,
#             "price_target": 1699.09,
#             "bars_formed": 7,
#             "neckline": 1795.09
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 65,
#             "description": "Bear Flag: Pole -6.1% in 14 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1683.8 (pole height projected).",
#             "pole_move": -6.14,
#             "pole_bars": 14,
#             "vol_ok": true,
#             "price_target": 1683.77,
#             "bars_formed": 6,
#             "neckline": 1800.77
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bull Flag: Pole +7.8% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1819.9 (pole height projected).",
#             "pole_move": 7.79,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1819.85,
#             "bars_formed": 21,
#             "neckline": 1687.95
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bull Flag: Pole +5.8% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1784.3 (pole height projected).",
#             "pole_move": 5.81,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1784.32,
#             "bars_formed": 21,
#             "neckline": 1685.32
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bull Flag: Pole +5.2% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1769.2 (pole height projected).",
#             "pole_move": 5.2,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1769.24,
#             "bars_formed": 21,
#             "neckline": 1681.14
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bull Flag: Pole +5.3% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1763.8 (pole height projected).",
#             "pole_move": 5.27,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1763.8,
#             "bars_formed": 21,
#             "neckline": 1674
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -5.1% in 19 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1710.4 (pole height projected).",
#             "pole_move": -5.13,
#             "pole_bars": 19,
#             "vol_ok": false,
#             "price_target": 1710.35,
#             "bars_formed": 21,
#             "neckline": 1803.15
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -5.3% in 19 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1727.9 (pole height projected).",
#             "pole_move": -5.28,
#             "pole_bars": 19,
#             "vol_ok": false,
#             "price_target": 1727.88,
#             "bars_formed": 21,
#             "neckline": 1823.58
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -5.6% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1749.2 (pole height projected).",
#             "pole_move": -5.57,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1749.15,
#             "bars_formed": 21,
#             "neckline": 1846.75
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -5.7% in 24 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1763.1 (pole height projected).",
#             "pole_move": -5.71,
#             "pole_bars": 24,
#             "vol_ok": false,
#             "price_target": 1763.12,
#             "bars_formed": 21,
#             "neckline": 1865.92
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -5.9% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1774.9 (pole height projected).",
#             "pole_move": -5.91,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1774.91,
#             "bars_formed": 21,
#             "neckline": 1881.21
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -7.3% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1763.0 (pole height projected).",
#             "pole_move": -7.3,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1762.98,
#             "bars_formed": 21,
#             "neckline": 1894.88
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -8.0% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1764.8 (pole height projected).",
#             "pole_move": -7.95,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1764.79,
#             "bars_formed": 21,
#             "neckline": 1908.99
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -8.8% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1757.3 (pole height projected).",
#             "pole_move": -8.8,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1757.29,
#             "bars_formed": 21,
#             "neckline": 1917.99
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -8.5% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1767.2 (pole height projected).",
#             "pole_move": -8.52,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1767.23,
#             "bars_formed": 21,
#             "neckline": 1922.73
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -6.7% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1795.5 (pole height projected).",
#             "pole_move": -6.74,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1795.51,
#             "bars_formed": 21,
#             "neckline": 1917.01
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": true,
#             "confidence": 55,
#             "description": "Bear Flag: Pole -9.1% in 25 bars. ⚡ Breakout confirmed!",
#             "trade_note": "Enter on breakout. Target: ₹1745.3 (pole height projected).",
#             "pole_move": -9.13,
#             "pole_bars": 25,
#             "vol_ok": false,
#             "price_target": 1745.33,
#             "bars_formed": 21,
#             "neckline": 1908.13
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": false,
#             "confidence": 50,
#             "description": "Bull Flag: Pole +5.5% in 20 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1955.2 (pole height projected).",
#             "pole_move": 5.5,
#             "pole_bars": 20,
#             "vol_ok": true,
#             "price_target": 1955.19,
#             "bars_formed": 21,
#             "neckline": 1860.19
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": false,
#             "confidence": 50,
#             "description": "Bull Flag: Pole +5.3% in 21 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1936.4 (pole height projected).",
#             "pole_move": 5.34,
#             "pole_bars": 21,
#             "vol_ok": true,
#             "price_target": 1936.42,
#             "bars_formed": 21,
#             "neckline": 1844.12
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": false,
#             "confidence": 50,
#             "description": "Bull Flag: Pole +5.3% in 23 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1920.1 (pole height projected).",
#             "pole_move": 5.29,
#             "pole_bars": 23,
#             "vol_ok": true,
#             "price_target": 1920.12,
#             "bars_formed": 21,
#             "neckline": 1827.12
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": false,
#             "confidence": 50,
#             "description": "Bull Flag: Pole +6.1% in 23 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1921.2 (pole height projected).",
#             "pole_move": 6.13,
#             "pole_bars": 23,
#             "vol_ok": true,
#             "price_target": 1921.24,
#             "bars_formed": 21,
#             "neckline": 1815.34
#           },
#           {
#             "type": "BULL_FLAG",
#             "emoji": "🚩🟢",
#             "direction": "BULLISH",
#             "confirmed": false,
#             "confidence": 50,
#             "description": "Bull Flag: Pole +5.2% in 25 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1895.1 (pole height projected).",
#             "pole_move": 5.16,
#             "pole_bars": 25,
#             "vol_ok": true,
#             "price_target": 1895.08,
#             "bars_formed": 21,
#             "neckline": 1804.38
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 45,
#             "description": "Bear Flag: Pole -5.1% in 23 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1669.5 (pole height projected).",
#             "pole_move": -5.1,
#             "pole_bars": 23,
#             "vol_ok": false,
#             "price_target": 1669.48,
#             "bars_formed": 21,
#             "neckline": 1760.58
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 30,
#             "description": "Bear Flag: Pole -5.3% in 13 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1617.0 (pole height projected).",
#             "pole_move": -5.33,
#             "pole_bars": 13,
#             "vol_ok": false,
#             "price_target": 1617.03,
#             "bars_formed": 21,
#             "neckline": 1714.43
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 30,
#             "description": "Bear Flag: Pole -5.2% in 22 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1649.2 (pole height projected).",
#             "pole_move": -5.16,
#             "pole_bars": 22,
#             "vol_ok": false,
#             "price_target": 1649.24,
#             "bars_formed": 21,
#             "neckline": 1741.34
#           },
#           {
#             "type": "BEAR_FLAG",
#             "emoji": "🚩🔴",
#             "direction": "BEARISH",
#             "confirmed": false,
#             "confidence": 30,
#             "description": "Bear Flag: Pole -5.2% in 17 bars. Consolidating — watch for breakout.",
#             "trade_note": "Enter on breakout. Target: ₹1687.5 (pole height projected).",
#             "pole_move": -5.23,
#             "pole_bars": 17,
#             "vol_ok": false,
#             "price_target": 1687.52,
#             "bars_formed": 21,
#             "neckline": 1782.32
#           }
#         ],
#         "found": true,
#         "best": {
#           "type": "BULL_FLAG",
#           "emoji": "🚩🟢",
#           "direction": "BULLISH",
#           "confirmed": true,
#           "confidence": 100,
#           "description": "Bull Flag: Pole +10.3% in 25 bars. ⚡ Breakout confirmed!",
#           "trade_note": "Enter on breakout. Target: ₹1961.4 (pole height projected).",
#           "pole_move": 10.32,
#           "pole_bars": 25,
#           "vol_ok": true,
#           "price_target": 1961.35,
#           "bars_formed": 14,
#           "neckline": 1789.15
#         },
#         "sr": {
#           "resistance": [
#             {
#               "price": 1840.03,
#               "touches": 2,
#               "strength": "MODERATE",
#               "dist_pct": 2.2
#             },
#             {
#               "price": 1916.6,
#               "touches": 1,
#               "strength": "WEAK",
#               "dist_pct": 6.4
#             }
#           ],
#           "support": [
#             {
#               "price": 1736.72,
#               "touches": 1,
#               "strength": "WEAK",
#               "dist_pct": -3.6
#             },
#             {
#               "price": 1691.96,
#               "touches": 2,
#               "strength": "MODERATE",
#               "dist_pct": -6.1
#             },
#             {
#               "price": 1654.45,
#               "touches": 3,
#               "strength": "STRONG",
#               "dist_pct": -8.2
#             },
#             {
#               "price": 1616.8,
#               "touches": 2,
#               "strength": "MODERATE",
#               "dist_pct": -10.2
#             },
#             {
#               "price": 1573.48,
#               "touches": 1,
#               "strength": "WEAK",
#               "dist_pct": -12.6
#             }
#           ],
#           "nearest_resistance": {
#             "price": 1840.03,
#             "touches": 2,
#             "strength": "MODERATE",
#             "dist_pct": 2.2
#           },
#           "nearest_support": {
#             "price": 1736.72,
#             "touches": 1,
#             "strength": "WEAK",
#             "dist_pct": -3.6
#           },
#           "current_price": 1801.3
#         },
#         "trendlines": {
#           "uptrend_line": {
#             "slope": 5.5077,
#             "value_now": 1800.86,
#             "touches": 13,
#             "broken": false,
#             "ascending": true
#           },
#           "downtrend_line": {
#             "slope": 2.9576,
#             "value_now": 1969.84,
#             "touches": 2,
#             "broken": false,
#             "descending": false
#           },
#           "uptrend_broken": false,
#           "downtrend_broken": false,
#           "signal": "UPTREND INTACT",
#           "description": "Rising trendline support at ₹1800.86"
#         },
#         "ma_crosses": {
#           "golden_cross": false,
#           "death_cross": false,
#           "golden_cross_date": null,
#           "death_cross_date": null,
#           "ma50_above_ma200": true,
#           "ma20_above_ma50": true,
#           "signal": "BULLISH ALIGNMENT",
#           "color": "#7c6af7",
#           "description": "SMA50 above SMA200 — long-term bullish trend in place.",
#           "medium_term_cross": "BULLISH CROSS (MA20 > MA50)"
#         }
#       },
#       "candles": {
#         "candles": [
#           {
#             "name": "BEARISH_ENGULFING",
#             "emoji": "🟥⬇️",
#             "signal": "BEARISH REVERSAL",
#             "direction": "BEARISH",
#             "strength": "STRONG",
#             "desc": "Bearish Engulfing: Large red candle engulfs previous green — strong reversal signal.",
#             "color": "#f75f5f",
#             "date": "Bar 9",
#             "bars_ago": 0
#           },
#           {
#             "name": "THREE_WHITE_SOLDIERS",
#             "emoji": "⚔️⚔️⚔️",
#             "signal": "STRONG BULLISH CONTINUATION",
#             "direction": "BULLISH",
#             "strength": "STRONG",
#             "desc": "Three White Soldiers: 3 strong green candles — powerful bullish momentum.",
#             "color": "#3dd68c",
#             "date": "Bar 8",
#             "bars_ago": 1
#           },
#           {
#             "name": "DOJI",
#             "emoji": "✚",
#             "signal": "REVERSAL WARNING",
#             "direction": "NEUTRAL",
#             "strength": "MEDIUM",
#             "desc": "Doji: Open ≈ Close — buyer/seller equilibrium. Potential trend reversal.",
#             "color": "#f5a623",
#             "date": "Bar 8",
#             "bars_ago": 1
#           }
#         ],
#         "bullish": [
#           {
#             "name": "THREE_WHITE_SOLDIERS",
#             "emoji": "⚔️⚔️⚔️",
#             "signal": "STRONG BULLISH CONTINUATION",
#             "direction": "BULLISH",
#             "strength": "STRONG",
#             "desc": "Three White Soldiers: 3 strong green candles — powerful bullish momentum.",
#             "color": "#3dd68c",
#             "date": "Bar 8",
#             "bars_ago": 1
#           }
#         ],
#         "bearish": [
#           {
#             "name": "BEARISH_ENGULFING",
#             "emoji": "🟥⬇️",
#             "signal": "BEARISH REVERSAL",
#             "direction": "BEARISH",
#             "strength": "STRONG",
#             "desc": "Bearish Engulfing: Large red candle engulfs previous green — strong reversal signal.",
#             "color": "#f75f5f",
#             "date": "Bar 9",
#             "bars_ago": 0
#           }
#         ],
#         "latest": {
#           "name": "BEARISH_ENGULFING",
#           "emoji": "🟥⬇️",
#           "signal": "BEARISH REVERSAL",
#           "direction": "BEARISH",
#           "strength": "STRONG",
#           "desc": "Bearish Engulfing: Large red candle engulfs previous green — strong reversal signal.",
#           "color": "#f75f5f",
#           "date": "Bar 9",
#           "bars_ago": 0
#         },
#         "stochastic": {
#           "signal": "BEARISH",
#           "color": "#f5a623",
#           "description": "Stochastic 36 — below 50, bearish momentum.",
#           "k": 35.5,
#           "d": 33.9,
#           "cross": "NONE"
#         }
#       }
#     }
#   ],
#   "total_found": 1,
#   "total_scanned": 1,
  
#   "scanned_at": "15 Jun 2026  10:18 AM",
#   "filters_applied": {
#     "min_vol": 0.2,
#     "rsi_min": 30,
#     "rsi_max": 80,
#     "dist_thr": 20,
#     "min_grade": "D",
#     "sectors": [
#       "Pharma"
#     ]
#   }
# }
 