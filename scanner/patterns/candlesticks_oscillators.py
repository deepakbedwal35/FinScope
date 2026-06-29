"""
candlesticks_oscillators.py  —  Murphy Chapter 10 + 12
=======================================================
Candlestick Patterns (Chapter 12):
  Single-bar:
    1.  Doji              — indecision, potential reversal
    2.  Hammer            — bullish reversal at bottom
    3.  Hanging Man       — bearish reversal at top
    4.  Shooting Star     — bearish reversal at top
    5.  Inverted Hammer   — bullish reversal at bottom
    6.  Marubozu          — strong momentum candle

  Two-bar:
    7.  Bullish Engulfing — strong bullish reversal
    8.  Bearish Engulfing — strong bearish reversal
    9.  Bullish Harami    — inside bar, potential reversal up
    10. Bearish Harami    — inside bar, potential reversal down
    11. Piercing Line     — bullish reversal
    12. Dark Cloud Cover  — bearish reversal
    13. Tweezer Top       — bearish reversal (equal highs)
    14. Tweezer Bottom    — bullish reversal (equal lows)

  Three-bar:
    15. Morning Star      — bullish reversal (3 bars)
    16. Evening Star      — bearish reversal (3 bars)
    17. Three White Soldiers — strong bullish continuation
    18. Three Black Crows    — strong bearish continuation

Oscillators (Chapter 10):
    19. Stochastic (%K and %D) — overbought/oversold + crossover signals
"""

import pandas as pd
import numpy as np
import ta


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _body(o, c):       return abs(c - o)
def _upper_shadow(o, c, h): return h - max(o, c)
def _lower_shadow(o, c, l): return min(o, c) - l
def _is_bullish(o, c): return c > o
def _is_bearish(o, c): return c < o
def _range(h, l):      return h - l


# ─────────────────────────────────────────────────────────────────────────────
# SINGLE-BAR PATTERNS
# ─────────────────────────────────────────────────────────────────────────────

def _detect_single_bar(o, h, l, c) -> list:
    patterns = []
    body     = _body(o, c)
    upper_s  = _upper_shadow(o, c, h)
    lower_s  = _lower_shadow(o, c, l)
    candle_r = _range(h, l)
    if candle_r == 0:
        return patterns

    body_ratio  = body  / candle_r
    upper_ratio = upper_s / candle_r
    lower_ratio = lower_s / candle_r

    # DOJI: body is < 5% of total range
    if body_ratio < 0.05:
        patterns.append({
            "name":      "DOJI",
            "emoji":     "✚",
            "signal":    "REVERSAL WARNING",
            "direction": "NEUTRAL",
            "strength":  "MEDIUM",
            "desc":      "Doji: Open ≈ Close — buyer/seller equilibrium. Potential trend reversal.",
            "color":     "#f5a623",
        })

    # HAMMER / HANGING MAN: small body at top, long lower shadow
    elif lower_ratio >= 0.60 and body_ratio <= 0.30 and upper_ratio <= 0.10:
        patterns.append({
            "name":      "HAMMER",
            "emoji":     "🔨",
            "signal":    "BULLISH REVERSAL",
            "direction": "BULLISH",
            "strength":  "STRONG",
            "desc":      "Hammer: Long lower shadow — sellers rejected, buyers took control. Bullish at bottoms.",
            "color":     "#3dd68c",
        })

    # SHOOTING STAR / INVERTED HAMMER: long upper shadow, small body at bottom
    elif upper_ratio >= 0.60 and body_ratio <= 0.30 and lower_ratio <= 0.10:
        if _is_bearish(o, c):
            patterns.append({
                "name":      "SHOOTING_STAR",
                "emoji":     "💫",
                "signal":    "BEARISH REVERSAL",
                "direction": "BEARISH",
                "strength":  "STRONG",
                "desc":      "Shooting Star: Buyers failed to hold gains — bearish reversal signal at tops.",
                "color":     "#f75f5f",
            })
        else:
            patterns.append({
                "name":      "INVERTED_HAMMER",
                "emoji":     "🔻",
                "signal":    "BULLISH REVERSAL",
                "direction": "BULLISH",
                "strength":  "MEDIUM",
                "desc":      "Inverted Hammer: Potential bullish reversal — needs next candle confirmation.",
                "color":     "#7c6af7",
            })

    # MARUBOZU: no shadows, full body candle — strong momentum
    elif body_ratio >= 0.95:
        direction = "BULLISH" if _is_bullish(o, c) else "BEARISH"
        patterns.append({
            "name":      "MARUBOZU",
            "emoji":     "🟩" if direction == "BULLISH" else "🟥",
            "signal":    f"STRONG {direction} MOMENTUM",
            "direction": direction,
            "strength":  "STRONG",
            "desc":      f"Marubozu: Full body, no shadows — {direction.lower()} momentum is very strong.",
            "color":     "#3dd68c" if direction == "BULLISH" else "#f75f5f",
        })

    return patterns


