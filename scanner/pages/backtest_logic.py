import pandas as pd
import numpy as np
import yfinance as yf
from datetime import date, timedelta
from .scanner_page  import fetch ,  analyze_full_scan
from scanner.data.fundamentals import get_summary
from scanner.data.indicators import get_indicator_summary_for_backtest
import pandas as pd
import yfinance as yf
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import matplotlib.pyplot as plt

from datetime import datetime

import time

from scanner.data.nse_symbols              import CATEGORIES, get_symbols, INDEX_SYMBOLS, INDEX_GROUPS, FO_INDICES, get_index_yf_symbol, get_index_nse_symbol, search_symbols
from scanner.patterns.dow_theory               import full_dow_analysis
from scanner.data.indicators               import add_all_indicators, get_indicator_summary , get_indicator_summary_for_backtest
from scanner.patterns.patterns                 import get_pattern_summary
from scanner.patterns.reversal_patterns        import get_reversal_summary
from scanner.patterns.continuation_patterns    import get_continuation_summary
from scanner.patterns.candlesticks_oscillators import get_candle_oscillator_summary


from scanner.strategy.entry_engine              import get_full_entry_analysis
from scanner.strategy.backtest                 import ( run_full_backtest,
                                        grade_signal, build_grade_comparison,
                                        compute_score)

from scanner.data.fundamentals              import get_fundamentals , get_summary


import numpy as _np_algo  # for algo signals

# Model-win threshold: a "model win" means the signal correctly called
# upward momentum (price rallied at least this % above entry at some point
# during the hold), independent of whether the SL/target trade plan itself won.
MODEL_WIN_MFE_PCT: float = 3.0

import redis
import json
redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)


