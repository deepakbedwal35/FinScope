"""
continuation_patterns.py  —  Murphy Chapter 6 + Chapter 4
==========================================================
Continuation Patterns (Chapter 6):
  1. Bull Flag        — brief rectangular consolidation in uptrend
  2. Bear Flag        — brief rectangular consolidation in downtrend
  3. Bull Pennant     — small symmetrical triangle after sharp move up
  4. Bear Pennant     — small symmetrical triangle after sharp move down
  5. Cup & Handle     — rounded bottom + small consolidation (bullish)
  6. Rectangle        — price bounces between two horizontal lines

Support & Resistance (Chapter 4):
  7. Key S/R levels   — previous highs/lows acting as support or resistance
  8. Trendline        — connecting swing highs/lows; break = signal

Golden Cross / Death Cross (Chapter 9):
  9. Golden Cross  — SMA50 crosses above SMA200 (bullish)
  10. Death Cross  — SMA50 crosses below SMA200 (bearish)
"""

import pandas as pd
import numpy as np
from scipy import stats


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _linreg(series: pd.Series):
    x = np.arange(len(series))
    slope, intercept, r, p, se = stats.linregress(x, series.values)
    return slope, intercept, r


def _find_peaks(series, window=4):
    v, peaks = series.values, []
    for i in range(window, len(v)-window):
        if v[i] == max(v[i-window:i+window+1]):
            peaks.append(i)
    return peaks


def _find_troughs(series, window=4):
    v, troughs = series.values, []
    for i in range(window, len(v)-window):
        if v[i] == min(v[i-window:i+window+1]):
            troughs.append(i)
    return troughs


# ─────────────────────────────────────────────────────────────────────────────
# 1. FLAGS & PENNANTS
# ─────────────────────────────────────────────────────────────────────────────