# ─────────────────────────────────────────────────────────────────────────────
# TWO-BAR PATTERNS
# ─────────────────────────────────────────────────────────────────────────────

def _detect_two_bar(o1, h1, l1, c1, o2, h2, l2, c2) -> list:
    patterns = []

    body1 = _body(o1, c1)
    body2 = _body(o2, c2)
    if body1 == 0 or body2 == 0:
        return patterns

    # BULLISH ENGULFING: bearish candle followed by larger bullish candle
    if (_is_bearish(o1, c1) and _is_bullish(o2, c2) and
            o2 <= c1 and c2 >= o1 and body2 > body1):
        patterns.append({
            "name":      "BULLISH_ENGULFING",
            "emoji":     "🟩⬆️",
            "signal":    "BULLISH REVERSAL",
            "direction": "BULLISH",
            "strength":  "STRONG",
            "desc":      "Bullish Engulfing: Large green candle engulfs previous red — strong reversal signal.",
            "color":     "#3dd68c",
        })

    # BEARISH ENGULFING
    elif (_is_bullish(o1, c1) and _is_bearish(o2, c2) and
              o2 >= c1 and c2 <= o1 and body2 > body1):
        patterns.append({
            "name":      "BEARISH_ENGULFING",
            "emoji":     "🟥⬇️",
            "signal":    "BEARISH REVERSAL",
            "direction": "BEARISH",
            "strength":  "STRONG",
            "desc":      "Bearish Engulfing: Large red candle engulfs previous green — strong reversal signal.",
            "color":     "#f75f5f",
        })

    # BULLISH HARAMI: large bearish then small bullish inside
    elif (_is_bearish(o1, c1) and _is_bullish(o2, c2) and
              o2 > c1 and c2 < o1 and body2 < body1 * 0.5):
        patterns.append({
            "name":      "BULLISH_HARAMI",
            "emoji":     "🤰🟢",
            "signal":    "POTENTIAL BULLISH REVERSAL",
            "direction": "BULLISH",
            "strength":  "MEDIUM",
            "desc":      "Bullish Harami: Small green inside large red — momentum slowing, watch for reversal.",
            "color":     "#7c6af7",
        })

    # BEARISH HARAMI
    elif (_is_bullish(o1, c1) and _is_bearish(o2, c2) and
              o2 < c1 and c2 > o1 and body2 < body1 * 0.5):
        patterns.append({
            "name":      "BEARISH_HARAMI",
            "emoji":     "🤰🔴",
            "signal":    "POTENTIAL BEARISH REVERSAL",
            "direction": "BEARISH",
            "strength":  "MEDIUM",
            "desc":      "Bearish Harami: Small red inside large green — upward momentum slowing.",
            "color":     "#f5a623",
        })

    # PIERCING LINE: bearish then bullish closing above midpoint of bar1
    elif (_is_bearish(o1, c1) and _is_bullish(o2, c2) and
              o2 < l1 and c2 > (o1 + c1) / 2 and c2 < o1):
        patterns.append({
            "name":      "PIERCING_LINE",
            "emoji":     "⚔️🟢",
            "signal":    "BULLISH REVERSAL",
            "direction": "BULLISH",
            "strength":  "STRONG",
            "desc":      "Piercing Line: Green candle opens below prev low and closes above midpoint — bullish reversal.",
            "color":     "#3dd68c",
        })

    # DARK CLOUD COVER
    elif (_is_bullish(o1, c1) and _is_bearish(o2, c2) and
              o2 > h1 and c2 < (o1 + c1) / 2 and c2 > o1):
        patterns.append({
            "name":      "DARK_CLOUD_COVER",
            "emoji":     "☁️🔴",
            "signal":    "BEARISH REVERSAL",
            "direction": "BEARISH",
            "strength":  "STRONG",
            "desc":      "Dark Cloud Cover: Red candle opens above prev high, closes below midpoint — bearish reversal.",
            "color":     "#f75f5f",
        })

    # TWEEZER TOP (equal highs)
    elif (abs(h1 - h2) / h1 < 0.002 and _is_bullish(o1, c1) and _is_bearish(o2, c2)):
        patterns.append({
            "name":      "TWEEZER_TOP",
            "emoji":     "🔧⬇️",
            "signal":    "BEARISH REVERSAL",
            "direction": "BEARISH",
            "strength":  "MEDIUM",
            "desc":      "Tweezer Top: Two candles with equal highs — strong resistance, bearish reversal.",
            "color":     "#f75f5f",
        })

    # TWEEZER BOTTOM (equal lows)
    elif (abs(l1 - l2) / l1 < 0.002 and _is_bearish(o1, c1) and _is_bullish(o2, c2)):
        patterns.append({
            "name":      "TWEEZER_BOTTOM",
            "emoji":     "🔧⬆️",
            "signal":    "BULLISH REVERSAL",
            "direction": "BULLISH",
            "strength":  "MEDIUM",
            "desc":      "Tweezer Bottom: Two candles with equal lows — strong support, bullish reversal.",
            "color":     "#3dd68c",
        })

    return patterns


