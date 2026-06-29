

import pandas as pd
import numpy as np
from scipy import stats



def _find_peaks(series: pd.Series, window: int = 5):
    """Return indices of local maxima."""
    vals = series.values
    peaks = []
    for i in range(window, len(vals) - window):
        if vals[i] == max(vals[i - window: i + window + 1]):
            peaks.append(i)
    return peaks


def _find_troughs(series: pd.Series, window: int = 5):
    """Return indices of local minima."""
    vals = series.values
    troughs = []
    for i in range(window, len(vals) - window):
        if vals[i] == min(vals[i - window: i + window + 1]):
            troughs.append(i)
    return troughs


def _pct_diff(a, b):
    return abs(a - b) / ((a + b) / 2) * 100


# ─────────────────────────────────────────────────────────────────────────────
# 1. HEAD & SHOULDERS
# ─────────────────────────────────────────────────────────────────────────────

def detect_head_and_shoulders(df: pd.DataFrame, window: int = 5,
                                tolerance: float = 3.0) -> list:
    """
    Murphy rules:
      - Left shoulder, Head (higher than both shoulders), Right shoulder
      - Left & right shoulders roughly equal height (within tolerance %)
      - Neckline connects the two troughs between shoulders
      - Volume: heavier on left shoulder, lighter on head, lightest on right
      - Confirmation: close below neckline
      - Price target: distance from head to neckline, projected downward

    Also detects INVERSE H&S (bullish) by flipping highs/lows.
    """
    results = []
    data = df.tail(150).copy().reset_index(drop=True)
    closes = data["Close"]
    highs  = data["High"]
    lows   = data["Low"]
    vols   = data["Volume"]

    # ── REGULAR H&S (Bearish) ──
    peaks   = _find_peaks(highs, window)
    troughs = _find_troughs(lows, window)

    for i in range(len(peaks) - 2):
        ls_idx = peaks[i]
        h_idx  = peaks[i + 1]
        rs_idx = peaks[i + 2]

        ls_price = highs.iloc[ls_idx]
        h_price  = highs.iloc[h_idx]
        rs_price = highs.iloc[rs_idx]

        # Head must be higher than both shoulders
        if not (h_price > ls_price and h_price > rs_price):
            continue

        # Shoulders must be roughly equal
        if _pct_diff(ls_price, rs_price) > tolerance:
            continue

        # Find neckline troughs between shoulders
        between_ls_h  = [t for t in troughs if ls_idx < t < h_idx]
        between_h_rs  = [t for t in troughs if h_idx  < t < rs_idx]
        if not between_ls_h or not between_h_rs:
            continue

        nl1_idx = between_ls_h[-1]
        nl2_idx = between_h_rs[0]
        nl1_price = lows.iloc[nl1_idx]
        nl2_price = lows.iloc[nl2_idx]

        # Neckline slope
        nl_slope = (nl2_price - nl1_price) / (nl2_idx - nl1_idx) if nl2_idx != nl1_idx else 0
        neckline_at_rs = nl1_price + nl_slope * (rs_idx - nl1_idx)
        neckline_now   = nl1_price + nl_slope * (len(data) - 1 - nl1_idx)

        # Confirmation: has price broken below neckline?
        current_price = closes.iloc[-1]
        confirmed = current_price < neckline_now

        # Volume check (Murphy: declining volume pattern)
        vol_ls = vols.iloc[max(0, ls_idx-2):ls_idx+3].mean()
        vol_h  = vols.iloc[max(0, h_idx-2):h_idx+3].mean()
        vol_rs = vols.iloc[max(0, rs_idx-2):rs_idx+3].mean()
        vol_pattern_ok = vol_ls > vol_h > vol_rs

        # Price target (Murphy: head-to-neckline distance projected down)
        head_to_neckline = h_price - neckline_at_rs
        price_target = neckline_now - head_to_neckline

        # Confidence
        conf = 30
        if vol_pattern_ok:  conf += 25
        if confirmed:       conf += 30
        if _pct_diff(ls_price, rs_price) < 1.5: conf += 15

        results.append({
            "name":          "HEAD_AND_SHOULDERS",
            "emoji":         "👤",
            "direction":     "BEARISH",
            "confirmed":     confirmed,
            "confidence":    min(conf, 100),
            "desc":   (
                f"Head & Shoulders Top: LS=₹{ls_price:.1f} | Head=₹{h_price:.1f} | RS=₹{rs_price:.1f}\n"
                f"Neckline ≈ ₹{neckline_now:.1f} | {'⚡ CONFIRMED BREAK!' if confirmed else 'Watching for neckline break'}"
            ),
            "trade_note":    f"Sell on close below neckline ₹{neckline_now:.1f}. Target: ₹{price_target:.1f}",
            "neckline":      round(neckline_now, 2),
            "price_target":  round(price_target, 2),
            "ls_price":      round(ls_price, 2),
            "head_price":    round(h_price, 2),
            "rs_price":      round(rs_price, 2),
            "vol_ok":        vol_pattern_ok,
            "bars_formed":   rs_idx - ls_idx,
        })

    # ── INVERSE H&S (Bullish) ──
    troughs2 = _find_troughs(lows, window)
    peaks2   = _find_peaks(highs, window)

    for i in range(len(troughs2) - 2):
        ls_idx = troughs2[i]
        h_idx  = troughs2[i + 1]
        rs_idx = troughs2[i + 2]

        ls_price = lows.iloc[ls_idx]
        h_price  = lows.iloc[h_idx]   # head is the LOWEST trough
        rs_price = lows.iloc[rs_idx]

        if not (h_price < ls_price and h_price < rs_price):
            continue
        if _pct_diff(ls_price, rs_price) > tolerance:
            continue

        between_ls_h = [p for p in peaks2 if ls_idx < p < h_idx]
        between_h_rs = [p for p in peaks2 if h_idx  < p < rs_idx]
        if not between_ls_h or not between_h_rs:
            continue

        nl1_idx = between_ls_h[-1]
        nl2_idx = between_h_rs[0]
        nl1_price = highs.iloc[nl1_idx]
        nl2_price = highs.iloc[nl2_idx]

        nl_slope     = (nl2_price - nl1_price) / (nl2_idx - nl1_idx) if nl2_idx != nl1_idx else 0
        neckline_now = nl1_price + nl_slope * (len(data) - 1 - nl1_idx)
        current_price = closes.iloc[-1]
        confirmed = current_price > neckline_now

        head_to_neckline = neckline_now - h_price
        price_target = neckline_now + head_to_neckline

        conf = 30
        if confirmed: conf += 35
        if _pct_diff(ls_price, rs_price) < 1.5: conf += 20
        conf = min(conf, 100)

        results.append({
            "name":         "INVERSE_HEAD_AND_SHOULDERS",
            "emoji":        "🙃",
            "direction":    "BULLISH",
            "confirmed":    confirmed,
            "confidence":   conf,
            "desc":  (
                f"Inverse H&S: LS=₹{ls_price:.1f} | Head=₹{h_price:.1f} | RS=₹{rs_price:.1f}\n"
                f"Neckline ≈ ₹{neckline_now:.1f} | {'⚡ CONFIRMED BREAK!' if confirmed else 'Watching for neckline breakout'}"
            ),
            "trade_note":   f"Buy on close above neckline ₹{neckline_now:.1f}. Target: ₹{price_target:.1f}",
            "neckline":     round(neckline_now, 2),
            "price_target": round(price_target, 2),
            "ls_price":     round(ls_price, 2),
            "head_price":   round(h_price, 2),
            "rs_price":     round(rs_price, 2),
            "vol_ok":       False,
            "bars_formed":  rs_idx - ls_idx,
        })

    return results