def detect_flags_pennants(df: pd.DataFrame) -> list:
    """
    Murphy rules:
    FLAG:
      - Sharp near-vertical price move (the flagpole) — at least 5-10%
      - Followed by a brief rectangular consolidation (the flag)
        slanting AGAINST the trend
      - Breakout in direction of original move
      - Volume: heavy on pole, light during flag, heavy on breakout
      - Duration: 1–3 weeks

    PENNANT:
      - Same as flag but consolidation is a small symmetrical triangle
        (converging trendlines) instead of parallel channel
      - Duration: 1–3 weeks
    """
    results = []
    data    = df.tail(90).copy().reset_index(drop=True)
    closes  = data["Close"]
    highs   = data["High"]
    lows    = data["Low"]
    vols    = data["Volume"]

    POLE_MIN_PCT    = 5.0    # flagpole must be at least 5% move
    FLAG_MAX_BARS   = 20     # flag/pennant forms in max 20 bars
    FLAG_MIN_BARS   = 5

    for i in range(15, len(data) - FLAG_MIN_BARS):
        # Find sharp move ending at bar i (the pole)
        for pole_start in range(max(0, i-25), i-5):
            pole_move = ((closes.iloc[i] - closes.iloc[pole_start])
                         / closes.iloc[pole_start] * 100)
            pole_bars = i - pole_start
            if abs(pole_move) < POLE_MIN_PCT or pole_bars < 5:
                continue

            is_bull_pole = pole_move > 0
            is_bear_pole = pole_move < 0

            # Pole volume: should be above average
            pole_vol  = vols.iloc[pole_start:i].mean()
            avg_vol   = vols.rolling(20).mean().iloc[i]
            pole_ok   = pole_vol > avg_vol if not pd.isna(avg_vol) else True

            # Flag / pennant: next FLAG_MIN_BARS to FLAG_MAX_BARS bars
            flag_end = min(len(data)-1, i + FLAG_MAX_BARS)
            flag_data = closes.iloc[i:flag_end+1]
            flag_highs = highs.iloc[i:flag_end+1]
            flag_lows  = lows.iloc[i:flag_end+1]
            flag_vols  = vols.iloc[i:flag_end+1]

            if len(flag_data) < FLAG_MIN_BARS:
                continue

            # Flag volume: should be lighter than pole
            flag_vol = flag_vols.mean()
            vol_contract = flag_vol < pole_vol

            # Fit trendlines to flag
            h_slope, h_int, _ = _linreg(flag_highs)
            l_slope, l_int, _ = _linreg(flag_lows)

            price_scale = closes.iloc[i]
            h_norm = h_slope / price_scale
            l_norm = l_slope / price_scale

            # Both lines parallel (flag) or converging (pennant)?
            slope_diff = abs(h_norm - l_norm)
            converging = h_slope > l_slope  # upper falling faster than lower

            is_flag    = slope_diff < 0.002 and abs(h_norm) > 0.0001
            is_pennant = converging and slope_diff >= 0.001

            if not (is_flag or is_pennant):
                continue

            # Flag direction should be AGAINST the pole
            flag_direction_up   = h_slope > 0 and l_slope > 0
            flag_direction_down = h_slope < 0 and l_slope < 0

            if is_bull_pole and not flag_direction_down:
                continue
            if is_bear_pole and not flag_direction_up:
                continue

            # Breakout detection
            current_price = closes.iloc[-1]
            flag_end_price_high = h_int + h_slope * len(flag_data)
            flag_end_price_low  = l_int + l_slope * len(flag_data)
            breakout = current_price > flag_end_price_high if is_bull_pole else current_price < flag_end_price_low

            # Price target: pole height projected from breakout point
            pole_height = abs(closes.iloc[i] - closes.iloc[pole_start])
            breakout_price = flag_end_price_high if is_bull_pole else flag_end_price_low
            target = breakout_price + pole_height if is_bull_pole else breakout_price - pole_height

            ptype = ("BULL_" if is_bull_pole else "BEAR_") + ("FLAG" if is_flag else "PENNANT")
            direction = "BULLISH" if is_bull_pole else "BEARISH"
            emoji_map = {"BULL_FLAG":"🚩🟢","BEAR_FLAG":"🚩🔴","BULL_PENNANT":"📐🟢","BEAR_PENNANT":"📐🔴"}

            conf = 30
            if pole_ok:        conf += 15
            if vol_contract:   conf += 20
            if breakout:       conf += 25
            if abs(pole_move) >= 10: conf += 10

            results.append({
                "name":        ptype,
                "emoji":       emoji_map.get(ptype, "🚩"),
                "direction":   direction,
                "confirmed":   breakout,
                "confidence":  min(conf, 100),
                "desc": (
                    f"{'Bull' if is_bull_pole else 'Bear'} {'Flag' if is_flag else 'Pennant'}: "
                    f"Pole {pole_move:+.1f}% in {pole_bars} bars. "
                    f"{'⚡ Breakout confirmed!' if breakout else 'Consolidating — watch for breakout.'}"
                ),
                "trade_note":  f"Enter on breakout. Target: ₹{target:.1f} (pole height projected).",
                "pole_move":   round(pole_move, 2),
                "pole_bars":   pole_bars,
                "vol_ok":      vol_contract,
                "price_target":round(target, 2),
                "bars_formed": len(flag_data),
                "neckline":    round(breakout_price, 2),
            })
            break   # one pattern per pole

    return results


# ─────────────────────────────────────────────────────────────────────────────
# 2. CUP & HANDLE
# ─────────────────────────────────────────────────────────────────────────────

