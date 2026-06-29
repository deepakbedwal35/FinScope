"""
extras.py
=========
1. WATCHLIST     — save/load stocks across sessions using Streamlit storage
2. PRICE ALERTS  — flag when price crosses entry/SL/target levels
3. ELLIOTT WAVE  — basic 5-wave impulse + 3-wave correction detection (Murphy Ch.13)
4. REPORT BUILDER— generate a plain-text trade plan for any stock
"""

import pandas as pd
import numpy as np
from datetime import datetime


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _r(v, d=2):
    try:
        f = float(v)
        return round(f, d) if not np.isnan(f) else None
    except:
        return None

def _pct(a, b):
    if a and b and float(a) > 0:
        return round((float(b) - float(a)) / float(a) * 100, 2)
    return None


# ─────────────────────────────────────────────────────────────────────────────
# 1. WATCHLIST  (stored in st.session_state)
# ─────────────────────────────────────────────────────────────────────────────

def init_watchlist(session_state):
    """Initialise watchlist in session state if not exists."""
    if "watchlist" not in session_state:
        session_state["watchlist"] = {}   # symbol -> {entry, sl, t1, t2, added_date, note}

def add_to_watchlist(session_state, symbol: str, entry=None, sl=None,
                      t1=None, t2=None, note=""):
    """Add or update a stock in the watchlist."""
    init_watchlist(session_state)
    session_state["watchlist"][symbol.upper()] = {
        "symbol":     symbol.upper(),
        "entry":      _r(entry),
        "sl":         _r(sl),
        "t1":         _r(t1),
        "t2":         _r(t2),
        "note":       note,
        "added_date": datetime.now().strftime("%d %b %Y"),
        "added_time": datetime.now().strftime("%H:%M"),
    }

def remove_from_watchlist(session_state, symbol: str):
    init_watchlist(session_state)
    session_state["watchlist"].pop(symbol.upper(), None)

def get_watchlist(session_state) -> list:
    init_watchlist(session_state)
    return list(session_state["watchlist"].values())

def is_in_watchlist(session_state, symbol: str) -> bool:
    init_watchlist(session_state)
    return symbol.upper() in session_state["watchlist"]


# ─────────────────────────────────────────────────────────────────────────────
# 2. PRICE ALERTS  (check current price vs saved levels)
# ─────────────────────────────────────────────────────────────────────────────

def check_alerts(watchlist: list, current_prices: dict) -> list:
    """
    Check all watchlist stocks against their entry/SL/target levels.

    current_prices: {symbol: current_price}

    Returns list of triggered alerts:
        {symbol, type, level, current, message, color, emoji}
    """
    alerts = []

    for stock in watchlist:
        sym = stock["symbol"]
        cmp = current_prices.get(sym)
        if not cmp:
            continue

        entry = stock.get("entry")
        sl    = stock.get("sl")
        t1    = stock.get("t1")
        t2    = stock.get("t2")

        # Entry alert: price fell to entry level (for LIMIT orders)
        if entry and sl and cmp <= entry * 1.002:
            alerts.append({
                "symbol":  sym,
                "type":    "ENTRY",
                "level":   entry,
                "current": _r(cmp),
                "message": f"{sym} at entry zone ₹{entry} — consider buying",
                "color":   "#3dd68c",
                "emoji":   "🟢",
            })

        # Stop loss alert: price fell to SL
        if sl and cmp <= sl * 1.005:
            alerts.append({
                "symbol":  sym,
                "type":    "STOP LOSS",
                "level":   sl,
                "current": _r(cmp),
                "message": f"⚠️ {sym} approaching SL ₹{sl} — exit immediately",
                "color":   "#f75f5f",
                "emoji":   "🔴",
            })

        # Target 1 alert
        if t1 and cmp >= t1 * 0.998:
            alerts.append({
                "symbol":  sym,
                "type":    "TARGET 1 HIT",
                "level":   t1,
                "current": _r(cmp),
                "message": f"🎯 {sym} hit T1 ₹{t1} — book partial profits",
                "color":   "#7c6af7",
                "emoji":   "🎯",
            })

        # Target 2 alert
        if t2 and cmp >= t2 * 0.998:
            alerts.append({
                "symbol":  sym,
                "type":    "TARGET 2 HIT",
                "level":   t2,
                "current": _r(cmp),
                "message": f"🚀 {sym} hit T2 ₹{t2} — excellent! Consider trailing SL.",
                "color":   "#00ff88",
                "emoji":   "🚀",
            })

    return alerts


