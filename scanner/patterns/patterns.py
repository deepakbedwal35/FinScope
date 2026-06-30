

import pandas as pd
import numpy as np
from scipy import stats
from scanner.patterns.dow_theory import get_swing_points


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

FLAT_SLOPE_THRESHOLD = 0.0005   # slopes ≤ this are considered "flat"
MIN_REVERSAL_POINTS  = 4        # Murphy: need at least 4 reversal points
PATTERN_BARS         = 90       # Look back ~3 months (90 trading days)


def fit_trendline(points: pd.Series):
    """
    Fit a linear regression line through the given price series.
    Returns (slope, intercept, r_value).
    slope > 0 → ascending, slope < 0 → descending, ~0 → flat
    """
    if len(points) < 2:
        return None, None, None
    x = np.arange(len(points))
    y = points.values
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
    return slope, intercept, r_value


def normalize_slope(slope: float, price: float) -> float:
    """Normalize slope relative to price to compare across stocks."""
    return slope / price if price > 0 else slope


def volume_diminishing(df: pd.DataFrame, lookback: int = 30) -> bool:
    """
    Check if volume is diminishing over the pattern period.
    Murphy: volume should noticeably diminish inside triangles/wedges.
    Returns True if recent volume trend is declining.
    """
    recent_vol = df["Volume"].tail(lookback)
    if len(recent_vol) < 5:
        return False
    vol_slope, _, _ = fit_trendline(recent_vol)
    return vol_slope is not None and vol_slope < 0


# ─────────────────────────────────────────────────────────────────────────────
# CORE PATTERN DETECTOR
# ─────────────────────────────────────────────────────────────────────────────

def detect_patterns(df: pd.DataFrame) -> list:
    """
    Main function. Scans for all triangle and wedge patterns.
    Returns a list of detected pattern dicts (could be empty).

    Each dict contains:
        type        : 'SYMMETRICAL_TRIANGLE' | 'ASCENDING_TRIANGLE' |
                      'DESCENDING_TRIANGLE'  | 'FALLING_WEDGE' | 'RISING_WEDGE'
        direction   : 'BULLISH' | 'BEARISH' | 'NEUTRAL'
        confidence  : 0–100 (%)
        description : human readable
        breakout    : True/False — has price already broken out?
        breakout_dir: 'UP' | 'DOWN' | None
        upper_slope : slope of upper trendline
        lower_slope : slope of lower trendline
        volume_ok   : bool — volume diminishing as expected
        apex_bars   : estimated bars until trendlines converge (apex)
        bars_formed : how many bars the pattern has been forming
        trendline_upper_y : list of y values for plotting upper TL
        trendline_lower_y : list of y values for plotting lower TL
        reversal_count    : number of reversal points found
    """
    patterns = []

    # Work with last PATTERN_BARS candles
    data = df.tail(PATTERN_BARS).copy().reset_index(drop=False)
    if len(data) < 20:
        return patterns

    price_scale = data["Close"].mean()

    # ── Get swing highs and lows ──
    sh, sl = get_swing_points(data, window=4)

    if len(sh) < 2 or len(sl) < 2:
        return patterns   # not enough reversal points

    reversal_count = len(sh) + len(sl)

    # ── Get positional index of swing points within `data` ──
    sh_idx = [data.index[data["index"] == i][0] if "index" in data.columns
              else data.index.get_loc(i) if i in data.index else None
              for i in sh.index]
    sl_idx = [data.index[data["index"] == i][0] if "index" in data.columns
              else data.index.get_loc(i) if i in data.index else None
              for i in sl.index]

    # Simpler: use integer positions directly
    sh_prices = sh["price"]
    sl_prices = sl["price"]

    # ── Fit trendlines ──
    upper_slope, upper_int, upper_r = fit_trendline(sh_prices)
    lower_slope, lower_int, lower_r = fit_trendline(sl_prices)

    if upper_slope is None or lower_slope is None:
        return patterns

    # Normalize slopes by price
    u_norm = normalize_slope(upper_slope, price_scale)
    l_norm = normalize_slope(lower_slope, price_scale)

    # ── Volume check ──
    vol_ok = volume_diminishing(data, lookback=min(len(data), 30))

    # ── Generate trendline y-values for plotting ──
    n = len(data)
    upper_y = [upper_int + upper_slope * i for i in range(len(sh_prices))]
    lower_y = [lower_int + lower_slope * i for i in range(len(sl_prices))]

    # ── Apex calculation (where trendlines converge) ──
    apex_bars = None
    if abs(upper_slope - lower_slope) > 1e-8:
        # Solve: upper_int + upper_slope*x = lower_int + lower_slope*x
        apex_x = (lower_int - upper_int) / (upper_slope - lower_slope)
        apex_bars = max(0, int(apex_x - n))

    # ── Breakout detection ──
    latest_close = data["Close"].iloc[-1]
    current_upper = upper_int + upper_slope * n
    current_lower = lower_int + lower_slope * n
    breakout = False
    breakout_dir = None

    if latest_close > current_upper * 1.005:   # 0.5% buffer
        breakout = True
        breakout_dir = "UP"
    elif latest_close < current_lower * 0.995:
        breakout = True
        breakout_dir = "DOWN"

    # ── Classify pattern ──
    detected = _classify_pattern(
        u_norm, l_norm, upper_slope, lower_slope,
        reversal_count, vol_ok, breakout, breakout_dir,
        apex_bars, n, upper_y, lower_y, sh_prices, sl_prices
    )

    if detected:
        patterns.append(detected)

    return patterns