# ─────────────────────────────────────────────────────────────────────────────
# 2. DOUBLE TOP / DOUBLE BOTTOM
# ─────────────────────────────────────────────────────────────────────────────

def detect_double_top_bottom(df: pd.DataFrame, window: int = 5,
                               tolerance: float = 2.0) -> list:
    """
    Murphy rules:
      Double Top (M): Two peaks at roughly the same level separated by a trough.
        - Peaks within tolerance% of each other
        - Separated by at least 4 weeks (20 bars)
        - Confirmed on close below the valley between the two peaks
        - Volume: usually higher on first peak

      Double Bottom (W): Mirror image — two troughs at roughly same level.
        - Confirmed on close above the peak between the two troughs
    """
    results = []
    data   = df.tail(150).copy().reset_index(drop=True)
    closes = data["Close"]
    highs  = data["High"]
    lows   = data["Low"]
    vols   = data["Volume"]

    peaks   = _find_peaks(highs, window)
    troughs = _find_troughs(lows, window)

    MIN_SEPARATION = 15   # at least 15 bars between peaks (Murphy: 4 weeks)

    # ── DOUBLE TOP ──
    for i in range(len(peaks) - 1):
        p1, p2 = peaks[i], peaks[i + 1]
        if p2 - p1 < MIN_SEPARATION:
            continue

        price1 = highs.iloc[p1]
        price2 = highs.iloc[p2]

        if _pct_diff(price1, price2) > tolerance:
            continue

        # Valley between peaks
        valley_candidates = [t for t in troughs if p1 < t < p2]
        if not valley_candidates:
            continue
        valley_idx   = valley_candidates[0]
        valley_price = lows.iloc[valley_idx]

        # Confirmation
        current = closes.iloc[-1]
        confirmed = current < valley_price

        # Volume: first peak higher
        vol1 = vols.iloc[max(0,p1-2):p1+3].mean()
        vol2 = vols.iloc[max(0,p2-2):p2+3].mean()
        vol_ok = vol1 > vol2

        # Target (Murphy: height of pattern projected down)
        pattern_height = ((price1 + price2) / 2) - valley_price
        target = valley_price - pattern_height

        conf = 30
        if confirmed: conf += 35
        if vol_ok:    conf += 20
        if _pct_diff(price1, price2) < 1.0: conf += 15

        results.append({
            "name":         "DOUBLE_TOP",
            "emoji":        "Ⓜ️",
            "direction":    "BEARISH",
            "confirmed":    confirmed,
            "confidence":   min(conf, 100),
            "desc":  (
                f"Double Top (M): Peak1=₹{price1:.1f} | Peak2=₹{price2:.1f} | "
                f"Valley=₹{valley_price:.1f}\n"
                f"{'⚡ CONFIRMED — price below valley!' if confirmed else f'Watch for break below ₹{valley_price:.1f}'}"
            ),
            "trade_note":   f"Sell below ₹{valley_price:.1f}. Target: ₹{target:.1f}",
            "neckline":     round(valley_price, 2),
            "price_target": round(target, 2),
            "peak1":        round(price1, 2),
            "peak2":        round(price2, 2),
            "vol_ok":       vol_ok,
            "bars_formed":  p2 - p1,
        })

    # ── DOUBLE BOTTOM ──
    for i in range(len(troughs) - 1):
        t1, t2 = troughs[i], troughs[i + 1]
        if t2 - t1 < MIN_SEPARATION:
            continue

        price1 = lows.iloc[t1]
        price2 = lows.iloc[t2]

        if _pct_diff(price1, price2) > tolerance:
            continue

        peak_candidates = [p for p in peaks if t1 < p < t2]
        if not peak_candidates:
            continue
        peak_idx   = peak_candidates[0]
        peak_price = highs.iloc[peak_idx]

        current   = closes.iloc[-1]
        confirmed = current > peak_price

        pattern_height = peak_price - ((price1 + price2) / 2)
        target = peak_price + pattern_height

        conf = 30
        if confirmed: conf += 35
        if _pct_diff(price1, price2) < 1.0: conf += 20

        results.append({
            "name":         "DOUBLE_BOTTOM",
            "emoji":        "Ⓦ",
            "direction":    "BULLISH",
            "confirmed":    confirmed,
            "confidence":   min(conf, 100),
            "desc":  (
                f"Double Bottom (W): Trough1=₹{price1:.1f} | Trough2=₹{price2:.1f} | "
                f"Peak=₹{peak_price:.1f}\n"
                f"{'⚡ CONFIRMED — price above peak!' if confirmed else f'Watch for break above ₹{peak_price:.1f}'}"
            ),
            "trade_note":   f"Buy above ₹{peak_price:.1f}. Target: ₹{target:.1f}",
            "neckline":     round(peak_price, 2),
            "price_target": round(target, 2),
            "trough1":      round(price1, 2),
            "trough2":      round(price2, 2),
            "vol_ok":       True,
            "bars_formed":  t2 - t1,
        })

    return results