def detect_cup_and_handle(df: pd.DataFrame) -> list:
    """
    Murphy / O'Neil rules:
      - Cup: rounded U-shaped bottom (not V-shaped) over 7 weeks to 65 weeks
      - Handle: small downward drift (flag) on right side of cup, < 15% decline
      - Volume: diminishes through cup, surges on breakout
      - Breakout: price closes above the cup rim (resistance)
    """
    results = []
    data    = df.tail(250).copy().reset_index(drop=True)
    closes  = data["Close"]
    highs   = data["High"]
    vols    = data["Volume"]

    if len(data) < 60:
        return results

    # Scan for cup pattern: look for a high, a decline, a trough, recovery back to high
    peaks = _find_peaks(highs, window=10)

    for i in range(len(peaks) - 1):
        cup_left  = peaks[i]
        cup_right_candidates = [p for p in peaks if cup_left + 30 < p < cup_left + 200]

        for cup_right in cup_right_candidates:
            left_price  = highs.iloc[cup_left]
            right_price = highs.iloc[cup_right]

            # Both sides of cup should be roughly equal height
            if abs(left_price - right_price) / left_price > 0.10:
                continue

            # Find the bottom of the cup
            cup_segment = closes.iloc[cup_left:cup_right+1]
            bottom_idx  = cup_segment.idxmin()
            bottom_price = closes.iloc[bottom_idx]

            # Cup depth: should be 15%–50% decline from rim
            cup_depth = (left_price - bottom_price) / left_price * 100
            if not (10 <= cup_depth <= 50):
                continue

            # Cup should be U-shaped (rounded), not V-shaped
            # Check by seeing if bottom portion is relatively flat
            bottom_region = closes.iloc[max(cup_left, bottom_idx-5):bottom_idx+6]
            bottom_range  = (bottom_region.max() - bottom_region.min()) / bottom_price * 100
            is_rounded    = bottom_range < 15.0

            if not is_rounded:
                continue

            # Handle: small consolidation after right rim
            handle_start = cup_right
            handle_end   = min(len(data)-1, cup_right + 25)
            if handle_end <= handle_start + 3:
                continue

            handle_segment = closes.iloc[handle_start:handle_end+1]
            handle_decline = (handle_segment.max() - handle_segment.min()) / handle_segment.max() * 100
            if handle_decline > 15:
                continue   # handle too deep

            # Handle should trend slightly downward
            h_slope, _, _ = _linreg(handle_segment)
            handle_drift_down = h_slope < 0

            # Current price vs cup rim
            rim_price     = max(left_price, right_price)
            current_price = closes.iloc[-1]
            confirmed     = current_price > rim_price

            # Volume: check if it increased on cup right side
            vol_left  = vols.iloc[cup_left:cup_left+5].mean()
            vol_right = vols.iloc[cup_right:cup_right+5].mean()
            vol_ok    = vol_right >= vol_left

            # Target: cup depth projected above breakout
            target = rim_price + (left_price - bottom_price)

            conf = 35
            if is_rounded:       conf += 20
            if handle_drift_down:conf += 15
            if confirmed:        conf += 25
            if vol_ok:           conf += 5

            results.append({
                "name":        "CUP_AND_HANDLE",
                "emoji":       "☕",
                "direction":   "BULLISH",
                "confirmed":   confirmed,
                "confidence":  min(conf, 100),
                "desc": (
                    f"Cup & Handle: Rim ≈₹{rim_price:.1f} | Bottom ≈₹{bottom_price:.1f} | "
                    f"Depth {cup_depth:.1f}%\n"
                    f"{' BREAKOUT above rim!' if confirmed else f'Handle forming — buy on break above ₹{rim_price:.1f}'}"
                ),
                "trade_note":  f"Buy on close above ₹{rim_price:.1f}. Target ₹{target:.1f}. SL: below handle low.",
                "neckline":    round(rim_price, 2),
                "price_target":round(target, 2),
                "cup_depth":   round(cup_depth, 2),
                "vol_ok":      vol_ok,
                "bars_formed": cup_right - cup_left,
            })
            break

    return results[:2]   # return best 2 at most


# ─────────────────────────────────────────────────────────────────────────────
# 3. RECTANGLE PATTERN
# ─────────────────────────────────────────────────────────────────────────────

