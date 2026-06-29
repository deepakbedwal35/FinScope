"""
dow_theory.py
=============
Implements Dow Theory trend classification:
  - Primary Trend  (The Tide)   : > 1 year
  - Secondary Trend(The Waves)  : 3 weeks – 3 months, retraces 1/3 to 2/3
  - Minor Trend    (The Ripples): < 3 weeks

Logic:
  1. Find swing highs / swing lows using a rolling window
  2. Classify trend by comparing successive swings
  3. Layer: Primary → Secondary → Minor
"""

import pandas as pd
import numpy as np


# ─────────────────────────────────────────────────────────────────────────────
# 1. SWING POINT DETECTION
# ─────────────────────────────────────────────────────────────────────────────

def find_swings(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """
    Identify swing highs and swing lows.

    A swing HIGH at index i means df['High'][i] is the highest in
    [i-window … i+window].  Similarly for swing LOW.

    Returns df with two new boolean columns:
        swing_high  – True at a swing high candle
        swing_low   – True at a swing low candle
    """
    df = df.copy()
    highs = df["High"].values
    lows  = df["Low"].values
    n     = len(df)

    sh = np.zeros(n, dtype=bool)
    sl = np.zeros(n, dtype=bool)

    for i in range(window, n - window):
        left_h  = highs[i - window: i]
        right_h = highs[i + 1: i + window + 1]
        left_l  = lows[i - window: i]
        right_l = lows[i + 1: i + window + 1]

        if highs[i] >= left_h.max() and highs[i] >= right_h.max():
            sh[i] = True
        if lows[i] <= left_l.min() and lows[i] <= right_l.min():
            sl[i] = True

    df["swing_high"] = sh
    df["swing_low"]  = sl
    return df


def get_swing_points(df: pd.DataFrame, window: int = 5):
    """
    Return two DataFrames: one for swing highs, one for swing lows,
    each with columns [date, price, idx].
    """
    df = find_swings(df, window)
    highs = df[df["swing_high"]][["High"]].copy()
    highs.columns = ["price"]
    highs["type"] = "high"

    lows = df[df["swing_low"]][["Low"]].copy()
    lows.columns = ["price"]
    lows["type"] = "low"

    return highs, lows


# ─────────────────────────────────────────────────────────────────────────────
# 2. TREND CLASSIFICATION (Higher Highs / Higher Lows)
# ─────────────────────────────────────────────────────────────────────────────

def classify_trend_from_swings(swing_highs: pd.DataFrame,
                                swing_lows:  pd.DataFrame,
                                n_swings: int = 3) -> str:
    """
    Compare the last n_swings swing highs and lows to determine direction.

    UPTREND   : Higher Highs (HH) AND Higher Lows (HL)
    DOWNTREND : Lower Highs  (LH) AND Lower Lows  (LL)
    SIDEWAYS  : Mixed (not consistent)
    """
    if len(swing_highs) < 2 or len(swing_lows) < 2:
        return "SIDEWAYS"

    recent_highs = swing_highs["price"].values[-n_swings:]
    recent_lows  = swing_lows["price"].values[-n_swings:]

    hh = all(recent_highs[i] > recent_highs[i - 1] for i in range(1, len(recent_highs)))
    hl = all(recent_lows[i]  > recent_lows[i - 1]  for i in range(1, len(recent_lows)))
    lh = all(recent_highs[i] < recent_highs[i - 1] for i in range(1, len(recent_highs)))
    ll = all(recent_lows[i]  < recent_lows[i - 1]  for i in range(1, len(recent_lows)))

    if hh and hl:   return "UPTREND"
    if lh and ll:   return "DOWNTREND"
    return "SIDEWAYS"


# ─────────────────────────────────────────────────────────────────────────────
# 3. PRIMARY TREND  (The Tide — > 1 year of data, large window)
# ─────────────────────────────────────────────────────────────────────────────

def get_primary_trend(df: pd.DataFrame) -> dict:
    """
    Uses a large swing window (20 bars ≈ monthly pivots) on 2 years of data.
    The primary trend is the TIDE — major market direction.

    Returns dict:
        trend       : 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS'
        description : human readable
        color       : green / red / gray
        emoji       : for UI
        swing_highs : pd.DataFrame
        swing_lows  : pd.DataFrame
    """
    # Need at least 200 bars; use all available
    data = df.copy()
    sh, sl = get_swing_points(data, window=20)  # Large window → monthly swings

    trend = classify_trend_from_swings(sh, sl, n_swings=3)

    # Also confirm with 200-day MA slope
    ma200 = data["Close"].rolling(200).mean()
    if len(ma200.dropna()) >= 10:
        slope = ma200.iloc[-1] - ma200.iloc[-20]   # 20-bar slope
        if slope > 0 and trend == "SIDEWAYS":
            trend = "UPTREND"
        elif slope < 0 and trend == "SIDEWAYS":
            trend = "DOWNTREND"

    desc_map = {
        "UPTREND":   "Primary Uptrend (Bullish Tide) — Trade LONG only",
        "DOWNTREND": "Primary Downtrend (Bearish Tide) — Trade SHORT or avoid",
        "SIDEWAYS":  "Primary Sideways — No dominant direction, wait for breakout",
    }
    color_map  = {"UPTREND": "#3dd68c", "DOWNTREND": "#f75f5f", "SIDEWAYS": "#f5a623"}
    emoji_map  = {"UPTREND": "🌊⬆️",    "DOWNTREND": "🌊⬇️",    "SIDEWAYS": "🌊➡️"}

    return {
        "trend":        trend,
        "description":  desc_map[trend],
        "color":        color_map[trend],
        "emoji":        emoji_map[trend],
        # "swing_highs":  sh,
        # "swing_lows":   sl,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. SECONDARY TREND  (The Waves — 3 weeks to 3 months)
# ─────────────────────────────────────────────────────────────────────────────

def get_secondary_trend(df: pd.DataFrame) -> dict:
    """
    Medium swing window (10 bars ≈ 2-week pivots) on last 6 months of data.
    Also checks if current move is a 1/3–2/3 retracement of the primary move.

    Returns dict with same keys as get_primary_trend plus retracement_pct.
    """
    data = df.tail(130).copy()   # ~6 months
    sh, sl = get_swing_points(data, window=10)

    trend = classify_trend_from_swings(sh, sl, n_swings=3)

    # Retracement check: is the secondary move a correction of 33%–67%?
    retracement_pct = None
    if len(sh) >= 2 and len(sl) >= 2:
        last_high = sh["price"].iloc[-1]
        last_low  = sl["price"].iloc[-1]
        prev_high = sh["price"].iloc[-2]
        prev_low  = sl["price"].iloc[-2]
        primary_range = abs(prev_high - prev_low)
        if primary_range > 0:
            correction   = abs(last_high - last_low)
            retracement_pct = round((correction / primary_range) * 100, 1)

    desc_map = {
        "UPTREND":   "Secondary Uptrend (Corrective Wave Up)",
        "DOWNTREND": "Secondary Downtrend (Corrective Wave Down / Pullback)",
        "SIDEWAYS":  "Secondary Consolidation",
    }
    color_map = {"UPTREND": "#7c6af7", "DOWNTREND": "#e06cf5", "SIDEWAYS": "#f5a623"}
    emoji_map = {"UPTREND": "🌊⬆️",    "DOWNTREND": "🌊⬇️",    "SIDEWAYS": "🌊➡️"}

    retracement_label = ""
    if retracement_pct:
        if 33 <= retracement_pct <= 67:
            retracement_label = f" Classic retracement ({retracement_pct}% — within 1/3–2/3 zone)"
        else:
            retracement_label = f" Retracement {retracement_pct}% (outside classic zone)"

    return {
        "trend":             trend,
        "description":       desc_map[trend],
        "color":             color_map[trend],
        "emoji":             emoji_map[trend],
        # "swing_highs":       sh,
        # "swing_lows":        sl,
        "retracement_pct":   retracement_pct,
        "retracement_label": retracement_label,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. MINOR TREND  (The Ripples — < 3 weeks)
# ─────────────────────────────────────────────────────────────────────────────

def get_minor_trend(df: pd.DataFrame) -> dict:
    """
    Small swing window (3 bars) on last 30 trading days (~6 weeks).
    Captures short-term ripples for entry timing.
    """
    data = df.tail(30).copy()
    sh, sl = get_swing_points(data, window=3)

    trend = classify_trend_from_swings(sh, sl, n_swings=2)

    desc_map = {
        "UPTREND":   "Minor Uptrend (Ripple Up — good entry in primary uptrend)",
        "DOWNTREND": "Minor Downtrend (Ripple Down — wait for reversal)",
        "SIDEWAYS":  "Minor Sideways (Ripple — no clear short-term direction)",
    }
    color_map = {"UPTREND": "#3dd68c", "DOWNTREND": "#f75f5f", "SIDEWAYS": "#aaaaaa"}
    emoji_map = {"UPTREND": "〰️⬆️",   "DOWNTREND": "〰️⬇️",   "SIDEWAYS": "〰️➡️"}

    return {
        "trend":       trend,
        "description": desc_map[trend],
        "color":       color_map[trend],
        "emoji":       emoji_map[trend],
        # "swing_highs": sh,
        # "swing_lows":  sl,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 6. FULL DOW ANALYSIS  (combine all 3 tiers)
# ─────────────────────────────────────────────────────────────────────────────

def full_dow_analysis(df: pd.DataFrame) -> dict:
    """
    Run all 3 trend tiers and return a combined signal.

    BEST TRADE SETUP (Dow Theory):
        Primary   = UPTREND
        Secondary = DOWNTREND  (pullback / retracement happening)
        Minor     = UPTREND    (ripple turning back up = entry signal)

    Returns everything needed for UI display + trading signal.
    """
    primary   = get_primary_trend(df)
    secondary = get_secondary_trend(df)
    minor     = get_minor_trend(df)

    # ── Combine into overall signal ──
    p = primary["trend"]
    s = secondary["trend"]
    m = minor["trend"]

    if p == "UPTREND" and s == "DOWNTREND" and m == "UPTREND":
        signal       = "STRONG BUY"
        signal_color = "#3dd68c"
        signal_desc  = "Classic Dow Buy: Tide UP · Wave retracing · Ripple turning UP"
    elif p == "UPTREND" and m == "UPTREND":
        signal       = "BUY"
        signal_color = "#7c6af7"
        signal_desc  = "Primary trend is UP, minor trend confirming"
    elif p == "DOWNTREND" and s == "UPTREND" and m == "DOWNTREND":
        signal       = "STRONG SELL / AVOID"
        signal_color = "#f75f5f"
        signal_desc  = "Classic Dow Sell: Tide DOWN · Wave bouncing · Ripple turning DOWN"
    elif p == "DOWNTREND":
        signal       = "AVOID"
        signal_color = "#f75f5f"
        signal_desc  = "Primary trend is DOWN — do not buy against the tide"
    elif p == "SIDEWAYS":
        signal       = "WAIT"
        signal_color = "#f5a623"
        signal_desc  = "No primary trend — wait for breakout confirmation"
    else:
        signal       = "NEUTRAL"
        signal_color = "#aaaaaa"
        signal_desc  = "Mixed signals — observe and wait"

    
    


    return {
        "primary":      primary,
        "secondary":    secondary,
        "minor":        minor,
        "signal":       signal,
        "signal_color": signal_color,
        "signal_desc":  signal_desc,
    }