# ─────────────────────────────────────────────────────────────────────────────
# 3. TRIPLE TOP / TRIPLE BOTTOM
# ─────────────────────────────────────────────────────────────────────────────

def detect_triple_top_bottom(df: pd.DataFrame, window: int = 5,
                               tolerance: float = 2.5) -> list:
    """
    Murphy: Triple top/bottom is a stronger version of double top/bottom.
    Three roughly equal highs (or lows) with volume declining on each attempt.
    """
    results = []
    data   = df.tail(200).copy().reset_index(drop=True)
    highs  = data["High"]
    lows   = data["Low"]
    closes = data["Close"]

    peaks   = _find_peaks(highs, window)
    troughs = _find_troughs(lows, window)
    MIN_SEP = 10

    # ── TRIPLE TOP ──
    for i in range(len(peaks) - 2):
        p1, p2, p3 = peaks[i], peaks[i+1], peaks[i+2]
        if (p2 - p1 < MIN_SEP) or (p3 - p2 < MIN_SEP):
            continue
        pr1, pr2, pr3 = highs.iloc[p1], highs.iloc[p2], highs.iloc[p3]
        if _pct_diff(pr1, pr2) > tolerance or _pct_diff(pr2, pr3) > tolerance:
            continue

        valleys = [t for t in troughs if p1 < t < p3]
        if len(valleys) < 2:
            continue
        support = lows.iloc[valleys].min()
        current = closes.iloc[-1]
        confirmed = current < support
        target = support - ((((pr1+pr2+pr3)/3) - support))

        results.append({
            "name":        "TRIPLE_TOP",
            "emoji":       "⛰️⛰️⛰️",
            "direction":   "BEARISH",
            "confirmed":   confirmed,
            "confidence":  70 if confirmed else 45,
            "desc": f"Triple Top at ≈₹{((pr1+pr2+pr3)/3):.1f} | Support ₹{support:.1f} | {'⚡ BREAKDOWN!' if confirmed else 'Watching'}",
            "trade_note":  f"Sell below ₹{support:.1f}. Target ₹{target:.1f}",
            "neckline":    round(support, 2),
            "price_target":round(target, 2),
            "vol_ok":      True,
            "bars_formed": p3 - p1,
        })

    # ── TRIPLE BOTTOM ──
    for i in range(len(troughs) - 2):
        t1, t2, t3 = troughs[i], troughs[i+1], troughs[i+2]
        if (t2 - t1 < MIN_SEP) or (t3 - t2 < MIN_SEP):
            continue
        pr1, pr2, pr3 = lows.iloc[t1], lows.iloc[t2], lows.iloc[t3]
        if _pct_diff(pr1, pr2) > tolerance or _pct_diff(pr2, pr3) > tolerance:
            continue

        resistance_peaks = [p for p in peaks if t1 < p < t3]
        if not resistance_peaks:
            continue
        resistance = highs.iloc[resistance_peaks].max()
        current    = closes.iloc[-1]
        confirmed  = current > resistance
        target     = resistance + (resistance - ((pr1+pr2+pr3)/3))

        results.append({
            "name":        "TRIPLE_BOTTOM",
            "emoji":       "🏔️🏔️🏔️",
            "direction":   "BULLISH",
            "confirmed":   confirmed,
            "confidence":  70 if confirmed else 45,
            "desc": f"Triple Bottom at ≈₹{((pr1+pr2+pr3)/3):.1f} | Resistance ₹{resistance:.1f} | {'⚡ BREAKOUT!' if confirmed else 'Watching'}",
            "trade_note":  f"Buy above ₹{resistance:.1f}. Target ₹{target:.1f}",
            "neckline":    round(resistance, 2),
            "price_target":round(target, 2),
            "vol_ok":      True,
            "bars_formed": t3 - t1,
        })

    return results