def run_backtest(
    # symbol : str = "BEL"
    filters:dict = {
        "symbol": "SUNPHARMA",
        "years_back": 4,
        "sl_atr_mult": 2.0,
        "t1_atr_mult": 3.0,
        "t2_atr_mult": 6.0,
        "max_hold_days": 30,
        "min_score": 10,
        "min_grade": "C",
    } ,
) -> dict:
    
    backtest_cache = redis_client.get("backtest_cache")
    if backtest_cache:
        print("Using cache data of backtest")
        return json.loads(backtest_cache)
    else:
        print("Currently no backtest data in cache")

    symbol = filters.get('symbol', 'UNKNOWN').upper()
    years_back = int(filters.get('years_back', 5))

    # Exit criteria parameters - Safe, clean fallback assignments
    sl_atr_mult   = float(filters.get('sl_atr_mult', 2.0))
    t1_atr_mult   = float(filters.get('t1_atr_mult', 3.0))
    t2_atr_mult   = float(filters.get('t2_atr_mult', 6.0))
    max_hold_days = int(filters.get('max_hold_days', 30))
    min_score     = int(filters.get('min_score', 10))
    min_grade     = str(filters.get('min_grade', "C"))

    grade_rank = { "A": 1, "B": 2, "C": 3, "D": 4}
    min_rank = grade_rank.get(min_grade , 3)

    # Fetch :
    period = f"{years_back + 1}y"
    df_full = fetch(symbol, period=period)
    if df_full is None or len(df_full) < 200:
        return {"error": f"Not enough data for {symbol}", "trades": []}

    if df_full.index.tz is not None:
        df_full.index = df_full.index.tz_localize(None)

    try:
        fund_data   = get_summary(symbol)
        ratios      = fund_data.get("key_ratios", {})
        fundamentals = {
            "pe":             ratios.get("pe_ratio"),
            "pb":             ratios.get("pb_ratio"),
            "roe":            ratios.get("roe"),
            "profit_margin":  ratios.get("profit_margin"),
            "debt_equity":    ratios.get("debt_to_equity"),
            "eps":            ratios.get("eps_ttm"),
            "market_cap":     ratios.get("market_cap"),
            "dividend_yield": ratios.get("dividend_yield"),
        }
    except Exception:
        fundamentals = {}


    # Precompute raw arrrays
    closes= df_full["Close"].values
    highs= df_full["High"].values
    lows = df_full["Low"].values
    n = len(df_full)

    today = date.today()
    scan_start = today - timedelta(days=years_back * 365)
    ts_start = pd.Timestamp(scan_start)
    backtest_years = list(range(scan_start.year, today.year + 1))
    
    scan_indices = [
        i for i, ts in enumerate(df_full.index)
        if ts >= ts_start and i >= 250   # 250 bar warmup for MA200 + patterns
    ]

    scan_indices = scan_indices[::max_hold_days]  # Scan every 20 bars to reduce runtime (approx. monthly)
    if not scan_indices:
        return {"error": "No bars in scan window", "trades": []}

    # Scan loop
    trades= []
    last_trade_i= -20
    ind, indicator_df = get_indicator_summary_for_backtest(df_full)
    if indicator_df is None or len(indicator_df) < 200:
        return {"error": "Indicator computation failed", "trades": []}

    closes = indicator_df["Close"].values
    highs  = indicator_df["High"].values
    lows   = indicator_df["Low"].values

    # ── Inside the loop — just read the row 
    for i in scan_indices:
        if i - last_trade_i < 5:
            continue

        # Slice already-computed df up to bar i for pattern/score functions
        df_slice = indicator_df.iloc[:i + 1]

        # Read pre-computed indicator values directly — no recomputation
        row     = indicator_df.iloc[i]
        atr_val = row.get("ATR")
        atr_val = float(atr_val) if pd.notna(atr_val) else float(closes[i]) * 0.02

        # Score using the slice (patterns need history, but indicators already computed)
        dow      = full_dow_analysis(df_slice)
        pat      = get_pattern_summary(df_slice)
        reversal = get_reversal_summary(df_slice)
        cont     = get_continuation_summary(df_slice)
        candles  = get_candle_oscillator_summary(df_slice)

        lat      = df_slice.iloc[-1]
        vr_raw   = lat.get("Vol_ratio", 0.0)
        vr       = float(vr_raw) if pd.notna(vr_raw) else 0.0
        rsi_val  = row.get("RSI")
        rsi      = float(rsi_val) if pd.notna(rsi_val) else 0.0
        w52      = indicator_df["High"].iloc[max(0, i-252):i].max()
        dist_52w = ((closes[i] - w52) / w52 * 100) if w52 > 0 else 0.0

        score, strength, grade, gc = compute_score(
            ind, dow, pat, cont, candles, reversal, dist_52w, vr)

        if score < min_score:
            continue
        if grade_rank.get(grade, 4) > min_rank:
            continue
        
        # require_pattern = filters.get('require_pattern')  # e.g. "double_top" 
        # if require_pattern and not reversal.get(require_pattern):
        #     continue
        entry= float(closes[i])


        sl_init= round(entry - sl_atr_mult * atr_val, 2)
        # swing low protection (O'Neil: no wider than 8%)
        swing_low= float(lows[max(0, i-10):i].min()) * 0.995
        sl_init= max(sl_init, swing_low)
        sl_init= min(sl_init, entry * 0.985)   # no tighter than 1.5%
        sl_init= max(sl_init, entry * 0.92)    # no wider than 8%

        risk= max(entry - sl_init, entry * 0.005)
        t1= round(entry + t1_atr_mult * risk, 2)
        t2 = round(entry + t2_atr_mult * risk, 2)
        entry_date = df_full.index[i]
        end_i = min(i + max_hold_days, n - 1)


        sl            = sl_init
        outcome       = "TIMEOUT"
        exit_price    = float(closes[end_i])
        held          = end_i - i
        t1_hit        = False
        max_high      = entry
        min_low       = entry

        for j in range(i + 1, end_i + 1):
            lo = float(lows[j])
            hi = float(highs[j])
            days_held = j - i

            if hi > max_high: max_high = hi
            if lo < min_low:  min_low  = lo

            # SL check
            if lo <= sl:
                outcome    = "SL_HIT"
                exit_price = sl
                held       = days_held
                break

            # T2 check
            if hi >= t2:
                outcome    = "T2_HIT"
                exit_price = t2
                held       = days_held
                t1_hit     = True
                break

            # T1 check
            if hi >= t1 and not t1_hit:
                t1_hit  = True
                outcome = "T1_HIT"
                # keep scanning for T2

        # Timeout with T1 touched → preserve T1
        if outcome == "TIMEOUT" and t1_hit:
            outcome    = "T1_HIT"
            exit_price = t1

        # Partial rally (directionally correct but no exit triggered)
        mfe_pct_running = (max_high - entry) / entry * 100
        if outcome == "TIMEOUT" and mfe_pct_running >= 3.0:
            outcome = "PARTIAL_RALLY"

        # ── Record trade
        ret_pct  = round((exit_price - entry) / entry * 100, 2)
        mfe_pct  = round((max_high - entry)   / entry * 100, 2)
        mae_pct  = round((min_low  - entry)   / entry * 100, 2)
        risk_pct = round((entry - sl_init)    / entry * 100, 2)

    
        trade_win = outcome in ("T1_HIT", "T2_HIT") or (outcome == "PARTIAL_RALLY" and ret_pct > 0)

        model_win = mfe_pct >= MODEL_WIN_MFE_PCT

        trades.append({
            "date":         str(entry_date)[:10],
            
            "year":         str(entry_date)[:4],
            "entry":        round(entry, 2),
            "exit":         round(exit_price, 2),
            "sl":           sl_init,
            "t1":           t1,
            "t2":           t2,
            "outcome":      outcome,
            "return_pct":   ret_pct,
            "held_days":    held,
            "score":        score,
            "grade":        grade,
            "mfe_pct":      mfe_pct,  
            "mae_pct":      mae_pct,   
            "risk_pct":     risk_pct,
            "trade_win":    trade_win,
            "model_win":    model_win,
            "rsi":          rsi,
            "vol_ratio":    vr,
            "dist_52w":     round(dist_52w, 2),
            "dow_signal":   dow.get("signal"),
            "strength":     strength,
        })

        last_trade_i = i

    if not trades:
        return {"error": "No signals generated", "trades": [], "fundamentals": fundamentals}

    # ── Step 5: Compute stats ─────────────────────────────────────────────
    symbol = symbol.replace(".NS","").replace(".BO","")
    stats = _compute_stats(trades , backtest_years , symbol , years_back)
   

    return stats