# ─────────────────────────────────────────────────────────────────────────────
# 3. ELLIOTT WAVE BASIC  (Murphy Chapter 13)
# ─────────────────────────────────────────────────────────────────────────────

def detect_elliott_wave(df: pd.DataFrame) -> dict:
    """
    Basic Elliott Wave detection — 5-wave impulse + 3-wave correction.

    Murphy Ch.13 Rules for 5-wave impulse:
      Wave 2 never retraces more than 100% of Wave 1
      Wave 3 is never the shortest impulse wave
      Wave 4 never overlaps Wave 1 price territory (in most cases)

    Fibonacci retracement levels used:
      Wave 2 typically retraces 0.382 – 0.618 of Wave 1
      Wave 3 typically extends 1.618 × Wave 1
      Wave 4 typically retraces 0.382 of Wave 3
      Wave 5 typically equals Wave 1 in length

    This is a SIMPLIFIED structural detection — not a full Elliott engine.
    Returns the most likely current wave position and next expected move.
    """
    if len(df) < 50:
        return {"found": False, "reason": "Need at least 50 bars"}

    closes = df["Close"]
    highs  = df["High"]
    lows   = df["Low"]
    cmp    = float(closes.iloc[-1])

    # Find swing points (simplified — use 5-bar window)
    def find_peaks(s, w=5):
        v = s.values
        p = []
        for i in range(w, len(v)-w):
            if v[i] == max(v[i-w:i+w+1]):
                p.append((i, v[i]))
        return p

    def find_troughs(s, w=5):
        v = s.values
        t = []
        for i in range(w, len(v)-w):
            if v[i] == min(v[i-w:i+w+1]):
                t.append((i, v[i]))
        return t

    peaks   = find_peaks(highs, 5)
    troughs = find_troughs(lows, 5)

    if len(peaks) < 3 or len(troughs) < 3:
        return {"found": False, "reason": "Not enough swing points"}

    # Get last 5 significant turning points alternating high/low
    all_points = [(i, v, "H") for i, v in peaks] + [(i, v, "L") for i, v in troughs]
    all_points.sort(key=lambda x: x[0])

    # Keep only alternating H/L
    filtered = [all_points[0]]
    for pt in all_points[1:]:
        if pt[2] != filtered[-1][2]:
            filtered.append(pt)
        elif pt[2] == "H" and pt[1] > filtered[-1][1]:
            filtered[-1] = pt
        elif pt[2] == "L" and pt[1] < filtered[-1][1]:
            filtered[-1] = pt

    if len(filtered) < 5:
        return {"found": False, "reason": "Not enough alternating swing points"}

    # Take last 5 turning points
    pts = filtered[-5:]

    # Determine if bullish (starts with trough) or bearish (starts with peak)
    if pts[0][2] == "L":
        # Potential bullish impulse: L-H-L-H-L or L-H-L-H
        wave_bottoms = [pts[0], pts[2], pts[4]] if len(pts) >= 5 else [pts[0], pts[2]]
        wave_tops    = [pts[1], pts[3]]         if len(pts) >= 4 else [pts[1]]
        direction    = "BULLISH"
    else:
        # Potential bearish impulse
        wave_tops    = [pts[0], pts[2], pts[4]] if len(pts) >= 5 else [pts[0], pts[2]]
        wave_bottoms = [pts[1], pts[3]]         if len(pts) >= 4 else [pts[1]]
        direction    = "BEARISH"

    # Basic wave measurements
    if direction == "BULLISH" and len(wave_tops) >= 2 and len(wave_bottoms) >= 2:
        w0 = wave_bottoms[0][1]   # start of wave 1
        w1 = wave_tops[0][1]      # top of wave 1
        w2 = wave_bottoms[1][1]   # bottom of wave 2
        w3 = wave_tops[1][1]      # top of wave 3 (if available)

        wave1_size  = w1 - w0
        wave2_retrace = (w1 - w2) / wave1_size if wave1_size > 0 else 0
        wave3_size  = w3 - w2 if w3 else 0

        # Check Murphy rules
        rule_w2_ok = wave2_retrace <= 1.0          # W2 can't retrace > 100% of W1
        rule_w2_fib = 0.30 <= wave2_retrace <= 0.70 # W2 typically 38.2–61.8%
        rule_w3_extended = wave3_size >= wave1_size  # W3 should not be shortest

        # Fibonacci targets
        fib_w3_target = _r(w2 + wave1_size * 1.618) if wave1_size > 0 else None
        fib_w3_min    = _r(w2 + wave1_size * 1.0)   if wave1_size > 0 else None
        fib_w5_target = _r(w0 + wave1_size * 3.236) if wave1_size > 0 else None  # 2×W1 from start
        fib_w4_support= _r(w3 - wave3_size * 0.382) if wave3_size > 0 else None

        # Determine current wave position
        if len(wave_bottoms) >= 3:
            current_wave = "Wave 5 UP (final leg)"
            next_move    = "BULLISH — final push up, then expect correction (ABC)"
            next_target  = fib_w5_target
            confidence   = 60
        elif w3 and cmp >= w3 * 0.995:
            current_wave = "Wave 3 TOP or Wave 4 starting"
            next_move    = "Potential pullback (Wave 4) — normal correction before Wave 5"
            next_target  = fib_w4_support
            confidence   = 55
        elif cmp >= w1 * 0.99:
            current_wave = "Wave 3 UP (strongest wave)"
            next_move    = "BULLISH — Wave 3 in progress, most powerful move"
            next_target  = fib_w3_target
            confidence   = 70
        else:
            current_wave = "Wave 2 CORRECTION or early Wave 3"
            next_move    = "Wait for Wave 2 to complete, then enter for Wave 3"
            next_target  = fib_w3_target
            confidence   = 50

        quality = "GOOD" if (rule_w2_ok and rule_w2_fib and rule_w3_extended) else "PARTIAL"

        return {
            "found":         True,
            "direction":     direction,
            "current_wave":  current_wave,
            "next_move":     next_move,
            "next_target":   next_target,
            "quality":       quality,
            "confidence":    confidence,
            "wave1_size":    _r(wave1_size),
            "wave2_retrace_pct": _r(wave2_retrace * 100),
            "fib_w3_target": fib_w3_target,
            "fib_w3_min":    fib_w3_min,
            "fib_w5_target": fib_w5_target,
            "fib_w4_support":fib_w4_support,
            "rules": {
                "w2_valid":    rule_w2_ok,
                "w2_fib":      rule_w2_fib,
                "w3_extended": rule_w3_extended,
            },
            "note": (
                "Murphy Ch.13: 'In a 5-wave impulse, Wave 3 is the strongest. "
                "Wave 2 never retraces more than Wave 1. "
                "Wave 4 provides the best entry for Wave 5.'"
            ),
        }

    return {
        "found":    True,
        "direction": direction,
        "current_wave": "Structure identified but measurement incomplete",
        "next_move": "Monitor for clearer wave structure",
        "next_target": None,
        "quality": "PARTIAL",
        "confidence": 30,
        "note": "Murphy Ch.13: Elliott Wave requires patience — wait for clear 5-wave structure.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. TRADE PLAN REPORT  (plain text + structured)
# ─────────────────────────────────────────────────────────────────────────────

def generate_trade_plan(symbol: str, cmp: float,
                         entry_data: dict, risk_data: dict,
                         dow_result: dict, ind_result: dict,
                         news_sentiment: dict = None) -> str:
    """
    Generate a complete, printable trade plan for a stock.
    Returns a formatted string (markdown-compatible).
    """
    now = datetime.now().strftime("%d %b %Y  %I:%M %p")

    ed     = entry_data  or {}
    rv     = risk_data.get("risks",  {}) if risk_data else {}
    mtf    = risk_data.get("mtf",    {}) if risk_data else {}
    tgts   = risk_data.get("targets",{}) if risk_data else {}

    entry  = ed.get("entry", cmp)
    sl     = ed.get("sl")
    t1     = ed.get("t1")
    t2     = ed.get("t2")
    t3     = ed.get("t3")
    grade  = ed.get("grade", "N/A")
    etype  = ed.get("entry_type", "N/A")
    pos    = ed.get("position", {})
    regime = ed.get("regime", {})
    quote  = ed.get("quote", ("",""))

    dow_sig = dow_result.get("signal","N/A") if dow_result else "N/A"
    primary = dow_result["primary"]["trend"] if dow_result else "N/A"
    rsi_val = ind_result["rsi"]["value"] if ind_result else None
    macd_sig= ind_result["macd"]["signal"] if ind_result else "N/A"
    bb_sig  = ind_result["bb"]["signal"] if ind_result else "N/A"

    risk_level = rv.get("overall","N/A")
    high_risks = rv.get("high_count", 0)

    plan = f"""
═══════════════════════════════════════════════════════
  📊 TRADE PLAN — {symbol.upper()}
  Generated: {now}
═══════════════════════════════════════════════════════

💬 BOOK WISDOM
  "{quote[1]}"
  — {quote[0]}

─────────────────────────────────────────────────────
📈 ENTRY SETUP  (Grade: {grade})
─────────────────────────────────────────────────────
  Current Price : ₹{_r(cmp)}
  Entry Price   : ₹{_r(entry)}  [{etype}]
  Stop Loss     : ₹{_r(sl)}  ({_pct(entry, sl) or 'N/A'}%)
  Target 1      : ₹{_r(t1)}  (+{_pct(entry, t1) or 'N/A'}%)  R:R 1:{_r(ed.get('rr_t1'))}
  Target 2      : ₹{_r(t2)}  (+{_pct(entry, t2) or 'N/A'}%)  R:R 1:{_r(ed.get('rr_t2'))}
  Target 3      : ₹{_r(t3)}  (+{_pct(entry, t3) or 'N/A'}%)  (Trend following)

─────────────────────────────────────────────────────
💰 POSITION SIZING  (Bandy Fixed Fractional)
─────────────────────────────────────────────────────"""

    if pos:
        plan += f"""
  Capital       : ₹{pos.get('capital',0):,.0f}
  Risk per trade: {pos.get('adjusted_risk_pct',1)}%
  Max loss      : ₹{pos.get('risk_amount',0):,.0f}
  Risk per share: ₹{pos.get('risk_per_share','N/A')}
  Quantity      : {pos.get('quantity','N/A')} shares
  Trade Value   : ₹{pos.get('trade_value',0):,.0f}  ({pos.get('capital_pct','N/A')}% of capital)"""
    else:
        plan += "\n  Position sizing not calculated — run Entry tab first."

    plan += f"""

─────────────────────────────────────────────────────
🌊 DOW THEORY  (Murphy Ch.2)
─────────────────────────────────────────────────────
  Primary Trend  : {primary}
  Overall Signal : {dow_sig}"""

    if mtf:
        plan += f"""

─────────────────────────────────────────────────────
⏱️ MULTI-TIMEFRAME  (Covel: Trade all timeframes)
─────────────────────────────────────────────────────
  Alignment      : {mtf.get('alignment','N/A')}
  Short Term     : {mtf.get('short',{}).get('direction','N/A')} ({mtf.get('short',{}).get('strength','N/A')})
  Medium Term    : {mtf.get('medium',{}).get('direction','N/A')} ({mtf.get('medium',{}).get('strength','N/A')})
  Long Term      : {mtf.get('long',{}).get('direction','N/A')} ({mtf.get('long',{}).get('strength','N/A')})
  Confidence     : {mtf.get('confidence','N/A')}"""

    plan += f"""

─────────────────────────────────────────────────────
📐 TECHNICAL INDICATORS
─────────────────────────────────────────────────────
  RSI (14)       : {_r(rsi_val) if rsi_val else 'N/A'}
  MACD Signal    : {macd_sig}
  Bollinger      : {bb_sig}
  Regime         : {regime.get('summary','N/A')}"""

    if tgts:
        t1c = tgts.get("t1",{})
        t2c = tgts.get("t2",{})
        plan += f"""

─────────────────────────────────────────────────────
🎯 TARGET ACHIEVABILITY
─────────────────────────────────────────────────────
  T1 ₹{_r(t1)}: {t1c.get('verdict','N/A')} — ~{t1c.get('atr_days','?')} days  ({t1c.get('probability','N/A')})
  T2 ₹{_r(t2)}: {t2c.get('verdict','N/A') if t2c else 'N/A'} — ~{t2c.get('atr_days','?') if t2c else '?'} days  ({t2c.get('probability','N/A') if t2c else 'N/A'})
  SL Safety  : {tgts.get('sl_note','N/A')[:80]}..."""

    if rv and rv.get("risks"):
        plan += f"""

─────────────────────────────────────────────────────
⚠️ RISK FACTORS  (Overall: {risk_level})
─────────────────────────────────────────────────────"""
        for r in rv.get("risks", [])[:5]:
            plan += f"\n  [{r['severity']}] {r['emoji']} {r['title']}"
            plan += f"\n        → {r['action']}"

    if news_sentiment and news_sentiment.get("overall_sentiment") != "UNKNOWN":
        ns = news_sentiment
        plan += f"""

─────────────────────────────────────────────────────
📰 NEWS SENTIMENT  (VADER)
─────────────────────────────────────────────────────
  Overall        : {ns.get('overall_sentiment','N/A')}  (Score {ns.get('overall_score',0):+.1f}/10)
  Recommendation : {ns.get('recommendation','N/A')}
  Summary        : {ns.get('overall_summary','N/A')[:100]}..."""

    plan += f"""

─────────────────────────────────────────────────────
📋 TRADE CHECKLIST
─────────────────────────────────────────────────────
  [ ] Primary trend confirmed UPTREND
  [ ] Entry price level reached or limit order placed
  [ ] Stop loss order placed at ₹{_r(sl)}
  [ ] Position size calculated correctly
  [ ] T1 alert set at ₹{_r(t1)}
  [ ] T2 alert set at ₹{_r(t2)}
  [ ] No HIGH severity risks present
  [ ] News sentiment not strongly negative
  [ ] Multi-timeframe alignment checked

─────────────────────────────────────────────────────
⚠️  DISCLAIMER
─────────────────────────────────────────────────────
  This trade plan is for educational purposes only.
  Not financial advice. Past performance does not
  guarantee future results. Always use stop losses.
  Never risk more than you can afford to lose.
═══════════════════════════════════════════════════════
"""
    return plan


# ─────────────────────────────────────────────────────────────────────────────
# 5. SECTOR HEAT MAP DATA  (group scanner results by sector)
# ─────────────────────────────────────────────────────────────────────────────

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
    """
    Group scanner results by sector.
    Returns dict: {sector: {count, avg_score, avg_rsi, stocks}}
    """
    sectors = {}
    for r in results:
        sec = get_sector(r["symbol"])
        if sec not in sectors:
            sectors[sec] = {"count": 0, "scores": [], "rsi_vals": [], "stocks": []}
        sectors[sec]["count"]    += 1
        sectors[sec]["scores"].append(r.get("score", 0))
        sectors[sec]["rsi_vals"].append(r.get("rsi", 50))
        sectors[sec]["stocks"].append(r["symbol"])

    # Compute averages
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