# ─────────────────────────────────────────────────────────────────────────────
# 4. GAP ANALYSIS  (Murphy Chapter 5 / 7)
# ─────────────────────────────────────────────────────────────────────────────

def detect_gaps(df: pd.DataFrame, min_gap_pct: float = 0.5) -> list:
    """
    Murphy's 4 gap types:

    Common Gap    : fills within a few days, no trend significance
    Breakaway Gap : occurs at end of consolidation, starts new trend
                    — confirmed by high volume, gap rarely fills quickly
    Runaway Gap   : occurs mid-trend during rapid price movement
                    — also called 'measuring gap' (marks halfway point)
    Exhaustion Gap: occurs near end of trend, high volume, gap fills quickly
                    — warning sign of trend reversal

    Detection logic:
      - Gap Up:   today's Low > yesterday's High
      - Gap Down: today's High < yesterday's Low
      - Classify by context (trend + volume + position in trend)
    """
    results = []
    data = df.tail(60).copy().reset_index(drop=True)

    ma20  = data["Close"].rolling(20).mean()
    ma50  = data["Close"].rolling(50).mean()
    vol20 = data["Volume"].rolling(20).mean()

    for i in range(1, len(data)):
        prev_high  = data["High"].iloc[i-1]
        prev_low   = data["Low"].iloc[i-1]
        curr_low   = data["Low"].iloc[i]
        curr_high  = data["High"].iloc[i]
        curr_close = data["Close"].iloc[i]
        curr_vol   = data["Volume"].iloc[i]
        avg_vol    = vol20.iloc[i] if not pd.isna(vol20.iloc[i]) else curr_vol

        gap_up   = curr_low > prev_high
        gap_down = curr_high < prev_low

        if not (gap_up or gap_down):
            continue

        # Gap size
        if gap_up:
            gap_size = (curr_low - prev_high) / prev_high * 100
        else:
            gap_size = (prev_low - curr_high) / prev_low * 100

        if gap_size < min_gap_pct:
            continue

        direction = "UP" if gap_up else "DOWN"
        vol_ratio = curr_vol / avg_vol if avg_vol > 0 else 1.0

        # Is this gap recent (last 5 bars)?
        is_recent = i >= len(data) - 5

        # Context for classification
        in_uptrend   = (not pd.isna(ma20.iloc[i]) and not pd.isna(ma50.iloc[i])
                        and data["Close"].iloc[i] > ma20.iloc[i] > ma50.iloc[i])
        in_downtrend = (not pd.isna(ma20.iloc[i]) and not pd.isna(ma50.iloc[i])
                        and data["Close"].iloc[i] < ma20.iloc[i] < ma50.iloc[i])

        # Check if gap has been filled
        gap_filled = False
        if gap_up and i < len(data) - 1:
            subsequent_lows = data["Low"].iloc[i+1:]
            gap_filled = subsequent_lows.min() <= prev_high
        elif gap_down and i < len(data) - 1:
            subsequent_highs = data["High"].iloc[i+1:]
            gap_filled = subsequent_highs.max() >= prev_low

        # ── Classify ──
        if gap_filled:
            gap_type = "COMMON_GAP"
            emoji    = "⬜"
            sig      = "LOW"
            desc     = f"Common Gap ({direction}) — already filled. No trend significance."
            color    = "#6b6b80"
        elif vol_ratio >= 2.0 and not in_uptrend and not in_downtrend:
            gap_type = "BREAKAWAY_GAP"
            emoji    = "🚀" if gap_up else "💥"
            sig      = "HIGH"
            desc     = (f"Breakaway Gap ({direction}) — high volume ({vol_ratio:.1f}x), "
                        f"gap size {gap_size:.1f}%. New trend starting! Rarely fills quickly.")
            color    = "#3dd68c" if gap_up else "#f75f5f"
        elif vol_ratio >= 1.5 and (in_uptrend and gap_up or in_downtrend and gap_down):
            gap_type = "RUNAWAY_GAP"
            emoji    = "⚡"
            sig      = "MEDIUM"
            desc     = (f"Runaway/Measuring Gap ({direction}) — mid-trend continuation. "
                        f"Gap size {gap_size:.1f}%. May mark halfway point of move.")
            color    = "#7c6af7"
        elif vol_ratio >= 2.0 and (in_uptrend and gap_up or in_downtrend and gap_down):
            gap_type = "EXHAUSTION_GAP"
            emoji    = "⚠️"
            sig      = "HIGH"
            desc     = (f"Exhaustion Gap ({direction}) — end of trend signal! "
                        f"High volume + gap in trend direction = reversal warning.")
            color    = "#f5a623"
        else:
            gap_type = "COMMON_GAP"
            emoji    = "⬜"
            sig      = "LOW"
            desc     = f"Common Gap ({direction}) — {gap_size:.1f}%. Low significance."
            color    = "#6b6b80"

        results.append({
            "type":       gap_type,
            "emoji":      emoji,
            "direction":  direction,
            "gap_size":   round(gap_size, 2),
            "vol_ratio":  round(vol_ratio, 2),
            "gap_filled": gap_filled,
            "is_recent":  is_recent,
            "significance": sig,
            "description": desc,
            "color":       color,
            "bar_index":   i,
            "date":        data.index[i] if hasattr(data.index[i], 'strftime') else str(i),
        })

    return results


# ─────────────────────────────────────────────────────────────────────────────
# MASTER FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def get_reversal_summary(df: pd.DataFrame) -> dict:
    """Run all reversal pattern detectors and return combined summary."""
    hs      = detect_head_and_shoulders(df)
    dt_db   = detect_double_top_bottom(df)
    tt_tb   = detect_triple_top_bottom(df)
    gaps    = detect_gaps(df)

    all_patterns = hs + dt_db + tt_tb
    all_patterns.sort(key=lambda x: x["confidence"], reverse=True)

    recent_gaps = [g for g in gaps if g["is_recent"] and g["significance"] in ("HIGH","MEDIUM")]

    return {
        "patterns":     all_patterns,
        "gaps":         gaps,
        "recent_gaps":  recent_gaps,
        "found":        len(all_patterns) > 0,
        "best":         all_patterns[0] if all_patterns else None,
    }