# ─────────────────────────────────────────────────────────────────────────────
# THREE-BAR PATTERNS
# ─────────────────────────────────────────────────────────────────────────────

def _detect_three_bar(o1, h1, l1, c1, o2, h2, l2, c2, o3, h3, l3, c3) -> list:
    patterns = []

    # MORNING STAR: bearish → doji/small → bullish closing above bar1 midpoint
    doji_body2 = _body(o2, c2)
    range1     = _range(h1, l1) if _range(h1, l1) > 0 else 1

    if (_is_bearish(o1, c1) and _is_bullish(o3, c3) and
            doji_body2 / range1 < 0.3 and
            c3 > (o1 + c1) / 2 and o2 < c1 and o3 < o2):
        patterns.append({
            "name":      "MORNING_STAR",
            "emoji":     "🌅",
            "signal":    "STRONG BULLISH REVERSAL",
            "direction": "BULLISH",
            "strength":  "STRONG",
            "desc":      "Morning Star: Bearish + indecision + bullish — powerful bottom reversal.",
            "color":     "#3dd68c",
        })

    # EVENING STAR
    elif (_is_bullish(o1, c1) and _is_bearish(o3, c3) and
              doji_body2 / range1 < 0.3 and
              c3 < (o1 + c1) / 2 and o2 > c1 and o3 > o2):
        patterns.append({
            "name":      "EVENING_STAR",
            "emoji":     "🌇",
            "signal":    "STRONG BEARISH REVERSAL",
            "direction": "BEARISH",
            "strength":  "STRONG",
            "desc":      "Evening Star: Bullish + indecision + bearish — powerful top reversal.",
            "color":     "#f75f5f",
        })

    # THREE WHITE SOLDIERS: 3 consecutive bullish candles, each higher
    elif (_is_bullish(o1, c1) and _is_bullish(o2, c2) and _is_bullish(o3, c3) and
              c1 < c2 < c3 and o2 > o1 and o3 > o2):
        patterns.append({
            "name":      "THREE_WHITE_SOLDIERS",
            "emoji":     "⚔️⚔️⚔️",
            "signal":    "STRONG BULLISH CONTINUATION",
            "direction": "BULLISH",
            "strength":  "STRONG",
            "desc":      "Three White Soldiers: 3 strong green candles — powerful bullish momentum.",
            "color":     "#3dd68c",
        })

    # THREE BLACK CROWS: 3 consecutive bearish candles, each lower
    elif (_is_bearish(o1, c1) and _is_bearish(o2, c2) and _is_bearish(o3, c3) and
              c1 > c2 > c3 and o2 < o1 and o3 < o2):
        patterns.append({
            "name":      "THREE_BLACK_CROWS",
            "emoji":     "🦅🦅🦅",
            "signal":    "STRONG BEARISH CONTINUATION",
            "direction": "BEARISH",
            "strength":  "STRONG",
            "desc":      "Three Black Crows: 3 strong red candles — powerful bearish momentum.",
            "color":     "#f75f5f",
        })

    return patterns