def detect_rectangle(df: pd.DataFrame, tolerance: float = 2.0) -> list:
    """
    Murphy: Rectangle = price oscillates between two horizontal lines.
    - At least 2 touches of top AND 2 touches of bottom
    - Both lines must be roughly horizontal
    - Breakout in either direction = start of new move
    """
    results = []
    data    = df.tail(80).copy().reset_index(drop=True)
    closes  = data["Close"]
    highs   = data["High"]
    lows    = data["Low"]

    peaks   = _find_peaks(highs, window=4)
    troughs = _find_troughs(lows, window=4)

    if len(peaks) < 2 or len(troughs) < 2:
        return results

    top_prices = highs.iloc[peaks[-4:]].values if len(peaks) >= 4 else highs.iloc[peaks].values
    bot_prices = lows.iloc[troughs[-4:]].values if len(troughs) >= 4 else lows.iloc[troughs].values

    top_range = (top_prices.max() - top_prices.min()) / top_prices.mean() * 100
    bot_range = (bot_prices.max() - bot_prices.min()) / bot_prices.mean() * 100

    if top_range > tolerance or bot_range > tolerance:
        return results

    resistance = top_prices.mean()
    support    = bot_prices.mean()
    height     = resistance - support
    height_pct = height / support * 100

    if height_pct < 3:   # too tight to be meaningful
        return results

    current = closes.iloc[-1]
    breakout_up   = current > resistance * 1.005
    breakout_down = current < support * 0.995

    conf = 40
    if len(peaks) >= 4:   conf += 20
    if breakout_up or breakout_down: conf += 30

    direction = "BULLISH" if breakout_up else "BEARISH" if breakout_down else "NEUTRAL"
    target = resistance + height if breakout_up else support - height

    results.append({
        "name":       "RECTANGLE",
        "emoji":      "▭",
        "direction":  direction,
        "confirmed":  breakout_up or breakout_down,
        "confidence": min(conf, 100),
        "desc":(
            f"Rectangle: Resistance ≈₹{resistance:.1f} | Support ≈₹{support:.1f} | Height {height_pct:.1f}%\n"
            + ("⚡ BREAKOUT UP!" if breakout_up else "⚡ BREAKDOWN!" if breakout_down
               else "Ranging — wait for breakout")
        ),
        "trade_note": f"Buy above ₹{resistance:.1f} or short below ₹{support:.1f}. Target ₹{target:.1f}.",
        "neckline":   round(resistance if breakout_up else support, 2),
        "price_target":round(target, 2),
        "resistance": round(resistance, 2),
        "support":    round(support, 2),
        "vol_ok":     True,
        "bars_formed":len(data),
    })
    return results


# ─────────────────────────────────────────────────────────────────────────────
# 4. SUPPORT & RESISTANCE LEVELS  (Chapter 4)
# ─────────────────────────────────────────────────────────────────────────────

