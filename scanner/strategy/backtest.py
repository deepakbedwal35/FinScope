

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta, date
import ta



# ─────────────────────────────────────────────────────────────────────────────
# NIFTY CACHE  (inspiration: backtest_runner.py build_nifty_cache)
# Fetch Nifty 50 once → pre-compute MA50 + 3-month return for every bar
# so quality_filter() can look up by date in O(1) without extra yf calls
# ─────────────────────────────────────────────────────────────────────────────

_NIFTY_CACHE: dict = {}   # date → {close, ma50, above_ma50, ret_3m_pct}
_NIFTY_LOADED: bool = False
RS_LOOKBACK = 63           # ≈ 3 months trading days


def _load_nifty_cache(period: str = "3y"):
    """
    Download Nifty 50 once per session and populate _NIFTY_CACHE.
    Called lazily on first quality_filter() invocation.
    Silent — never crashes the backtest if Nifty data unavailable.
    """
    global _NIFTY_CACHE, _NIFTY_LOADED
    if _NIFTY_LOADED:
        return
    _NIFTY_LOADED = True
    try:
        df = yf.Ticker("^NSEI").history(period=period, auto_adjust=True)
        if df is None or df.empty or len(df) < 50:
            return
        if df.index.tz is not None:
            df.index = df.index.tz_convert("UTC").tz_localize(None)
        close  = df["Close"]
        ma50   = close.rolling(50, min_periods=20).mean()
        ret3m  = close.pct_change(RS_LOOKBACK) * 100
        for idx in df.index:
            d = idx.date() if hasattr(idx, "date") else idx
            c = float(close.loc[idx])
            m = float(ma50.loc[idx]) if not pd.isna(ma50.loc[idx]) else c
            r = float(ret3m.loc[idx]) if not pd.isna(ret3m.loc[idx]) else 0.0
            _NIFTY_CACHE[d] = {
                "close":       c,
                "ma50":        m,
                "above_ma50":  c > m,
                "ret_3m_pct":  round(r, 2),
            }
    except Exception:
        pass   # Nifty unavailable → F5/F7 silently disabled


def _nifty_on(bar_date) -> dict:
    """Return Nifty stats for date, walking back up to 10 days for holidays."""
    if not _NIFTY_CACHE:
        return {"close": 0, "ma50": 0, "above_ma50": True, "ret_3m_pct": 0.0}
    if hasattr(bar_date, "date"):
        bar_date = bar_date.date()
    elif isinstance(bar_date, str):
        bar_date = date.fromisoformat(bar_date)
    for delta in range(10):
        d = bar_date - timedelta(days=delta)
        if d in _NIFTY_CACHE:
            return _NIFTY_CACHE[d]
    return list(_NIFTY_CACHE.values())[-1]


# ─────────────────────────────────────────────────────────────────────────────
# INDICATORS
# ─────────────────────────────────────────────────────────────────────────────