# ─────────────────────────────────────────────────────────────────────────────
# MAIN CANDLESTICK DETECTOR
# ─────────────────────────────────────────────────────────────────────────────


def detect_candlestick_patterns(df: pd.DataFrame, lookback: int = 5) -> list:
    """
    Scan the last `lookback` candles for all candlestick patterns.
    Returns list of detected patterns with the exact chart timeframe.
    """
    patterns = []
    
    # 1. CALCULATE THE TIMEFRAME OF THE CHART
    # Subtract the timestamp of the first row from the second row
    timeframe_str = "Unknown"
    if len(df) >= 2 and isinstance(df.index, pd.DatetimeIndex):
        time_delta = df.index[1] - df.index[0]
        total_seconds = time_delta.total_seconds()
        
        if total_seconds >= 86400:
            timeframe_str = f"{int(total_seconds / 86400)}D" # Days (e.g., 1D)
        elif total_seconds >= 3600:
            timeframe_str = f"{int(total_seconds / 3600)}h"  # Hours (e.g., 1h, 4h)
        else:
            timeframe_str = f"{int(total_seconds / 60)}m"    # Minutes (e.g., 5m, 15m)

    # CRITICAL: Do NOT use drop=True, keep the index intact to read date strings
    data = df.tail(max(lookback + 3, 10)).copy()
    n    = len(data)

    for i in range(n-1, max(0, n-lookback-1), -1):
        o = data["Open"].iloc[i]
        h = data["High"].iloc[i]
        l = data["Low"].iloc[i]
        c = data["Close"].iloc[i]
        
        # Format the actual date of the candle
        date_str = data.index[i].strftime('%Y-%m-%d %H:%M') if hasattr(data.index[i], 'strftime') else f"Bar {i}"

        # Single bar
        for p in _detect_single_bar(o, h, l, c):
            p["date"] = date_str
            p["bars_ago"] = n - 1 - i
            p["timeframe"] = timeframe_str  # <--- INJECT TIMEFRAME HERE
            patterns.append(p)

        # Two bar
        if i >= 1:
            o1,h1,l1,c1 = data["Open"].iloc[i-1],data["High"].iloc[i-1],data["Low"].iloc[i-1],data["Close"].iloc[i-1]
            for p in _detect_two_bar(o1,h1,l1,c1,o,h,l,c):
                p["date"] = date_str
                p["bars_ago"] = n - 1 - i
                p["timeframe"] = timeframe_str  # <--- INJECT TIMEFRAME HERE
                patterns.append(p)

        # Three bar
        if i >= 2:
            o1,h1,l1,c1 = data["Open"].iloc[i-2],data["High"].iloc[i-2],data["Low"].iloc[i-2],data["Close"].iloc[i-2]
            o2,h2,l2,c2 = data["Open"].iloc[i-1],data["High"].iloc[i-1],data["Low"].iloc[i-1],data["Close"].iloc[i-1]
            for p in _detect_three_bar(o1,h1,l1,c1,o2,h2,l2,c2,o,h,l,c):
                p["date"] = date_str
                p["bars_ago"] = n - 1 - i
                p["timeframe"] = timeframe_str  # <--- INJECT TIMEFRAME HERE
                patterns.append(p)

    # Sort: most recent first, then by strength
    str_order = {"STRONG":0,"MEDIUM":1,"WEAK":2}
    patterns.sort(key=lambda x: (x["bars_ago"], str_order.get(x["strength"],"WEAK")))
    return patterns