def _classify_pattern(u_norm, l_norm, upper_slope, lower_slope,
                       reversal_count, vol_ok, breakout, breakout_dir,
                       apex_bars, bars_formed, upper_y, lower_y,
                       sh_prices, sl_prices) -> dict | None:
    """
    Classify the trendlines into a specific pattern type.
    Returns a pattern dict or None if no pattern matches.
    """
    is_upper_flat = abs(u_norm) <= FLAT_SLOPE_THRESHOLD
    is_lower_flat = abs(l_norm) <= FLAT_SLOPE_THRESHOLD
    upper_descending = u_norm < -FLAT_SLOPE_THRESHOLD
    upper_ascending  = u_norm >  FLAT_SLOPE_THRESHOLD
    lower_descending = l_norm < -FLAT_SLOPE_THRESHOLD
    lower_ascending  = l_norm >  FLAT_SLOPE_THRESHOLD

    # Convergence check: for triangles/wedges upper and lower must converge
    converging = (upper_slope > lower_slope) if (upper_slope is not None) else False

    pattern = None

    # ── 1. SYMMETRICAL TRIANGLE ──
    # Upper descending + lower ascending + volume declining
    if upper_descending and lower_ascending and converging:
        confidence = _score(reversal_count, vol_ok, breakout, apex_bars,
                            abs(u_norm), abs(l_norm), symmetry=True,
                            u_norm=u_norm, l_norm=l_norm)
        direction = "NEUTRAL"
        if breakout:
            direction = "BULLISH" if breakout_dir == "UP" else "BEARISH"
        pattern = {
            "type":        "SYMMETRICAL_TRIANGLE",
            "emoji":       "🔺",
            "direction":   direction,
            "confidence":  confidence,
            "description": (
                "Symmetrical Triangle: upper trendline descending + lower ascending. "
                "Volume diminishing inside. "
                + ("⚡ BREAKOUT " + breakout_dir + "!" if breakout else
                   f"Apex ~{apex_bars} bars away — watch for breakout.")
            ),
            "trade_note":  (
                "Enter on confirmed close ABOVE upper trendline (bullish) "
                "or BELOW lower trendline (bearish). Volume should expand on breakout."
            ),
        }

    # ── 2. ASCENDING TRIANGLE (BULLISH) ──
    # Flat upper + rising lower
    elif is_upper_flat and lower_ascending:
        confidence = _score(reversal_count, vol_ok, breakout, apex_bars,
                            abs(u_norm), l_norm, symmetry=False,
                            u_norm=u_norm, l_norm=l_norm)
        pattern = {
            "type":        "ASCENDING_TRIANGLE",
            "emoji":       "📐⬆️",
            "direction":   "BULLISH",
            "confidence":  confidence,
            "description": (
                "Ascending Triangle: flat resistance + rising support. "
                "BULLISH — buyers becoming more aggressive. "
                + ("⚡ BREAKOUT UP!" if breakout and breakout_dir == "UP" else
                   f"Resistance level to watch for breakout.")
            ),
            "trade_note":  (
                "Buy on close above the flat resistance line with high volume. "
                "Stop loss: just below the last higher low."
            ),
        }

    # ── 3. DESCENDING TRIANGLE (BEARISH) ──
    # Flat lower + descending upper
    elif is_lower_flat and upper_descending:
        confidence = _score(reversal_count, vol_ok, breakout, apex_bars,
                            abs(u_norm), abs(l_norm), symmetry=False,
                            u_norm=u_norm, l_norm=l_norm)
        pattern = {
            "type":        "DESCENDING_TRIANGLE",
            "emoji":       "📐⬇️",
            "direction":   "BEARISH",
            "confidence":  confidence,
            "description": (
                "Descending Triangle: flat support + descending resistance. "
                "BEARISH — sellers more aggressive. "
                + ("⚡ BREAKDOWN!" if breakout and breakout_dir == "DOWN" else
                   f"Support level to watch for breakdown.")
            ),
            "trade_note":  (
                "Avoid long positions. Short / exit on close below flat support. "
                "In primary uptrend, this may just be a temporary correction."
            ),
        }

    # ── 4. FALLING WEDGE (BULLISH) ──
    # Both lines slope DOWN + converging
    elif upper_descending and lower_descending and converging:
        # Both must slope down and lower must be steeper (lower_slope < upper_slope)
        if lower_slope < upper_slope:
            confidence = _score(reversal_count, vol_ok, breakout, apex_bars,
                                abs(u_norm), abs(l_norm), symmetry=True,
                                u_norm=u_norm, l_norm=l_norm)
            pattern = {
                "type":        "FALLING_WEDGE",
                "emoji":       "📉🔺",
                "direction":   "BULLISH",
                "confidence":  confidence,
                "description": (
                    "Falling Wedge: both trendlines slant DOWN (against prevailing uptrend). "
                    "BULLISH continuation/reversal signal. "
                    + ("⚡ BREAKOUT UP!" if breakout and breakout_dir == "UP" else
                       "Wait for upside breakout with volume confirmation.")
                ),
                "trade_note":  (
                    "Buy on close above upper falling trendline. "
                    "Forms over 1–3 months (Murphy). Volume should contract, then explode on breakout."
                ),
            }

    # ── 5. RISING WEDGE (BEARISH) ──
    # Both lines slope UP + converging
    elif upper_ascending and lower_ascending and converging:
        # Both up, but upper must have less slope than lower
        if upper_slope < lower_slope:
            confidence = _score(reversal_count, vol_ok, breakout, apex_bars,
                                u_norm, l_norm, symmetry=True,
                                u_norm=u_norm, l_norm=l_norm)
            pattern = {
                "type":        "RISING_WEDGE",
                "emoji":       "📈🔻",
                "direction":   "BEARISH",
                "confidence":  confidence,
                "description": (
                    "Rising Wedge: both trendlines slant UP (against prevailing downtrend). "
                    "BEARISH continuation/reversal signal. "
                    + ("⚡ BREAKDOWN!" if breakout and breakout_dir == "DOWN" else
                       "Watch for downside breakdown.")
                ),
                "trade_note":  (
                    "Exit longs / avoid buying. "
                    "Short on close below lower rising trendline with expanding volume."
                ),
            }

    if pattern is None:
        return None

    # Attach common fields
    pattern.update({
        "reversal_count":      reversal_count,
        "volume_ok":           vol_ok,
        "breakout":            breakout,
        "breakout_dir":        breakout_dir,
        "apex_bars":           apex_bars,
        "bars_formed":         bars_formed,
        "upper_slope":         round(u_norm * 1000, 3),
        "lower_slope":         round(l_norm * 1000, 3),
        "trendline_upper_y":   upper_y,
        "trendline_lower_y":   lower_y,
        "sh_prices":           sh_prices,
        "sl_prices":           sl_prices,
    })

    return pattern