def _add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Add all indicators used by signals + quality filters."""
    try:
        df = df.copy()
        df["MA20"]     = df["Close"].rolling(20).mean()
        df["MA50"]     = df["Close"].rolling(50).mean()
        df["MA200"]    = df["Close"].rolling(200).mean()
        df["Vol_MA20"] = df["Volume"].rolling(20).mean()
        df["Vol_ratio"]= (df["Volume"] / df["Vol_MA20"].replace(0, np.nan)).round(2)

        # ATR
        df["ATR"] = ta.volatility.AverageTrueRange(
            df["High"], df["Low"], df["Close"], 14).average_true_range()

        # RSI + MACD + BB + Stochastic
        df["RSI"]      = ta.momentum.RSIIndicator(df["Close"], 14).rsi()
        macd           = ta.trend.MACD(df["Close"])
        df["MACD"]     = macd.macd()
        df["MACD_sig"] = macd.macd_signal()
        df["MACD_hist"]= macd.macd_diff()
        bb             = ta.volatility.BollingerBands(df["Close"], 20, 2)
        df["BB_upper"] = bb.bollinger_hband()
        df["BB_lower"] = bb.bollinger_lband()
        df["BB_pct"]   = bb.bollinger_pband()
        stoch          = ta.momentum.StochasticOscillator(
                             df["High"], df["Low"], df["Close"], 14, 3)
        df["Stoch_K"]  = stoch.stoch()
        df["Stoch_D"]  = stoch.stoch_signal()

        # ── Quality filter helpers ──────────────────────────────────────
        # F1: Weekly uptrend (weekly close > 10-week MA)
        try:
            wc   = df["Close"].resample("W").last().dropna()
            wma  = wc.rolling(10, min_periods=5).mean()
            wt   = (wc > wma).rename("_wt")
            dt   = wt.reindex(df.index, method="ffill")
            df["weekly_uptrend"] = dt.astype("boolean").fillna(False).astype(bool)
        except Exception:
            df["weekly_uptrend"] = False

        # F4: ATR expanding vs 5 bars ago
        df["ATR_prev5"]     = df["ATR"].shift(5)
        df["ATR_expanding"] = df["ATR"] > df["ATR_prev5"]

        # F3/F6: 52W distance + MA50 extension
        df["w52_high"]       = df["High"].rolling(252, min_periods=50).max()
        df["dist_52w_pct"]   = (df["Close"] - df["w52_high"]) / df["w52_high"] * 100
        df["dist_ma50_pct"]  = ((df["Close"] - df["MA50"]) / df["MA50"].replace(0, np.nan) * 100)

    except Exception:
        pass
    return df


# ─────────────────────────────────────────────────────────────────────────────
# QUALITY FILTER — 7 gates  (inspiration: backtest_runner.py quality_filter)
# ─────────────────────────────────────────────────────────────────────────────

# Filter config — can be overridden by the UI sliders
QF_CONFIG = {
    "weekly_uptrend":  True,    # F1
    "min_vol_ratio":   1.3,     # F2  (0 = off)
    "max_dist_52w":   -8.0,     # F3  (0 = off)
    "atr_expanding":   True,    # F4
    "rs_vs_nifty":     True,    # F5
    "max_dist_ma50":   6.0,     # F6  (0 = off)
    "market_regime":   True,    # F7
}


def quality_filter(df: pd.DataFrame, cfg: dict = None) -> tuple:
    """
    Run all 7 quality filters on the latest bar.
    Returns (passed: bool, reasons: str).

    F1  Weekly Uptrend    — weekly close > 10-week MA
    F2  Volume ≥ 1.3x     — Coulling volume confirmation
    F3  Within 8% of 52W  — no deep-pullback traps (O'Neil)
    F4  ATR Expanding     — volatility building = trend strength
    F5  RS > Nifty        — stock 3M return beats Nifty (O'Neil)
    F6  Not extended      — price not >6% above MA50 (late-stage filter)
    F7  Market regime     — Nifty above its own 50 DMA
    """
    c    = cfg or QF_CONFIG
    _load_nifty_cache()
    fails = []

    try:
        # F1
        if c.get("weekly_uptrend", True):
            if not bool(df["weekly_uptrend"].iloc[-1]):
                fails.append("F1:WeeklyDowntrend")

        # F2
        mvr = c.get("min_vol_ratio", 1.3)
        if mvr > 0:
            vr = float(df["Vol_ratio"].iloc[-1])
            if pd.isna(vr) or vr < mvr:
                fails.append(f"F2:Vol={round(vr,2) if not pd.isna(vr) else 'NaN'}<{mvr}")

        # F3
        md52 = c.get("max_dist_52w", -8.0)
        if md52 < 0:
            d52 = float(df["dist_52w_pct"].iloc[-1])
            if pd.isna(d52) or d52 < md52:
                fails.append(f"F3:Dist52W={round(d52,1) if not pd.isna(d52) else 'NaN'}%<{md52}%")

        # F4
        if c.get("atr_expanding", True):
            if not bool(df["ATR_expanding"].iloc[-1]):
                an = round(float(df["ATR"].iloc[-1]), 2)
                ap = round(float(df["ATR_prev5"].iloc[-1]), 2)
                fails.append(f"F4:ATR_flat({an}≤{ap})")

        # F5  (only if Nifty cache available)
        if c.get("rs_vs_nifty", True) and _NIFTY_CACHE:
            lb = RS_LOOKBACK
            cls = df["Close"]
            if len(cls) >= lb + 1:
                stock_ret = (float(cls.iloc[-1]) - float(cls.iloc[-lb])) / float(cls.iloc[-lb]) * 100
                nifty     = _nifty_on(df.index[-1])
                nifty_ret = nifty["ret_3m_pct"]
                if stock_ret <= nifty_ret:
                    fails.append(f"F5:RS_WEAK(stk={round(stock_ret,1)}%≤nifty={round(nifty_ret,1)}%)")

        # F6
        mdm50 = c.get("max_dist_ma50", 6.0)
        if mdm50 > 0:
            dm50 = float(df["dist_ma50_pct"].iloc[-1])
            if not pd.isna(dm50) and dm50 > mdm50:
                fails.append(f"F6:Extended(+{round(dm50,1)}%>MA50,max={mdm50}%)")

        # F7  (only if Nifty cache available)
        if c.get("market_regime", True) and _NIFTY_CACHE:
            nifty = _nifty_on(df.index[-1])
            if not nifty["above_ma50"]:
                fails.append(f"F7:BearMkt(Nifty={round(nifty['close'],0)}<MA50={round(nifty['ma50'],0)})")

    except Exception as e:
        fails.append(f"QF_ERR:{e}")

    passed = len(fails) == 0
    return passed, ("ALL_PASS" if passed else "|".join(fails))


# ─────────────────────────────────────────────────────────────────────────────
# SIGNALS  (unchanged from v1 — all 11 signals preserved)
# ─────────────────────────────────────────────────────────────────────────────

def sig_breakout_52w(df):
    try:
        if len(df) < 60: return False
        p   = df["Close"].iloc[-1]
        w52 = df["High"].rolling(252, min_periods=50).max().iloc[-2]
        vr  = df["Vol_ratio"].iloc[-1]
        rsi = df["RSI"].iloc[-1]
        dist = (p - w52) / w52 * 100
        return (dist >= -5.0 and vr >= 1.5 and 50 <= rsi <= 75 and
                p > df["MA200"].iloc[-1] and not pd.isna(rsi))
    except: return False


def sig_pullback_in_uptrend(df):
    try:
        if len(df) < 210: return False
        p   = df["Close"].iloc[-1]
        w52 = df["High"].rolling(252, min_periods=50).max().iloc[-1]
        dist = (p - w52) / w52 * 100
        ma200_slope = df["MA200"].iloc[-1] - df["MA200"].iloc[-20]
        vr  = df["Vol_ratio"].iloc[-1]
        rsi = df["RSI"].iloc[-1]
        return (-25.0 <= dist <= -10.0 and ma200_slope > 0 and
                p > df["MA200"].iloc[-1] and p > df["MA50"].iloc[-1] and
                df["Close"].iloc[-1] > df["Close"].iloc[-2] and
                vr >= 1.2 and 40 <= rsi <= 70 and
                not pd.isna(rsi) and not pd.isna(ma200_slope))
    except: return False


def sig_macd_bullish_cross(df):
    try:
        if len(df) < 35: return False
        prev = df["MACD"].iloc[-2] - df["MACD_sig"].iloc[-2]
        curr = df["MACD"].iloc[-1] - df["MACD_sig"].iloc[-1]
        return (prev < 0 and curr >= 0 and
                df["Close"].iloc[-1] > df["MA200"].iloc[-1] and
                not pd.isna(prev) and not pd.isna(curr))
    except: return False


def sig_rsi_oversold_bounce(df):
    try:
        if len(df) < 20: return False
        prev_rsi = df["RSI"].iloc[-4:-1].min()
        curr_rsi = df["RSI"].iloc[-1]
        return (prev_rsi < 35 and curr_rsi > 40 and
                df["Close"].iloc[-1] > df["MA50"].iloc[-1] and
                not pd.isna(prev_rsi) and not pd.isna(curr_rsi))
    except: return False


def sig_golden_cross(df):
    try:
        if len(df) < 210: return False
        prev = df["MA50"].iloc[-2] - df["MA200"].iloc[-2]
        curr = df["MA50"].iloc[-1] - df["MA200"].iloc[-1]
        return (prev < 0 and curr >= 0 and
                not pd.isna(prev) and not pd.isna(curr))
    except: return False


def sig_bb_squeeze_breakout(df):
    try:
        if len(df) < 25: return False
        widths     = ((df["BB_upper"] - df["BB_lower"]) / df["MA20"]).iloc[-6:-1]
        prev_width = widths.rolling(120, min_periods=20).quantile(0.2).iloc[-1]
        was_squeeze = (widths < prev_width).any()
        curr_pct    = df["BB_pct"].iloc[-1]
        return (was_squeeze and curr_pct > 0.85 and not pd.isna(curr_pct))
    except: return False


def sig_stoch_oversold_cross(df):
    try:
        if len(df) < 20: return False
        kp = df["Stoch_K"].iloc[-2]; dp = df["Stoch_D"].iloc[-2]
        kc = df["Stoch_K"].iloc[-1]; dc = df["Stoch_D"].iloc[-1]
        return (kp < dp and kc >= dc and kp < 25 and
                df["Close"].iloc[-1] > df["MA200"].iloc[-1] and
                not pd.isna(kp) and not pd.isna(dp))
    except: return False


def sig_ma20_above_ma50_cross(df):
    try:
        if len(df) < 55: return False
        prev = df["MA20"].iloc[-2] - df["MA50"].iloc[-2]
        curr = df["MA20"].iloc[-1] - df["MA50"].iloc[-1]
        return (prev < 0 and curr >= 0 and
                df["Close"].iloc[-1] > df["MA200"].iloc[-1] and
                not pd.isna(prev) and not pd.isna(curr))
    except: return False


def sig_volume_breakout(df):
    try:
        if len(df) < 22: return False
        chg = (df["Close"].iloc[-1] - df["Close"].iloc[-2]) / df["Close"].iloc[-2] * 100
        vr  = df["Vol_ratio"].iloc[-1]
        return (chg > 2.0 and vr > 3.0 and
                df["Close"].iloc[-1] > df["MA200"].iloc[-1] and not pd.isna(vr))
    except: return False


def sig_pullback_to_ma50(df):
    try:
        if len(df) < 55: return False
        p     = df["Close"].iloc[-1]
        ma50  = df["MA50"].iloc[-1]
        ma200 = df["MA200"].iloc[-1]
        near  = abs(df["Low"].iloc[-3:-1].min() - ma50) / ma50 < 0.015
        return (near and p > df["Close"].iloc[-3] and p > ma200 and p > ma50 and
                df["Vol_ratio"].iloc[-1] >= 0.8 and
                not pd.isna(ma50) and not pd.isna(ma200))
    except: return False


def sig_dow_primary_up_minor_dip(df):
    try:
        if len(df) < 210: return False
        ma200_slope = df["MA200"].iloc[-1] - df["MA200"].iloc[-20]
        above_200   = df["Close"].iloc[-1] > df["MA200"].iloc[-1]
        recovering  = (df["Close"].iloc[-1] > df["Close"].iloc[-2] >
                       df["Close"].iloc[-3])
        return (ma200_slope > 0 and above_200 and recovering and
                not pd.isna(ma200_slope))
    except: return False


# ── Signal registry (11 signals — unchanged) ──────────────────────────────────

SIGNALS = {
    "52W Breakout":          sig_breakout_52w,
    "MACD Bullish Cross":    sig_macd_bullish_cross,
    "RSI Oversold Bounce":   sig_rsi_oversold_bounce,
    "Golden Cross":          sig_golden_cross,
    "BB Squeeze Breakout":   sig_bb_squeeze_breakout,
    "Stoch Oversold Cross":  sig_stoch_oversold_cross,
    "MA20 > MA50 Cross":     sig_ma20_above_ma50_cross,
    "Volume Breakout":       sig_volume_breakout,
    "Pullback to MA50":      sig_pullback_to_ma50,
    "Dow Primary+Minor Dip": sig_dow_primary_up_minor_dip,
    "Pullback in Uptrend":   sig_pullback_in_uptrend,
}


# ─────────────────────────────────────────────────────────────────────────────
# BACKTEST CORE  (upgraded with quality filter gate + T1 fix)
# ─────────────────────────────────────────────────────────────────────────────

def backtest_signal(df_full: pd.DataFrame, signal_fn,
                    sl_atr_mult: float = 1.5,
                    t1_atr_mult: float = 2.0,
                    t2_atr_mult: float = 3.5,
                    max_hold_days: int = 30,
                    min_bars: int = 60,
                    use_quality_filter: bool = True,
                    qf_cfg: dict = None) -> dict:
    """
    Bar-by-bar historical backtest with optional 7-filter quality gate.

    Key improvements over v1:
    • Quality filter: each signal bar passes through 7-filter gate before
      recording a trade — dramatically reduces false signals
    • T1 fix: if T1 is touched mid-scan, preserve TARGET_1 at timeout
      instead of incorrectly marking TIMEOUT
    • Deduplication: skip bars within 5 bars of the last accepted trade
    """
    trades = []
    n = len(df_full)
    i = min_bars

    while i < n - max_hold_days - 1:
        df_slice = df_full.iloc[:i + 1].copy()

        # Signal check
        if not signal_fn(df_slice):
            i += 1
            continue

        # Quality gate (all 7 filters)
        if use_quality_filter:
            qf_ok, qf_reason = quality_filter(df_slice, qf_cfg)
            if not qf_ok:
                i += 1
                continue

        # Entry
        entry_price = float(df_full["Close"].iloc[i])
        atr = float(df_full["ATR"].iloc[i])
        if pd.isna(atr) or atr <= 0:
            atr = entry_price * 0.02

        # SL: ATR-based + swing low protection (O'Neil: max 8% hard stop)
        sl_atr_val  = entry_price - sl_atr_mult * atr
        swing_low   = float(df_full["Low"].iloc[max(0,i-10):i].min()) * 0.995
        sl          = max(sl_atr_val, swing_low)
        sl          = min(sl, entry_price * 0.985)   # no tighter than 1.5%
        sl          = max(sl, entry_price * 0.92)    # no wider than 8%

        risk = max(entry_price - sl, entry_price * 0.005)
        t1   = round(entry_price + t1_atr_mult * risk, 2)
        t2   = round(entry_price + t2_atr_mult * risk, 2)

        entry_date   = df_full.index[i]
        outcome      = "TIMEOUT"
        exit_price   = float(df_full["Close"].iloc[min(i + max_hold_days, n-1)])
        exit_date    = df_full.index[min(i + max_hold_days, n-1)]
        holding_days = max_hold_days
        t1_touched   = False
        vr           = float(df_full["Vol_ratio"].iloc[i]) if "Vol_ratio" in df_full.columns else 1.0

        max_price_before_exit = float(df_full["Close"].iloc[i])  # track high watermark

        for j in range(i + 1, min(i + max_hold_days + 1, n)):
            bar_low  = float(df_full["Low"].iloc[j])
            bar_high = float(df_full["High"].iloc[j])
            max_price_before_exit = max(max_price_before_exit, bar_high)

            # SL checked before targets on same bar
            if bar_low <= sl:
                outcome      = "STOP_LOSS"
                exit_price   = sl
                exit_date    = df_full.index[j]
                holding_days = j - i
                break
            if bar_high >= t2:
                outcome      = "TARGET_2"
                exit_price   = t2
                exit_date    = df_full.index[j]
                holding_days = j - i
                t1_touched   = True
                break
            if bar_high >= t1 and not t1_touched:
                t1_touched = True
                outcome    = "TARGET_1"   # mark, keep scanning for T2

        # T1 fix: timeout after T1 was touched → preserve TARGET_1
        if outcome in ("TIMEOUT",) and t1_touched:
            outcome = "TARGET_1"

        ret_pct = round((exit_price - entry_price) / entry_price * 100, 2)

        # ── PARTIAL RALLY: stock rose 3-5% without hitting T1 — model was directionally correct
        # Shown as amber/yellow (not red loss) in histograms and journal
        if outcome == "TIMEOUT" and 3.0 <= ret_pct < (t1 / entry_price - 1) * 100:
            outcome = "PARTIAL_RALLY"

        # Max return reached before exit (used for pre-SL rally filter)
        max_ret_pct = round((max_price_before_exit - entry_price) / entry_price * 100, 2)

        trades.append({
            "entry_date":   entry_date,
            "exit_date":    exit_date,
            "entry_price":  round(entry_price, 2),
            "exit_price":   round(exit_price, 2),
            "sl":           round(sl, 2),
            "t1":           round(t1, 2),
            "t2":           round(t2, 2),
            "outcome":      outcome,
            "return_pct":   ret_pct,
            "max_ret_pct":  max_ret_pct,
            "holding_days": holding_days,
            "atr":          round(atr, 2),
            "vol_ratio":    round(vr, 2),
            "t1_hit":       t1_touched,
            "t2_hit":       outcome == "TARGET_2",
        })

        # Skip forward — deduplication
        i += max(holding_days, 5)

    return _compute_stats(trades)


# ─────────────────────────────────────────────────────────────────────────────
# STATS COMPUTATION  (unchanged — preserved exactly for UI compatibility)
# ─────────────────────────────────────────────────────────────────────────────

def _compute_stats(trades: list) -> dict:
    if not trades:
        return {
            "trades": [], "n_trades": 0, "win_rate": 0,
            "avg_return": 0, "max_win": 0, "max_loss": 0,
            "profit_factor": 0, "expectancy": 0, "sharpe": 0,
            "avg_holding": 0, "total_return": 0, "max_drawdown": 0,
            "equity_curve": pd.Series(dtype=float),
            "monthly_returns": pd.Series(dtype=float),
            "t1_rate": 0, "t2_rate": 0, "sl_rate": 0,
        }

    df      = pd.DataFrame(trades)
    returns = df["return_pct"].values
    wins    = df[df["return_pct"] > 0]
    losses  = df[df["return_pct"] <= 0]

    win_rate      = len(wins) / len(df) * 100
    avg_return    = returns.mean()
    max_win       = returns.max()
    max_loss      = returns.min()
    avg_hold      = df["holding_days"].mean()
    gross_wins    = wins["return_pct"].sum()
    gross_losses  = abs(losses["return_pct"].sum())
    profit_factor = gross_wins / gross_losses if gross_losses > 0 else float("inf")
    avg_win       = wins["return_pct"].mean()  if len(wins)   > 0 else 0
    avg_loss      = abs(losses["return_pct"].mean()) if len(losses) > 0 else 0
    win_p         = len(wins)   / len(df)
    loss_p        = len(losses) / len(df)
    expectancy    = (win_p * avg_win) - (loss_p * avg_loss)
    sharpe        = ((returns.mean() / returns.std()) *
                     np.sqrt(252 / avg_hold if avg_hold > 0 else 1)
                     if len(returns) > 1 and returns.std() > 0 else 0.0)

    df_sorted = df.sort_values("entry_date")
    equity    = (1 + df_sorted["return_pct"] / 100).cumprod() * 100
    equity.index = df_sorted["entry_date"].values

    df_sorted["month"] = pd.to_datetime(df_sorted["entry_date"]).dt.to_period("M")
    monthly = df_sorted.groupby("month")["return_pct"].sum()

    outcomes       = df["outcome"].value_counts()
    t1_rate        = outcomes.get("TARGET_1", 0) / len(df) * 100
    t2_rate        = outcomes.get("TARGET_2", 0) / len(df) * 100
    sl_rate        = outcomes.get("STOP_LOSS", 0) / len(df) * 100
    rally_rate     = outcomes.get("PARTIAL_RALLY", 0) / len(df) * 100

    # Max drawdown
    eq_arr = equity.values
    peak   = eq_arr[0]; max_dd = 0.0
    for v in eq_arr:
        if v > peak: peak = v
        dd = (peak - v) / peak * 100
        if dd > max_dd: max_dd = dd

    # High-vol vs low-vol win rate split
    if "vol_ratio" in df.columns:
        hv   = df[df["vol_ratio"] >= 2.0]
        lv   = df[df["vol_ratio"] < 1.5]
        hvwr = round(len(hv[hv["return_pct"] > 0]) / len(hv) * 100, 1) if len(hv) > 0 else 0
        lvwr = round(len(lv[lv["return_pct"] > 0]) / len(lv) * 100, 1) if len(lv) > 0 else 0
    else:
        hvwr = lvwr = 0

    return {
        "trades":          trades,
        "n_trades":        len(df),
        "win_rate":        round(win_rate, 1),
        "avg_return":      round(avg_return, 2),
        "max_win":         round(max_win, 2),
        "max_loss":        round(max_loss, 2),
        "profit_factor":   round(min(profit_factor, 999.0), 2),
        "expectancy":      round(expectancy, 2),
        "sharpe":          round(sharpe, 2),
        "avg_holding":     round(avg_hold, 1),
        "total_return":    round(returns.sum(), 2),
        "max_drawdown":    round(max_dd, 2),
        "t1_rate":         round(t1_rate, 1),
        "t2_rate":         round(t2_rate, 1),
        "sl_rate":         round(sl_rate, 1),
        "rally_rate":      round(rally_rate, 1),
        "high_vol_wr":     hvwr,
        "low_vol_wr":      lvwr,
        "equity_curve":    equity,
        "monthly_returns": monthly,
        "df_trades":       df_sorted,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GRADE BREAKDOWN  (new: per-grade T1/T2/SL hit rate table)
# ─────────────────────────────────────────────────────────────────────────────

def grade_signal(stats: dict) -> tuple:
    """Grade a signal A+/A/B/C/D/F. Returns (grade, color)."""
    if stats["n_trades"] < 5:
        return "N/A", "#aaaaaa"

    s = 0
    if   stats["win_rate"]      >= 60: s += 3
    elif stats["win_rate"]      >= 50: s += 2
    elif stats["win_rate"]      >= 40: s += 1
    if   stats["profit_factor"] >= 2.0: s += 3
    elif stats["profit_factor"] >= 1.5: s += 2
    elif stats["profit_factor"] >= 1.0: s += 1
    if   stats["expectancy"]    >= 2.0: s += 2
    elif stats["expectancy"]    >= 0.5: s += 1
    if   stats["sharpe"]        >= 1.5: s += 2
    elif stats["sharpe"]        >= 0.5: s += 1
    if   stats["max_drawdown"]  <= 10:  s += 2
    elif stats["max_drawdown"]  <= 20:  s += 1

    if   s >= 11: return "A+", "#00ff88"
    elif s >= 9:  return "A",  "#3dd68c"
    elif s >= 7:  return "B",  "#7c6af7"
    elif s >= 5:  return "C",  "#f5a623"
    elif s >= 3:  return "D",  "#f75f5f"
    else:         return "F",  "#ff3333"


def build_grade_comparison(results_by_signal: dict) -> list:
    """
    For each signal, compute per-grade breakdown:
      How many A+ signals hit T1? T2? SL? Still open?

    Returns a list of rows suitable for display in the UI
    and export to CSV.

    results_by_signal: {signal_name: stats_dict}
    """
    rows = []
    for sig_name, stats in results_by_signal.items():
        if stats["n_trades"] < 3:
            continue
        grade, gc = grade_signal(stats)

        # Outcome counts from trade list
        trades = stats.get("trades", [])
        t1_n   = sum(1 for t in trades if t["outcome"] in ("TARGET_1", "TARGET_2"))
        t2_n   = sum(1 for t in trades if t["outcome"] == "TARGET_2")
        sl_n   = sum(1 for t in trades if t["outcome"] == "STOP_LOSS")
        to_n   = sum(1 for t in trades if t["outcome"] == "TIMEOUT")
        total  = stats["n_trades"]

        # Average return when T1 hit vs SL hit
        t1_trades  = [t for t in trades if t["outcome"] in ("TARGET_1","TARGET_2")]
        sl_trades  = [t for t in trades if t["outcome"] == "STOP_LOSS"]
        avg_win_r  = round(sum(t["return_pct"] for t in t1_trades) / len(t1_trades), 2) if t1_trades else 0
        avg_loss_r = round(sum(t["return_pct"] for t in sl_trades) / len(sl_trades), 2) if sl_trades else 0

        rows.append({
            "signal":         sig_name,
            "grade":          grade,
            "grade_color":    gc,
            "n_trades":       total,
            "win_rate":       stats["win_rate"],
            "t1_hit":         t1_n,
            "t2_hit":         t2_n,
            "sl_hit":         sl_n,
            "timeout":        to_n,
            "t1_rate":        round(t1_n / total * 100, 1) if total > 0 else 0,
            "t2_rate":        round(t2_n / total * 100, 1) if total > 0 else 0,
            "sl_rate":        round(sl_n / total * 100, 1) if total > 0 else 0,
            "avg_win_pct":    avg_win_r,
            "avg_loss_pct":   avg_loss_r,
            "profit_factor":  stats["profit_factor"],
            "expectancy":     stats["expectancy"],
            "sharpe":         stats["sharpe"],
            "max_drawdown":   stats["max_drawdown"],
            "avg_holding":    stats["avg_holding"],
            "high_vol_wr":    stats.get("high_vol_wr", 0),
            "low_vol_wr":     stats.get("low_vol_wr", 0),
        })

    # Sort: A+ first, then by win rate
    grade_order = {"A+":0,"A":1,"B":2,"C":3,"D":4,"F":5,"N/A":6}
    rows.sort(key=lambda x: (grade_order.get(x["grade"],6), -x["win_rate"]))
    return rows


# ─────────────────────────────────────────────────────────────────────────────
# MULTI-SIGNAL BACKTEST  (single stock)
# ─────────────────────────────────────────────────────────────────────────────

def run_full_backtest(symbol: str,
                      selected_signals: list = None,
                      period: str = "2y",
                      sl_atr: float = 1.5,
                      t1_atr: float = 2.0,
                      t2_atr: float = 3.5,
                      max_hold: int = 30,
                      use_qf: bool = True,
                      progress_cb=None) -> dict:
    """
    Run backtest for all selected signals on one symbol.
    Returns dict: signal_name -> stats dict
    """
    if selected_signals is None:
        selected_signals = list(SIGNALS.keys())

    _load_nifty_cache()   # ensure Nifty loaded once before any filter calls

    try:
        df = yf.Ticker(symbol).history(period=period, auto_adjust=True)
        if df.empty or len(df) < 100:
            return {}
        if df.index.tz is not None:
            df.index = df.index.tz_convert("UTC").tz_localize(None)
        df = _add_indicators(df)
    except:
        return {}

    results = {}
    for idx, sig_name in enumerate(selected_signals):
        if progress_cb:
            progress_cb(idx, len(selected_signals), sig_name)
        fn = SIGNALS.get(sig_name)
        if fn is None:
            continue
        sig_stats = backtest_signal(
            df, fn,
            sl_atr_mult=sl_atr,
            t1_atr_mult=t1_atr,
            t2_atr_mult=t2_atr,
            max_hold_days=max_hold,
            use_quality_filter=use_qf,
        )
        results[sig_name] = sig_stats

        # ── HDFS archive ──────────────────────────────────────────────────
        try:
            hdfs_save_backtest({
                "n_trades":      sig_stats["n_trades"],
                "win_rate":      sig_stats["win_rate"],
                "avg_return":    sig_stats["avg_return"],
                "profit_factor": sig_stats["profit_factor"],
                "expectancy":    sig_stats["expectancy"],
                "sharpe":        sig_stats["sharpe"],
                "max_drawdown":  sig_stats["max_drawdown"],
            }, symbol=symbol, signal=sig_name)
        except Exception:
            pass   # never crash the backtest for storage errors

    return results



# ─────────────────────────────────────────────────────────────────────────────
# UNIFIED SCORE FUNCTION  — used by scanner, search AND time machine
# All three show the SAME score for the same stock on the same day
# ─────────────────────────────────────────────────────────────────────────────

def compute_score(ind: dict, dow: dict, pat: dict,
                  cont: dict, candles: dict, reversal: dict,
                  dist_52w: float, vol_ratio: float) -> tuple:
    """
    Single shared composite scoring function (max ~30 points).
    Returns (score: int, strength: str, grade: str, grade_color: str)

    SAME logic used by:
      • analyze() in scanner
      • stock search block
      • time machine backtest
    → Eliminates score inconsistency between panels.
    """
    score = 0

    # 52W distance tiered scoring
    if   dist_52w >= -1.0:  score += 4
    elif dist_52w >= -5.0:  score += 3
    elif dist_52w >= -10.0: score += 2
    elif dist_52w >= -20.0: score += 1

    # Volume
    if   vol_ratio >= 3.0:  score += 3
    elif vol_ratio >= 2.0:  score += 2
    elif vol_ratio >= 1.5:  score += 1

    # RSI
    rsi = ind["rsi"]["value"] or 0
    if   55 <= rsi <= 72: score += 2
    elif 50 <= rsi < 55:  score += 1

    # Dow Theory
    if dow["primary"]["trend"]   == "UPTREND":   score += 2
    if dow["secondary"]["trend"] == "DOWNTREND": score += 1
    if dow["minor"]["trend"]     == "UPTREND":   score += 1

    # Triangle/Wedge patterns
    if pat["found"] and pat["best"]["direction"] == "BULLISH": score += 2

    # Golden / Death Cross
    mc = cont["ma_crosses"]
    if   mc["golden_cross"]:       score += 3
    elif mc["ma50_above_ma200"]:   score += 1

    # Reversal patterns
    if reversal["best"] and reversal["best"]["direction"] == "BULLISH": score += 2
    if reversal["best"] and reversal["best"]["confirmed"]:              score += 1

    # Continuation patterns
    if cont["best"] and cont["best"]["direction"] == "BULLISH": score += 2

    # Trendline
    tl = cont["trendlines"]
    if tl["signal"] == "DOWNTREND BROKEN — Bullish": score += 2

    # Candlesticks
    if candles["bullish"]: score += min(len(candles["bullish"]), 2)

    # MACD
    if ind["macd"]["signal"] in ("BUY SIGNAL", "BULLISH"): score += 2

    # Bollinger
    if ind["bb"]["signal"] == "BREAKOUT": score += 1
    if ind["bb"]["signal"] == "SQUEEZE":  score += 1

    # Stochastic
    if candles["stochastic"]["signal"] == "BUY SIGNAL": score += 2

    # RSI divergence
    if ind["rsi"]["divergence"] == "BULLISH_DIVERGENCE": score += 2

    # Strength label
    strength = "STRONG" if score >= 18 else "MEDIUM" if score >= 10 else "WEAK"

    # Grade (aligned with entry_engine confidence thresholds)
    # Normalise score 0-30 → 0-100 confidence proxy
    conf = int(score / 30 * 100)
    if   score >= 24: grade = "A+"; gc = "#00ff88"
    elif score >= 20: grade = "A";  gc = "#3dd68c"
    elif score >= 15: grade = "B";  gc = "#7c6af7"
    elif score >= 10: grade = "C";  gc = "#f5a623"
    elif score >= 5:  grade = "D";  gc = "#f75f5f"
    else:             grade = "F";  gc = "#ff3333"

    return score, strength, grade, gc


# ─────────────────────────────────────────────────────────────────────────────
# TIME MACHINE BACKTEST
# ─────────────────────────────────────────────────────────────────────────────

def run_time_machine(symbol: str,
                     years_back: int = 3,
                     sl_atr_mult: float = 1.5,
                     t1_atr_mult: float = 2.0,
                     t2_atr_mult: float = 3.5,
                     max_hold_days: int = 30,
                     sample_every_n_days: int = 3,
                     progress_cb=None) -> dict:
    """
    TIME MACHINE BACKTEST
    ─────────────────────
    For every trading day from (today - years_back) to today:

      1. Take all history UP TO that day (strict no-lookahead)
      2. Run full analysis: indicators, Dow Theory, patterns, candlesticks
      3. Compute unified score → grade (A+/A/B/C/D/F)
      4. Record entry price, SL, T1, T2
      5. Scan FORWARD from that day → did T1 or SL get hit first?
      6. Record outcome per day

    Final output: grouped by grade showing:
      Grade | Times | T1 Hit | T2 Hit | SL Hit | Timeout | Win% | Avg Ret%
       A+   |  18   |   12   |   8    |   4    |    2    | 67%  | +4.2%
       A    |  34   |   20   |  12    |  10    |    4    | 59%  | +3.1%
       ...

    This answers: "When the model says A+, how often does it actually work?"

    Training data:  2019-01-01 → 2023-12-31  (in-sample)
    Validation:     2024-01-01 → today        (out-of-sample)
    Full fetch:     6+ years to cover both windows
    """
    from datetime import date, timedelta

    # Lazy import to avoid circular imports
    from scanner.data.indicators               import get_indicator_summary
    from scanner.patterns.dow_theory               import full_dow_analysis
    from scanner.patterns.patterns                 import get_pattern_summary
    from scanner.patterns.reversal_patterns        import get_reversal_summary
    from scanner.patterns.continuation_patterns    import get_continuation_summary
    from scanner.patterns.candlesticks_oscillators import get_candle_oscillator_summary

    _load_nifty_cache()

    today     = date.today()
    scan_start = today - timedelta(days=int(years_back * 365))

    # Fetch 6+ years so 2019 data is available
    fetch_years = max(years_back + 2, 6)

    try:
        df_full = yf.Ticker(symbol).history(
            period=f"{fetch_years}y", auto_adjust=True)
        if df_full.empty or len(df_full) < 200:
            return {"error": f"Not enough data for {symbol}"}
        if df_full.index.tz is not None:
            df_full.index = df_full.index.tz_convert("UTC").tz_localize(None)
        df_full = _add_indicators(df_full)
    except Exception as e:
        return {"error": str(e)}

    # Get the bar indices for the scan window
    ts_start = pd.Timestamp(scan_start)
    scan_indices = [
        i for i, ts in enumerate(df_full.index)
        if ts >= ts_start and i >= 250   # need 250 warm-up bars
    ]

    if not scan_indices:
        return {"error": "No bars in scan window"}

    # Sample every N days to keep it fast (3 = every 3rd trading day)
    scan_indices = scan_indices[::sample_every_n_days]

    all_days = []     # one record per sampled day
    total    = len(scan_indices)

    for step, i in enumerate(scan_indices):
        if progress_cb and step % 20 == 0:
            progress_cb(step, total, str(df_full.index[i].date()))

        df_slice = df_full.iloc[:i + 1].copy()
        bar_date = df_full.index[i].date()

        try:
            # Full analysis on this slice
            ind     = get_indicator_summary(df_slice)
            df2     = ind["df"]
            dow     = full_dow_analysis(df2)
            pat     = get_pattern_summary(df2)
            rev     = get_reversal_summary(df2)
            cont    = get_continuation_summary(df2)
            cnd     = get_candle_oscillator_summary(df2)

            cmp      = float(df2["Close"].iloc[-1])
            w52      = float(df2["High"].rolling(252, min_periods=50).max().iloc[-1])
            dist_52w = (cmp - w52) / w52 * 100
            vr       = float(df2["Vol_ratio"].iloc[-1]) if "Vol_ratio" in df2.columns else 1.0

            # Skip if not in basic uptrend (price below MA200 = no setup)
            ma200 = df2["SMA_200"].iloc[-1] if "SMA_200" in df2.columns else None
            if ma200 and not pd.isna(ma200) and cmp < float(ma200):
                continue

            # Unified score
            score, strength, grade, gc = compute_score(
                ind, dow, pat, cont, cnd, rev, dist_52w, vr)

            # Skip very weak days — no setup
            if grade == "F":
                continue

            # Entry levels
            atr = float(df2["ATR"].iloc[-1]) if "ATR" in df2.columns else cmp * 0.02
            if pd.isna(atr) or atr <= 0:
                atr = cmp * 0.02

            sl_val  = cmp - sl_atr_mult * atr
            swing_l = float(df2["Low"].tail(10).min()) * 0.995
            sl_val  = max(sl_val, swing_l)
            sl_val  = min(sl_val, cmp * 0.985)
            sl_val  = max(sl_val, cmp * 0.92)
            risk    = max(cmp - sl_val, cmp * 0.005)
            t1_val  = round(cmp + t1_atr_mult * risk, 2)
            t2_val  = round(cmp + t2_atr_mult * risk, 2)

            # Which window?
            window = "IN-SAMPLE (2019-2023)" if bar_date.year <= 2023 else "OUT-OF-SAMPLE (2024+)"

            all_days.append({
                "date":      bar_date,
                "bar_idx":   i,
                "cmp":       round(cmp, 2),
                "score":     score,
                "strength":  strength,
                "grade":     grade,
                "grade_color": gc,
                "sl":        round(sl_val, 2),
                "t1":        round(t1_val, 2),
                "t2":        round(t2_val, 2),
                "risk_pct":  round((cmp - sl_val) / cmp * 100, 2),
                "rsi":       round(ind["rsi"]["value"] or 0, 1),
                "vr":        round(vr, 2),
                "dist_52w":  round(dist_52w, 2),
                "dow_signal":dow["signal"],
                "window":    window,
                "outcome":   "PENDING",
                "exit_price": cmp,
                "return_pct": 0.0,
                "holding_days": 0,
            })

        except Exception:
            continue

    if not all_days:
        return {"error": "No tradeable days found — stock may not meet MA200 filter"}

    # ── Forward scan: verify each day's entry + MAE + MFE (Bandy) ───────────
    # MAE = Maximum Adverse Excursion  = how low before exit (worst drawdown seen)
    # MFE = Maximum Favorable Excursion = how high before exit (best gain seen)
    # "Use MAE to set your stop. The market tells you where it should be." — Bandy
    n = len(df_full)
    for rec in all_days:
        i     = rec["bar_idx"]
        sl    = rec["sl"]
        t1    = rec["t1"]
        t2    = rec["t2"]
        entry = rec["cmp"]
        outcome = "TIMEOUT"
        exit_p  = float(df_full["Close"].iloc[min(i + max_hold_days, n-1)])
        held    = max_hold_days
        t1_hit  = False

        # MAE/MFE tracking
        max_high = entry   # highest price seen after entry (MFE numerator)
        min_low  = entry   # lowest  price seen after entry (MAE numerator)

        for j in range(i + 1, min(i + max_hold_days + 1, n)):
            lo = float(df_full["Low"].iloc[j])
            hi = float(df_full["High"].iloc[j])

            # Track extremes every bar (before any exit check)
            if hi > max_high: max_high = hi
            if lo < min_low:  min_low  = lo

            if lo <= sl:
                outcome = "SL_HIT";    exit_p = sl;   held = j - i; break
            if hi >= t2:
                outcome = "T2_HIT";    exit_p = t2;   held = j - i; t1_hit = True; break
            if hi >= t1 and not t1_hit:
                t1_hit = True; outcome = "T1_HIT"; exit_p = t1

        if outcome == "TIMEOUT" and t1_hit:
            outcome = "T1_HIT"

        # MFE = max gain seen as % of entry (best price before exit)
        mfe_pct = round((max_high - entry) / entry * 100, 2)
        # MAE = max loss seen as % of entry (worst dip before exit, always negative)
        mae_pct = round((min_low  - entry) / entry * 100, 2)
        # MFE in ₹ absolute
        mfe_abs = round(max_high - entry, 2)
        mae_abs = round(min_low  - entry, 2)

        # Efficiency: how much of the MFE did we actually capture?
        # 100% = captured the full move. <50% = left a lot on the table.
        if mfe_pct > 0:
            capture_pct = round(
                (exit_p - entry) / (max_high - entry) * 100, 1)
        else:
            capture_pct = 0.0

        rec["outcome"]      = outcome
        rec["exit_price"]   = round(exit_p, 2)
        rec["return_pct"]   = round((exit_p - entry) / entry * 100, 2)
        rec["holding_days"] = held
        rec["t1_hit"]       = t1_hit
        # Bandy MAE/MFE
        rec["mfe_pct"]      = mfe_pct    # max % gain before exit
        rec["mae_pct"]      = mae_pct    # max % loss before exit (negative)
        rec["mfe_abs"]      = mfe_abs    # ₹ gain at best point
        rec["mae_abs"]      = mae_abs    # ₹ loss at worst point
        rec["max_price"]    = round(max_high, 2)   # highest price seen
        rec["min_price"]    = round(min_low,  2)   # lowest price seen
        rec["capture_pct"]  = capture_pct  # % of MFE captured at exit

    # ── Group by grade ─────────────────────────────────────────────────────
    grade_order = ["A+", "A", "B", "C", "D"]
    grade_colors = {
        "A+": "#00ff88", "A": "#3dd68c", "B": "#7c6af7",
        "C": "#f5a623", "D": "#f75f5f"
    }

    def _grade_stats(rows: list) -> dict:
        if not rows:
            return None
        total   = len(rows)
        t1_n    = sum(1 for r in rows if r["outcome"] == "T1_HIT")
        t2_n    = sum(1 for r in rows if r["outcome"] == "T2_HIT")
        sl_n    = sum(1 for r in rows if r["outcome"] == "SL_HIT")
        to_n    = sum(1 for r in rows if r["outcome"] == "TIMEOUT")
        win_n   = t1_n + t2_n
        rets    = [r["return_pct"] for r in rows]
        avg_ret = round(sum(rets) / len(rets), 2) if rets else 0
        win_rets = [r for r in rets if r > 0]
        loss_rets= [r for r in rets if r <= 0]
        avg_win  = round(sum(win_rets)/len(win_rets), 2) if win_rets else 0
        avg_loss = round(sum(loss_rets)/len(loss_rets), 2) if loss_rets else 0
        win_rate = round(win_n / total * 100, 1) if total > 0 else 0

        # Profit factor
        gross_w = sum(win_rets)
        gross_l = abs(sum(loss_rets))
        pf      = round(gross_w / gross_l, 2) if gross_l > 0 else 999.0

        # Avg score in this grade
        avg_score = round(sum(r["score"] for r in rows) / len(rows), 1)

        # Avg RSI
        avg_rsi = round(sum(r["rsi"] for r in rows) / len(rows), 1)

        # ── MAE / MFE aggregates (Bandy) ──────────────────────────────────
        # "Use MAE to set your stop. The market tells you where it should be." — Bandy
        mfe_vals     = [r.get("mfe_pct", 0) for r in rows]
        mae_vals     = [r.get("mae_pct", 0) for r in rows]
        cap_vals     = [r.get("capture_pct", 0) for r in rows]

        avg_mfe      = round(sum(mfe_vals) / len(mfe_vals), 2) if mfe_vals else 0
        avg_mae      = round(sum(mae_vals) / len(mae_vals), 2) if mae_vals else 0
        avg_capture  = round(sum(cap_vals) / len(cap_vals), 1) if cap_vals else 0
        max_mfe      = round(max(mfe_vals), 2) if mfe_vals else 0   # best single trade
        worst_mae    = round(min(mae_vals), 2) if mae_vals else 0   # worst single dip

        # SL trades: how much did price go UP before hitting SL?
        # This tells you if SL was too tight (price rose then reversed)
        sl_rows      = [r for r in rows if r["outcome"] == "SL_HIT"]
        sl_mfe_vals  = [r.get("mfe_pct", 0) for r in sl_rows]
        avg_sl_mfe   = round(sum(sl_mfe_vals)/len(sl_mfe_vals), 2) if sl_mfe_vals else 0
        # If avg_sl_mfe > 2% → price went up 2%+ before coming back to hit SL
        # → SL might be too tight or entry was slightly late

        # Win trades: how much did price go up (MFE) vs what we captured?
        win_rows     = [r for r in rows if r["outcome"] in ("T1_HIT","T2_HIT")]
        win_mfe      = [r.get("mfe_pct", 0) for r in win_rows]
        win_capture  = [r.get("capture_pct", 0) for r in win_rows]
        avg_win_mfe      = round(sum(win_mfe)/len(win_mfe), 2) if win_mfe else 0
        avg_win_capture  = round(sum(win_capture)/len(win_capture), 1) if win_capture else 0

        # Per-window breakdown
        in_sample  = [r for r in rows if "IN-SAMPLE"  in r["window"]]
        out_sample = [r for r in rows if "OUT-OF-SAMPLE" in r["window"]]

        def _mini(wrows):
            if not wrows: return {"n":0,"win_rate":0,"avg_ret":0}
            ww = sum(1 for r in wrows if r["outcome"] in ("T1_HIT","T2_HIT"))
            return {
                "n":        len(wrows),
                "win_rate": round(ww/len(wrows)*100,1),
                "avg_ret":  round(sum(r["return_pct"] for r in wrows)/len(wrows),2),
            }

        return {
            "total":      total,
            "t1_hit":     t1_n,
            "t2_hit":     t2_n,
            "sl_hit":     sl_n,
            "timeout":    to_n,
            "win_rate":   win_rate,
            "avg_return": avg_ret,
            "avg_win":    avg_win,
            "avg_loss":   avg_loss,
            "profit_factor": pf,
            "avg_score":  avg_score,
            "avg_rsi":    avg_rsi,
            "in_sample":  _mini(in_sample),
            "out_sample": _mini(out_sample),
            "rows":       rows,
            # ── MAE / MFE (Bandy) ──
            "avg_mfe":         avg_mfe,         # avg max gain seen before exit
            "avg_mae":         avg_mae,         # avg max dip seen before exit
            "avg_capture":     avg_capture,     # avg % of MFE captured at exit
            "max_mfe":         max_mfe,         # best single trade MFE
            "worst_mae":       worst_mae,       # worst single trade MAE
            "avg_sl_mfe":      avg_sl_mfe,      # on SL trades: how high before reversing
            "avg_win_mfe":     avg_win_mfe,     # on win trades: max gain potential
            "avg_win_capture": avg_win_capture, # on win trades: % captured
        }

    by_grade = {}
    for g in grade_order:
        rows = [r for r in all_days if r["grade"] == g]
        stats = _grade_stats(rows)
        if stats:
            by_grade[g] = stats

    # ── Overall summary ────────────────────────────────────────────────────
    overall = _grade_stats(all_days)

    # Best and worst grade
    best_grade  = max(by_grade.keys(), key=lambda g: by_grade[g]["win_rate"]) if by_grade else None
    worst_grade = min(by_grade.keys(), key=lambda g: by_grade[g]["win_rate"]) if by_grade else None

    # Equity curve (if you had traded every A+/A signal)
    top_grade_rows = [r for r in all_days if r["grade"] in ("A+","A")]
    top_grade_rows.sort(key=lambda x: x["date"])
    eq = 100.0
    equity_curve = [100.0]
    for r in top_grade_rows:
        eq *= (1 + r["return_pct"] / 100)
        equity_curve.append(round(eq, 2))

    return {
        "symbol":        symbol.replace(".NS",""),
        "years_back":    years_back,
        "total_days":    len(all_days),
        "scan_start":    str(scan_start),
        "scan_end":      str(today),
        "by_grade":      by_grade,
        "grade_order":   [g for g in grade_order if g in by_grade],
        "grade_colors":  grade_colors,
        "overall":       overall,
        "best_grade":    best_grade,
        "worst_grade":   worst_grade,
        "equity_curve":  equity_curve,
        "all_days":      all_days,
        "sample_every":  sample_every_n_days,
    }