# ─────────────────────────────────────────────────────────────────────────────
# STOCHASTIC OSCILLATOR (Chapter 10)
# ─────────────────────────────────────────────────────────────────────────────

def add_stochastic(df: pd.DataFrame, k_period: int = 14,
                   d_period: int = 3, smooth: int = 3) -> pd.DataFrame:
    """
    Murphy Chapter 10:
    %K = (Close - Lowest Low) / (Highest High - Lowest Low) × 100
    %D = SMA(3) of %K  — the signal line

    Signals:
      > 80 → Overbought
      < 20 → Oversold
      %K crosses above %D in oversold zone → BUY
      %K crosses below %D in overbought zone → SELL
      Divergence with price = early reversal warning
    """
    stoch = ta.momentum.StochasticOscillator(
        high=df["High"], low=df["Low"], close=df["Close"],
        window=k_period, smooth_window=d_period
    )
    df["Stoch_K"] = stoch.stoch()
    df["Stoch_D"] = stoch.stoch_signal()

    # Crossover detection
    df["Stoch_cross"] = "NONE"
    for i in range(1, len(df)):
        k_prev, d_prev = df["Stoch_K"].iloc[i-1], df["Stoch_D"].iloc[i-1]
        k_curr, d_curr = df["Stoch_K"].iloc[i],   df["Stoch_D"].iloc[i]
        if pd.isna(k_prev) or pd.isna(d_prev): continue
        if k_prev < d_prev and k_curr >= d_curr:
            df.iloc[i, df.columns.get_loc("Stoch_cross")] = "BULLISH"
        elif k_prev > d_prev and k_curr <= d_curr:
            df.iloc[i, df.columns.get_loc("Stoch_cross")] = "BEARISH"

    return df


def get_stochastic_signal(df: pd.DataFrame) -> dict:
    """Return latest stochastic reading with signal."""
    if "Stoch_K" not in df.columns:
        df = add_stochastic(df)

    lat   = df.iloc[-1]
    k     = lat.get("Stoch_K")
    d     = lat.get("Stoch_D")
    cross = lat.get("Stoch_cross", "NONE")

    if pd.isna(k):
        return {"signal":"N/A","color":"#aaaaaa","description":"Not enough data","k":None,"d":None}

    if k > 80:
        sig, color = "OVERBOUGHT", "#f75f5f"
        desc = f"Stochastic {k:.0f} — Overbought zone. Watch for %K crossing below %D to sell."
    elif k < 20:
        sig, color = "OVERSOLD", "#3dd68c"
        desc = f"Stochastic {k:.0f} — Oversold zone. Watch for %K crossing above %D to buy."
    elif cross == "BULLISH" and k < 50:
        sig, color = "BUY SIGNAL", "#3dd68c"
        desc = f"Stochastic bullish crossover in lower zone ({k:.0f}) — strong buy signal!"
    elif cross == "BEARISH" and k > 50:
        sig, color = "SELL SIGNAL", "#f75f5f"
        desc = f"Stochastic bearish crossover in upper zone ({k:.0f}) — sell/exit signal!"
    elif k > 50:
        sig, color = "BULLISH", "#7c6af7"
        desc = f"Stochastic {k:.0f} — above 50, bullish momentum."
    else:
        sig, color = "BEARISH", "#f5a623"
        desc = f"Stochastic {k:.0f} — below 50, bearish momentum."

    return {
        "signal": sig, "color": color, "description": desc,
        "k": round(k, 1), "d": round(d, 1) if not pd.isna(d) else None,
        "cross": cross,
    }


# ─────────────────────────────────────────────────────────────────────────────
# MASTER FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def get_candle_oscillator_summary(df: pd.DataFrame) -> dict:
    df2 = add_stochastic(df.copy())
    candles   = detect_candlestick_patterns(df2, lookback=5)
    stoch_sig = get_stochastic_signal(df2)

    bullish = [c for c in candles if c["direction"] == "BULLISH"]
    bearish = [c for c in candles if c["direction"] == "BEARISH"]

    return {
        "candles":      candles,
        "bullish":      bullish,
        "bearish":      bearish,
        "latest":       candles[0] if candles else None,
        "stochastic":   stoch_sig,
        # "df":           df2,
    }