def _score(reversal_count, vol_ok, breakout, apex_bars,
           u_magnitude, l_magnitude, symmetry, u_norm, l_norm) -> int:
    """
    Confidence score 0–100 based on pattern quality.
    """
    score = 0

    # More reversal points = more reliable (Murphy: minimum 4)
    if reversal_count >= MIN_REVERSAL_POINTS:
        score += 30
    elif reversal_count >= 3:
        score += 15

    # Volume diminishing = classic pattern behavior
    if vol_ok:
        score += 20

    # Symmetry: both slopes roughly equal magnitude = cleaner pattern
    if symmetry and abs(u_magnitude - l_magnitude) < 0.002:
        score += 15

    # Breakout happened = confirmed signal
    if breakout:
        score += 25

    # Apex is close (5–20 bars) = pattern near resolution
    if apex_bars is not None and 5 <= apex_bars <= 20:
        score += 10
    elif apex_bars is not None and apex_bars < 5:
        score += 5   # very close, possibly already broken out

    return min(score, 100)


# ─────────────────────────────────────────────────────────────────────────────
# CONVENIENCE WRAPPER
# ─────────────────────────────────────────────────────────────────────────────

def get_pattern_summary(df: pd.DataFrame) -> dict:
    """
    Return detected patterns in a clean dict for the scanner to use.
    """
    patterns = detect_patterns(df)

    if not patterns:
        return {
            "found":    False,
            "patterns": [],
            "best":     None,
            "signal":   "NO PATTERN",
            "color":    "#aaaaaa",
        }

    # Sort by confidence
    patterns.sort(key=lambda p: p["confidence"], reverse=True)
    best = patterns[0]

    color_map = {"BULLISH": "#3dd68c", "BEARISH": "#f75f5f", "NEUTRAL": "#f5a623"}

    return {
        "found":    True,
        "patterns": patterns,
        "best":     best,
        "signal":   f"{best['type']} ({best['direction']})",
        "color":    color_map.get(best["direction"], "#aaaaaa"),
    }