def _compute_stats(trades: list , backtest_years , symbol , years_back) -> dict:
    if not trades:
        return {}

    n        = len(trades)
    rets     = [t["return_pct"] for t in trades]
    wins     = [t for t in trades if t["trade_win"]]
    losses   = [t for t in trades if not t["trade_win"]]
    win_rets = [t["return_pct"] for t in wins]
    los_rets = [t["return_pct"] for t in losses]

    avg_win  = round(sum(win_rets) / len(win_rets), 2) if win_rets else 0
    avg_loss = round(sum(los_rets) / len(los_rets), 2) if los_rets else 0
    pf       = round(abs(sum(win_rets) / sum(los_rets)), 2) if los_rets and sum(los_rets) != 0 else 999.0
    win_p    = len(wins) / n
    loss_p   = len(losses) / n
    ev       = round(win_p * avg_win + loss_p * avg_loss, 2)
    avg_hold = round(sum(t["held_days"] for t in trades) / n, 1)

    # model_win stats (signal-quality view, separate from trade-plan view)
    model_wins  = sum(1 for t in trades if t["model_win"])
    model_win_p = round(model_wins / n * 100, 1)

    # Sharpe (annualised, trade-level)
    ret_arr  = np.array(rets)
    sharpe   = round((ret_arr.mean() / ret_arr.std()) *
               np.sqrt(252 / avg_hold if avg_hold > 0 else 1), 2) if len(rets) > 1 and ret_arr.std() > 0 else 0

    # Equity curve + max drawdown
    eq = 100.0; equity = [100.0]; peak = 100.0; max_dd = 0.0
    for t in sorted(trades, key=lambda x: x["date"]):
        eq *= (1 + t["return_pct"] / 100)
        equity.append(round(eq, 2))
        if eq > peak: peak = eq
        dd = (peak - eq) / peak * 100
        if dd > max_dd: max_dd = dd

    # Outcome counts
    outcomes = {}
    for t in trades:
        outcomes[t["outcome"]] = outcomes.get(t["outcome"], 0) + 1

    # By grade breakdown 
    by_grade = {}
    for g in ["A+", "A", "B", "C", "D"]:
        g_trades = [t for t in trades if t["grade"] == g]
        if not g_trades:
            continue
        gn   = len(g_trades)
        gw   = sum(1 for t in g_trades if t["trade_win"])
        grets= [t["return_pct"] for t in g_trades]
        by_grade[g] = {
            "total":      gn,
            "win_rate":   round(gw / gn * 100, 1),
            "model_win_rate": round(sum(1 for t in g_trades if t["model_win"]) / gn * 100, 1),
            "avg_return": round(sum(grets) / gn, 2),
            "avg_mfe":    round(sum(t["mfe_pct"] for t in g_trades) / gn, 2),
            "avg_mae":    round(sum(t["mae_pct"] for t in g_trades) / gn, 2),
            "t1_rate":    round(sum(1 for t in g_trades if t["outcome"] == "T1_HIT") / gn * 100, 1),
            "t2_rate":    round(sum(1 for t in g_trades if t["outcome"] == "T2_HIT") / gn * 100, 1),
            "sl_rate":    round(sum(1 for t in g_trades if t["outcome"] == "SL_HIT") / gn * 100, 1),
        }

    #  By score band breakdown
    by_score = {}
    bands    = [(5,9,"5-9"),(10,14,"10-14"),(15,19,"15-19"),(20,24,"20-24"),(25,30,"25-30")]
    for lo, hi, label in bands:
        b_trades = [t for t in trades if lo <= t["score"] <= hi]
        if not b_trades:
            continue
        bn   = len(b_trades)
        bw   = sum(1 for t in b_trades if t["trade_win"])
        brets= [t["return_pct"] for t in b_trades]
        by_score[label] = {
            "total":      bn,
            "win_rate":   round(bw / bn * 100, 1),
            "model_win_rate": round(sum(1 for t in b_trades if t["model_win"]) / bn * 100, 1),
            "avg_return": round(sum(brets) / bn, 2),
        }

    summary =  {
        "total_trades":    n,
        "symbol" : symbol,
        "win_rate":        round(win_p * 100, 1),
        "model_win_rate":  model_win_p,
        "avg_return":      round(sum(rets) / n, 2),
        "avg_win":         avg_win,
        "avg_loss":        avg_loss,
        "profit_factor":   pf,
        "expectancy":      ev,
        "sharpe":          sharpe,
        "max_drawdown":    round(max_dd, 2),
        "avg_hold":        avg_hold,
        "total_return":    round(sum(rets), 1),
        "t1_rate":         round(outcomes.get("T1_HIT",        0) / n * 100, 1),
        "t2_rate":         round(outcomes.get("T2_HIT",        0) / n * 100, 1),
        "sl_rate":         round(outcomes.get("SL_HIT",        0) / n * 100, 1),
        "partial_rally":   round(outcomes.get("PARTIAL_RALLY", 0) / n * 100, 1),
        "outcomes":        outcomes,
        "by_grade":        by_grade,
        "by_score_band":   by_score,
        "backtest_years" : backtest_years,
        "years_back" : years_back,
        "trades":          trades,
    }
    
    try:
        print("setting cache  backtest ")
        redis_client.setex("backtest_cache" , 7200 , json.dumps(summary))
        
    except Exception as e:
        print("Something wrong in backtest_cache" , e)
        
    
    return summary