def get_support_resistance(df: pd.DataFrame, n_levels: int = 5,
                            window: int = 10) -> dict:
    """
    Murphy Chapter 4:
      - Previous highs become resistance; previous lows become support
      - The more times a level is tested, the more significant it is
      - Support broken becomes resistance (role reversal) and vice versa
      - Round numbers act as psychological S/R
    """
    data     = df.tail(252).copy().reset_index(drop=True)
    highs    = data["High"]
    lows     = data["Low"]
    closes   = data["Close"]
    current  = closes.iloc[-1]

    peaks   = _find_peaks(highs, window)
    troughs = _find_troughs(lows, window)

    # Cluster nearby levels
    all_levels = (
        [(highs.iloc[p], "resistance") for p in peaks] +
        [(lows.iloc[t],  "support")    for t in troughs]
    )

    # Group levels within 1% of each other
    cluster_pct = 0.015
    clusters = []
    for price, level_type in all_levels:
        merged = False
        for c in clusters:
            if abs(price - c["price"]) / c["price"] < cluster_pct:
                c["touches"] += 1
                c["price"] = (c["price"] * (c["touches"]-1) + price) / c["touches"]
                if level_type == "resistance":
                    c["resistance_count"] += 1
                else:
                    c["support_count"] += 1
                merged = True
                break
        if not merged:
            clusters.append({
                "price": price,
                "touches": 1,
                "resistance_count": 1 if level_type == "resistance" else 0,
                "support_count":    1 if level_type == "support"    else 0,
            })

    # Sort by significance (touches)
    clusters.sort(key=lambda x: x["touches"], reverse=True)

    # Classify relative to current price
    resistance_levels = []
    support_levels    = []

    for c in clusters:
        p = c["price"]
        strength = "STRONG" if c["touches"] >= 3 else "MODERATE" if c["touches"] == 2 else "WEAK"
        entry = {
            "price":    round(p, 2),
            "touches":  c["touches"],
            "strength": strength,
            "dist_pct": round((p - current) / current * 100, 1),
        }
        if p > current * 1.005:
            resistance_levels.append(entry)
        elif p < current * 0.995:
            support_levels.append(entry)

    resistance_levels.sort(key=lambda x: x["price"])   # nearest first
    support_levels.sort(key=lambda x: x["price"], reverse=True)

    # Nearest S/R
    nearest_resistance = resistance_levels[0] if resistance_levels else None
    nearest_support    = support_levels[0]    if support_levels    else None

    return {
        "resistance":        resistance_levels[:n_levels],
        "support":           support_levels[:n_levels],
        "nearest_resistance":nearest_resistance,
        "nearest_support":   nearest_support,
        "current_price":     round(current, 2),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. TRENDLINE ANALYSIS  (Chapter 4)
# ─────────────────────────────────────────────────────────────────────────────

def get_trendline_analysis(df: pd.DataFrame) -> dict:
    """
    Murphy: Trendlines connect successive lows (uptrend) or highs (downtrend).
    - The more times tested, the more significant
    - A close BELOW the uptrend line = warning signal
    - A close ABOVE the downtrend line = warning signal
    - Fan principle: 3 trendlines broken = major trend reversal
    """
    data    = df.tail(120).copy().reset_index(drop=True)
    highs   = data["High"]
    lows    = data["Low"]
    closes  = data["Close"]
    current = closes.iloc[-1]

    peaks   = _find_peaks(highs, window=6)
    troughs = _find_troughs(lows, window=6)

    result = {
        "uptrend_line":   None,
        "downtrend_line": None,
        "uptrend_broken": False,
        "downtrend_broken": False,
        "signal":         "NEUTRAL",
        "description":    "Insufficient data for trendline analysis",
    }

    # ── UPTREND LINE (connect last 2 swing lows) ──
    if len(troughs) >= 2:
        t1, t2 = troughs[-2], troughs[-1]
        p1, p2 = lows.iloc[t1], lows.iloc[t2]
        slope  = (p2 - p1) / (t2 - t1)
        tl_now = p1 + slope * (len(data) - 1 - t1)

        touches = sum(1 for i in range(t1, len(data))
                      if abs(lows.iloc[i] - (p1 + slope*(i-t1))) / p1 < 0.02)

        broken  = current < tl_now * 0.995
        result["uptrend_line"] = {
            "slope":   round(slope, 4),
            "value_now": round(tl_now, 2),
            "touches":   touches,
            "broken":    broken,
            "ascending": slope > 0,
        }
        if broken and slope > 0:
            result["uptrend_broken"] = True
            result["signal"] = "UPTREND BROKEN — Caution"
            result["description"] = f"Price closed below rising trendline (₹{tl_now:.1f}). Possible reversal."

    # ── DOWNTREND LINE (connect last 2 swing highs) ──
    if len(peaks) >= 2:
        p1i, p2i = peaks[-2], peaks[-1]
        pr1, pr2 = highs.iloc[p1i], highs.iloc[p2i]
        slope    = (pr2 - pr1) / (p2i - p1i)
        tl_now   = pr1 + slope * (len(data) - 1 - p1i)

        broken  = current > tl_now * 1.005
        result["downtrend_line"] = {
            "slope":     round(slope, 4),
            "value_now": round(tl_now, 2),
            "touches":   2,
            "broken":    broken,
            "descending":slope < 0,
        }
        if broken and slope < 0:
            result["downtrend_broken"] = True
            result["signal"] = "DOWNTREND BROKEN — Bullish"
            result["description"] = f"Price closed above falling trendline (₹{tl_now:.1f}). Bullish breakout signal."

    if result["uptrend_broken"] is False and result["downtrend_broken"] is False:
        if result["uptrend_line"] and result["uptrend_line"]["ascending"]:
            result["signal"] = "UPTREND INTACT"
            result["description"] = f"Rising trendline support at ₹{result['uptrend_line']['value_now']}"
        elif result["downtrend_line"] and result["downtrend_line"]["descending"]:
            result["signal"] = "DOWNTREND INTACT"
            result["description"] = f"Falling trendline resistance at ₹{result['downtrend_line']['value_now']}"

    return result


# ─────────────────────────────────────────────────────────────────────────────
# 6. GOLDEN CROSS / DEATH CROSS  (Chapter 9)
# ─────────────────────────────────────────────────────────────────────────────

def get_ma_crosses(df: pd.DataFrame) -> dict:
    """
    Golden Cross : SMA50 crosses ABOVE SMA200 — major bull signal
    Death Cross  : SMA50 crosses BELOW SMA200 — major bear signal

    Murphy: These are among the most reliable long-term signals.
    Also check: SMA20 vs SMA50 for medium-term crosses.
    """
    data   = df.copy()
    ma50   = data["Close"].rolling(50).mean()
    ma200  = data["Close"].rolling(200).mean()
    ma20   = data["Close"].rolling(20).mean()

    result = {
        "golden_cross":      False,
        "death_cross":       False,
        "golden_cross_date": None,
        "death_cross_date":  None,
        "ma50_above_ma200":  False,
        "ma20_above_ma50":   False,
        "signal":            "NEUTRAL",
        "color":             "#aaaaaa",
        "description":       "",
        "medium_term_cross": "NEUTRAL",
    }

    if ma200.isna().all() or ma50.isna().all():
        return result

    # Current positions
    result["ma50_above_ma200"] = float(ma50.iloc[-1]) > float(ma200.iloc[-1])
    result["ma20_above_ma50"]  = float(ma20.iloc[-1]) > float(ma50.iloc[-1])

    # Scan for recent crosses (last 30 bars)
    lookback = min(30, len(data)-1)
    for i in range(len(data)-lookback, len(data)-1):
        if pd.isna(ma50.iloc[i]) or pd.isna(ma200.iloc[i]):
            continue
        prev_diff = ma50.iloc[i]   - ma200.iloc[i]
        curr_diff = ma50.iloc[i+1] - ma200.iloc[i+1]
        if prev_diff < 0 and curr_diff >= 0:
            result["golden_cross"]      = True
            result["golden_cross_date"] = str(data.index[i+1])[:10]
        elif prev_diff > 0 and curr_diff <= 0:
            result["death_cross"]      = True
            result["death_cross_date"] = str(data.index[i+1])[:10]

    # Medium-term cross (MA20 vs MA50)
    for i in range(len(data)-lookback, len(data)-1):
        if pd.isna(ma20.iloc[i]) or pd.isna(ma50.iloc[i]):
            continue
        prev = ma20.iloc[i]   - ma50.iloc[i]
        curr = ma20.iloc[i+1] - ma50.iloc[i+1]
        if prev < 0 and curr >= 0:
            result["medium_term_cross"] = "BULLISH CROSS (MA20 > MA50)"
        elif prev > 0 and curr <= 0:
            result["medium_term_cross"] = "BEARISH CROSS (MA20 < MA50)"

    # Signal
    if result["golden_cross"]:
        result["signal"]      = "🌟 GOLDEN CROSS"
        result["color"]       = "#3dd68c"
        result["description"] = f"Golden Cross on {result['golden_cross_date']} — SMA50 crossed above SMA200. Major bull signal."
    elif result["death_cross"]:
        result["signal"]      = "💀 DEATH CROSS"
        result["color"]       = "#f75f5f"
        result["description"] = f"Death Cross on {result['death_cross_date']} — SMA50 crossed below SMA200. Major bear signal."
    elif result["ma50_above_ma200"]:
        result["signal"]      = "BULLISH ALIGNMENT"
        result["color"]       = "#7c6af7"
        result["description"] = "SMA50 above SMA200 — long-term bullish trend in place."
    else:
        result["signal"]      = "BEARISH ALIGNMENT"
        result["color"]       = "#f75f5f"
        result["description"] = "SMA50 below SMA200 — long-term bearish trend."

    return result


# ─────────────────────────────────────────────────────────────────────────────
# MASTER FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def get_continuation_summary(df: pd.DataFrame) -> dict:
    flags    = detect_flags_pennants(df)
    cup      = detect_cup_and_handle(df)
    rect     = detect_rectangle(df)
    sr       = get_support_resistance(df)
    tl       = get_trendline_analysis(df)
    ma_cross = get_ma_crosses(df)

    all_patterns = flags + cup + rect
    all_patterns = [patterns for patterns in all_patterns if patterns["confidence"] > 50]
    all_patterns.sort(key=lambda x: x["confidence"], reverse=True)

    return {
        "patterns":    all_patterns,
        "found":       len(all_patterns) > 0,
        "best":        all_patterns[0] if all_patterns else None,
        "sr":          sr,
        "trendlines":  tl,
        "ma_crosses":  ma_cross,
    }
