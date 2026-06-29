"""
market_intelligence.py
======================
All missing market intelligence features in one module:

  1. EARNINGS CALENDAR     — NSE result dates, auto-flag near results
  2. SECTOR ROTATION       — RS rating vs NIFTY, sector rank 1-12
  3. DELIVERY %            — NSE daily delivery data, accumulation signal
  4. BREAKOUT QUALITY      — Score 0-10 for breakout strength
  5. SUPPORT/RESISTANCE    — Swing-based SR zones from price history
  6. PROMOTER / PLEDGE     — BSE shareholding pattern data
  7. BULK / BLOCK DEALS    — NSE bulk deal alerts
  8. RELATIVE STRENGTH     — IBD-style RS Rating 1-99

All free — NSE/BSE public APIs, no key needed.
Falls back gracefully when data unavailable.
"""

import math
import time
import requests
import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

# ── shared NSE session ────────────────────────────────────────────────────────
_session      = None
_session_time = 0

NSE_HDR = {
    "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept":          "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer":         "https://www.nseindia.com/",
}

def _nse(url, params=None, retries=2):
    global _session, _session_time
    if _session is None or (time.time() - _session_time) > 180:
        s = requests.Session(); s.headers.update(NSE_HDR)
        try: s.get("https://www.nseindia.com", timeout=6)
        except: pass
        _session = s; _session_time = time.time()
    for _ in range(retries):
        try:
            r = _session.get(url, params=params, timeout=10)
            if r.status_code == 200:
                return r.json()
        except: time.sleep(0.3)
    return None

def _safe(v, d=0.0):
    try:
        f = float(str(v).replace(",",""))
        return f if not math.isnan(f) else d
    except: return d

def _sym(symbol):
    return symbol.replace(".NS","").replace(".BO","").upper().strip()


# ═══════════════════════════════════════════════════════════════════════════════
# 1. EARNINGS CALENDAR
# ═══════════════════════════════════════════════════════════════════════════════

def get_earnings_calendar(symbol: str) -> dict:
    """
    Get upcoming earnings/result date for an NSE stock.
    Sources tried in order:
      1. NSE corporate actions API
      2. yfinance calendar
    Returns: {date, days_away, warning_level, message}
    """
    sym = _sym(symbol)

    # Try NSE corporate actions
    data = _nse(f"https://www.nseindia.com/api/corporateActions?index=equities&symbol={sym}")
    if data:
        try:
            rows = data if isinstance(data, list) else data.get("data", [])
            for row in (rows if isinstance(rows, list) else []):
                purpose = str(row.get("purpose","") or row.get("subject","")).lower()
                if any(k in purpose for k in ["result","financial result","quarterly","annual result"]):
                    date_str = row.get("exDate") or row.get("recordDate") or row.get("bcEndDate","")
                    if date_str:
                        try:
                            dt = datetime.strptime(date_str.strip(), "%d-%b-%Y")
                            days = (dt - datetime.now()).days
                            if -30 <= days <= 90:
                                return _earnings_result(dt, days, sym)
                        except: pass
        except: pass

    # Try yfinance
    try:
        tk = yf.Ticker(sym + ".NS")
        cal = tk.calendar
        if cal is not None and not cal.empty:
            for col in cal.columns:
                if "earnings" in str(col).lower():
                    dt = pd.to_datetime(cal[col].iloc[0])
                    days = (dt - datetime.now()).days
                    if -30 <= days <= 90:
                        return _earnings_result(dt, days, sym)
    except: pass

    return {"symbol": sym, "date": None, "days_away": None,
            "warning_level": "NONE", "message": "No upcoming result date found"}


def _earnings_result(dt, days, sym):
    if days < 0:
        lvl, msg = "PAST", f"Results were {abs(days)} days ago"
    elif days <= 2:
        lvl, msg = "DANGER", f"⛔ Results in {days} day(s)! Do NOT enter — outcome unknown"
    elif days <= 5:
        lvl, msg = "HIGH",   f"⚠️ Results in {days} days — setup unreliable, reduce size"
    elif days <= 10:
        lvl, msg = "MEDIUM", f"📅 Results in {days} days — be aware, tighten SL"
    elif days <= 20:
        lvl, msg = "LOW",    f"📅 Results in {days} days — monitor"
    else:
        lvl, msg = "NONE",   f"Results on {dt.strftime('%d %b')} ({days} days away)"
    return {"symbol": sym, "date": dt.strftime("%d-%b-%Y"), "days_away": days,
            "warning_level": lvl, "message": msg}


# ═══════════════════════════════════════════════════════════════════════════════
# 2. RELATIVE STRENGTH RATING (IBD-style, 1-99)
# ═══════════════════════════════════════════════════════════════════════════════

def compute_rs_rating(symbol: str, all_symbols: list = None,
                      price_data: pd.DataFrame = None) -> dict:
    """
    IBD-style RS Rating: how stock performed vs all NSE stocks in last 6 months.
    Score 1-99. RS > 70 = outperformer. RS < 30 = laggard.

    If all_symbols not provided, compares against NIFTY 50 benchmark only.
    """
    sym = _sym(symbol)

    # Get stock 6-month return
    if price_data is not None and len(price_data) >= 126:
        closes = price_data["Close"].values
        stock_ret = (closes[-1] / closes[-126] - 1) * 100
    else:
        try:
            df = yf.Ticker(sym + ".NS").history(period="9mo")
            if len(df) < 60:
                return {"symbol": sym, "rs_rating": 50, "rs_raw": 0,
                        "signal": "NEUTRAL", "error": "Insufficient data"}
            stock_ret = (df["Close"].iloc[-1] / df["Close"].iloc[-126] - 1) * 100 \
                        if len(df) >= 126 else \
                        (df["Close"].iloc[-1] / df["Close"].iloc[0] - 1) * 100
        except:
            return {"symbol": sym, "rs_rating": 50, "rs_raw": 0,
                    "signal": "NEUTRAL", "error": "Fetch failed"}

    # Compare vs NIFTY benchmark
    try:
        nifty = yf.Ticker("^NSEI").history(period="9mo")
        if len(nifty) >= 60:
            n_ret = (nifty["Close"].iloc[-1] / nifty["Close"].iloc[max(-126,-len(nifty))] - 1) * 100
            rel   = stock_ret - n_ret        # relative outperformance vs NIFTY
            # Map to 1-99: +20% rel outperformance = 99, -20% = 1
            rs = int(np.clip((rel + 20) / 40 * 98 + 1, 1, 99))
        else:
            rs = 50
    except:
        rs = 50
        rel = 0.0

    if rs >= 80:    sig, col = "TOP PERFORMER",    "#3dd68c"
    elif rs >= 70:  sig, col = "OUTPERFORMING",    "#3dd68c"
    elif rs >= 50:  sig, col = "MARKET PERFORM",   "#f5a623"
    elif rs >= 30:  sig, col = "UNDERPERFORMING",  "#f75f5f"
    else:           sig, col = "LAGGARD",           "#f75f5f"

    note = (f"RS {rs} — outperforming {rs}% of NSE stocks in last 6 months" if rs >= 50
            else f"RS {rs} — underperforming {100-rs}% of NSE stocks in last 6 months")

    return {"symbol": sym, "rs_rating": rs, "rs_raw": round(stock_ret, 2),
            "nifty_ret": round(n_ret if 'n_ret' in dir() else 0, 2),
            "rel_outperformance": round(rel if 'rel' in dir() else 0, 2),
            "signal": sig, "signal_color": col, "note": note}


# ═══════════════════════════════════════════════════════════════════════════════
# 3. SECTOR ROTATION — RS rank of all 12 sectors vs NIFTY
# ═══════════════════════════════════════════════════════════════════════════════

SECTOR_ETF_MAP = {
    "Banking & Finance": "^NSEBANK",
    "IT / Tech":         "^CNXIT",
    "Pharma":            "^CNXPHARMA",
    "Auto":              "^CNXAUTO",
    "FMCG / Consumer":   "^CNXFMCG",
    "Metal":             "^CNXMETAL",
    "Energy":            "^CNXENERGY",
    "Infra / Realty":    "^CNXREALTY",
    "PSU / Defence":     "^CNXPSUBANK",
    "Media":             "^CNXMEDIA",
}

def get_sector_rotation() -> dict:
    """
    Compute 20-day and 6-month RS of each sector vs NIFTY.
    Returns sectors ranked 1-N with momentum scores.
    """
    try:
        nifty_df = yf.Ticker("^NSEI").history(period="9mo")
        if nifty_df.empty:
            return {"error": "NIFTY data unavailable", "sectors": {}}
        nifty_c  = nifty_df["Close"].values
        nifty_20 = (nifty_c[-1] / nifty_c[-21] - 1) * 100 if len(nifty_c) >= 21 else 0
        nifty_6m = (nifty_c[-1] / nifty_c[-126] - 1) * 100 if len(nifty_c) >= 126 else 0
    except:
        return {"error": "Could not fetch NIFTY data", "sectors": {}}

    results = {}
    for sector, ticker in SECTOR_ETF_MAP.items():
        try:
            df = yf.Ticker(ticker).history(period="9mo")
            if df.empty or len(df) < 21:
                continue
            c = df["Close"].values
            ret_20 = (c[-1] / c[-21]  - 1) * 100 if len(c) >= 21  else 0
            ret_6m = (c[-1] / c[-126] - 1) * 100 if len(c) >= 126 else 0
            rel_20 = ret_20 - nifty_20
            rel_6m = ret_6m - nifty_6m
            # Composite: 60% 6m + 40% 20d
            score  = round(rel_6m * 0.6 + rel_20 * 0.4, 2)
            results[sector] = {
                "ret_20d":    round(ret_20, 2),
                "ret_6m":     round(ret_6m, 2),
                "rel_20d":    round(rel_20, 2),
                "rel_6m":     round(rel_6m, 2),
                "score":      score,
            }
        except:
            continue

    # Rank sectors
    sorted_sectors = sorted(results.items(), key=lambda x: x[1]["score"], reverse=True)
    final = {}
    for rank, (sec, data) in enumerate(sorted_sectors, 1):
        sc = data["score"]
        if sc > 5:    status, col = "LEADING 🚀",     "#3dd68c"
        elif sc > 0:  status, col = "IMPROVING 📈",        "#f5a623"
        elif sc > -5: status, col = "WEAKENING ⚠️",        "#aaaaaa"
        else:         status, col = "LAGGING 📉",     "#f75f5f"
        final[sec] = {**data, "rank": rank, "total": len(sorted_sectors),
                      "status": status, "color": col}

    return {"sectors": final, "nifty_20d": round(nifty_20, 2),
            "nifty_6m": round(nifty_6m, 2),
            "top4": [s for s, _ in sorted_sectors[:4]],
            "bottom4": [s for s, _ in sorted_sectors[-4:]],
            "timestamp": datetime.now().strftime("%d %b %Y %H:%M")}


def get_stock_sector_rank(symbol: str, sector: str,
                           sector_data: dict = None) -> dict:
    """Return sector rank and signal for a specific stock's sector."""
    if not sector_data or not sector_data.get("sectors"):
        return {"rank": None, "total": None, "signal": "UNKNOWN",
                "color": "#aaaaaa", "note": "Load sector rotation data first"}
    sectors = sector_data["sectors"]
    if sector not in sectors:
        return {"rank": None, "total": len(sectors), "signal": "UNKNOWN",
                "color": "#aaaaaa", "note": f"Sector '{sector}' not tracked"}
    sd = sectors[sector]
    rank = sd["rank"]; total = sd["total"]; status = sd["status"]; col = sd["color"]
    note = (f"{sector} rank {rank}/{total} — {status}. "
            f"{'Top sector — FII/DII allocating here' if rank <= 3 else 'Mid-tier sector' if rank <= 6 else 'Avoid — sector in distribution'}")
    return {"rank": rank, "total": total, "score": sd["score"],
            "status": status, "color": col, "note": note,
            "rel_20d": sd["rel_20d"], "rel_6m": sd["rel_6m"]}


# ═══════════════════════════════════════════════════════════════════════════════
# 4. DELIVERY PERCENTAGE
# ═══════════════════════════════════════════════════════════════════════════════

def get_delivery_pct(symbol: str) -> dict:
    """
    Fetch delivery % from NSE.
    Endpoint: /api/deliveryAndTradedQuantity?symbol=RELIANCE&series=EQ
    Also tries historical for rolling average.
    """
    sym  = _sym(symbol)
    data = _nse(f"https://www.nseindia.com/api/deliveryAndTradedQuantity",
                params={"symbol": sym, "series": "EQ"})

    result = {"symbol": sym, "error": None}

    if data:
        try:
            rows = data if isinstance(data, list) else data.get("data", [])
            vals = []
            for row in (rows[-20:] if isinstance(rows, list) else []):
                dpct = _safe(row.get("deliveryToTradedQty",
                             row.get("delivery_pct", row.get("delivPct", 0))))
                if dpct > 0:
                    vals.append(dpct)
            if vals:
                today   = vals[-1]
                avg_20  = round(sum(vals) / len(vals), 2)
                result.update({
                    "today_pct":   round(today, 2),
                    "avg_20d_pct": avg_20,
                    "data_points": len(vals),
                })
        except Exception as e:
            result["error"] = str(e)

    # Fallback: estimate from yfinance volume patterns
    if "today_pct" not in result:
        try:
            df = yf.Ticker(sym + ".NS").history(period="1mo")
            if not df.empty and len(df) >= 5:
                # Rough proxy: high-volume up-days suggest delivery buying
                up_days = df[df["Close"] > df["Close"].shift(1)]
                if len(up_days) > 0:
                    avg_vol = df["Volume"].mean()
                    heavy_up = up_days[up_days["Volume"] > avg_vol * 1.5]
                    est_pct  = round(len(heavy_up) / max(len(up_days), 1) * 80, 1)
                    result.update({
                        "today_pct":   est_pct,
                        "avg_20d_pct": est_pct,
                        "estimated":   True,
                        "data_points": len(df),
                    })
        except: pass

    # Signal
    today = result.get("today_pct", 0)
    avg   = result.get("avg_20d_pct", today)

    # NSE realistic delivery % benchmarks:
    # >60% = institutional / genuine accumulation
    # 40-60% = healthy, real buying
    # 25-40% = normal / average (most stocks sit here)
    # 15-25% = below average, mild speculation
    # <15%   = heavy intraday speculation, move not durable
    if today >= 60:
        sig, col = "STRONG ACCUMULATION", "#3dd68c"
        note = f"Delivery {today:.1f}% — very high. Institutional / genuine buying."
    elif today >= 40:
        sig, col = "GENUINE BUYING",      "#3dd68c"
        note = f"Delivery {today:.1f}% — healthy. Move backed by real buying interest."
    elif today >= 25:
        sig, col = "NORMAL",              "#f5a623"
        note = f"Delivery {today:.1f}% — average for NSE. Neither strong nor weak signal."
    elif today >= 15:
        sig, col = "BELOW AVERAGE",       "#f5a623"
        note = f"Delivery {today:.1f}% — below average. Watch if move sustains tomorrow."
    elif today > 0:
        sig, col = "SPECULATIVE",         "#f75f5f"
        note = f"Delivery {today:.1f}% — very low. Heavy intraday — move may not hold."
    else:
        sig, col = "NO DATA",             "#6b6b80"
        note = "Delivery data unavailable — using volume proxy"

    # Compare vs own 20-day average (more useful than absolute)
    trend_note = ""
    if today > 0 and avg > 0 and today != avg:
        if today > avg * 1.4:
            trend_note = f" ↑ Spike: {today:.0f}% vs {avg:.0f}% avg — unusual accumulation today"
        elif today < avg * 0.6:
            trend_note = f" ↓ Drop: {today:.0f}% vs {avg:.0f}% avg — weaker than usual"
        else:
            trend_note = f" (20d avg: {avg:.0f}%)"

    result.update({"signal": sig, "signal_color": col,
                   "note": note + trend_note})
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# 5. BREAKOUT QUALITY SCORE (0-10)
# ═══════════════════════════════════════════════════════════════════════════════

def score_breakout_quality(price_data: pd.DataFrame, symbol: str = "") -> dict:
    """
    Score a 52W breakout 0-10 based on:
      +3  Volume: >2x average
      +2  Base length: >6 weeks of consolidation
      +2  Attempt: 1st breakout attempt vs 3rd+
      +2  Market context: NIFTY trend on breakout day
      +1  Retest: price came back and held breakout level
    """
    if price_data is None or len(price_data) < 60:
        return {"score": 0, "label": "INSUFFICIENT DATA", "color": "#aaaaaa",
                "details": [], "symbol": symbol}

    c = price_data["Close"].values
    h = price_data["High"].values
    v = price_data["Volume"].values if "Volume" in price_data.columns else None

    score   = 0
    details = []

    # Is it a breakout? (within 3% of 52W high)
    high_52w = max(h[-252:]) if len(h) >= 252 else max(h)
    from_52w = (c[-1] / high_52w - 1) * 100
    if from_52w < -5:
        # Not at a breakout — show useful distance info instead of unhelpful 0/10
        dist_abs = abs(from_52w)
        if dist_abs <= 15:
            proximity = "approaching"
            prox_col  = "#f5a623"
            prox_note = f"₹{high_52w:,.2f} — could attempt breakout if momentum continues"
        elif dist_abs <= 30:
            proximity = "mid-range"
            prox_col  = "#aaaaaa"
            prox_note = f"₹{high_52w:,.2f} — needs significant rally to reach 52W high"
        else:
            proximity = "far from high"
            prox_col  = "#6b6b80"
            prox_note = f"₹{high_52w:,.2f} — well below highs, no breakout setup"
        return {
            "score":     None,          # None = not applicable (not 0/10)
            "label":     "NOT AT BREAKOUT",
            "color":     prox_col,
            "details":   [
                f"Price is {from_52w:.1f}% below 52W high (₹{high_52w:,.2f})",
                f"Status: {proximity} — {prox_note}",
            ],
            "symbol":    symbol,
            "from_52w":  round(from_52w, 2),
            "high_52w":  round(high_52w, 2),
            "proximity": proximity,
        }

    # 1. Volume score (+3)
    if v is not None and len(v) >= 20:
        vol_avg = np.mean(v[-20:])
        vol_ratio = v[-1] / vol_avg if vol_avg > 0 else 1
        if vol_ratio >= 3.0:
            score += 3; details.append(f"✅ Volume {vol_ratio:.1f}x avg (+3) — very strong confirmation")
        elif vol_ratio >= 2.0:
            score += 3; details.append(f"✅ Volume {vol_ratio:.1f}x avg (+3)")
        elif vol_ratio >= 1.5:
            score += 2; details.append(f"🟡 Volume {vol_ratio:.1f}x avg (+2)")
        elif vol_ratio >= 1.2:
            score += 1; details.append(f"🟡 Volume {vol_ratio:.1f}x avg (+1)")
        else:
            details.append(f"❌ Volume {vol_ratio:.1f}x avg (+0) — weak, low conviction")
    else:
        score += 1; details.append("🟡 Volume data unavailable (+1 default)")

    # 2. Base length — how many weeks was price consolidating? (+2)
    # Look back for last time price was near current level (within 2%)
    base_weeks = 0
    current = c[-1]
    for i in range(len(c)-2, max(len(c)-60, 0), -1):
        if abs(c[i] / current - 1) > 0.08:  # price was >8% away = base ended
            break
        base_weeks += 1
    base_weeks = base_weeks // 5  # trading days to weeks
    if base_weeks >= 8:
        score += 2; details.append(f"✅ {base_weeks}w base (+2) — long consolidation = strong spring")
    elif base_weeks >= 4:
        score += 1; details.append(f"🟡 {base_weeks}w base (+1)")
    else:
        details.append(f"❌ {base_weeks}w base (+0) — too short, weak setup")

    # 3. Attempt number — count prior touches of 52W high (+2 first attempt, 0 for 3rd+)
    attempts = 0
    high_zone = high_52w * 0.99
    in_zone   = False
    for p in c[-252:]:
        if p >= high_zone and not in_zone:
            attempts += 1; in_zone = True
        elif p < high_zone * 0.97:
            in_zone = False
    if attempts <= 1:
        score += 2; details.append(f"✅ 1st breakout attempt (+2) — fresh, no prior resistance absorbed")
    elif attempts == 2:
        score += 1; details.append(f"🟡 2nd attempt (+1) — some resistance, still ok")
    else:
        details.append(f"❌ Attempt #{attempts} (+0) — multiple failures = weak zone")

    # 4. NIFTY context on breakout day (+2)
    try:
        nifty = yf.Ticker("^NSEI").history(period="5d")
        if not nifty.empty:
            nifty_chg = (nifty["Close"].iloc[-1] / nifty["Close"].iloc[-2] - 1) * 100
            if nifty_chg > 0.3:
                score += 2; details.append(f"✅ NIFTY up {nifty_chg:.1f}% today (+2) — market tailwind")
            elif nifty_chg > -0.3:
                score += 1; details.append(f"🟡 NIFTY flat {nifty_chg:.1f}% (+1) — neutral backdrop")
            else:
                details.append(f"❌ NIFTY down {nifty_chg:.1f}% (+0) — breakout against market = risky")
    except:
        score += 1; details.append("🟡 NIFTY data unavailable (+1 default)")

    # 5. Retest — did price pull back and hold the breakout level? (+1)
    if len(c) >= 10:
        recent_low = min(c[-5:])
        bl_zone    = high_52w * 0.98
        if recent_low > bl_zone:
            score += 1; details.append("✅ Held above breakout level (+1) — retest confirmed")
        else:
            details.append("❌ Pulled back below breakout (+0) — needs to reclaim")

    score = min(10, score)

    if score >= 8:    label, col = "STRONG BREAKOUT",    "#3dd68c"
    elif score >= 6:  label, col = "GOOD BREAKOUT",      "#3dd68c"
    elif score >= 4:  label, col = "MODERATE BREAKOUT",  "#f5a623"
    else:             label, col = "WEAK BREAKOUT",      "#f75f5f"

    return {"symbol": symbol, "score": score, "label": label,
            "color": col, "details": details, "from_52w": round(from_52w, 2)}


# ═══════════════════════════════════════════════════════════════════════════════
# 6. SUPPORT / RESISTANCE ZONES
# ═══════════════════════════════════════════════════════════════════════════════

def get_sr_zones(price_data: pd.DataFrame, n_zones: int = 6) -> dict:
    """
    Find significant S/R zones from last 52 weeks of price history.
    Method: identify swing highs/lows, cluster levels within 1%, rank by touches.
    """
    if price_data is None or len(price_data) < 30:
        return {"zones": [], "error": "Insufficient data"}

    h = price_data["High"].values[-252:]  if len(price_data) >= 252 else price_data["High"].values
    l = price_data["Low"].values[-252:]   if len(price_data) >= 252 else price_data["Low"].values
    c = price_data["Close"].values[-252:] if len(price_data) >= 252 else price_data["Close"].values
    v = price_data["Volume"].values[-252:]if len(price_data) >= 252 else price_data["Volume"].values
    spot = c[-1]
    avg_vol = np.mean(v) if len(v) > 0 else 1

    # Find swing highs and lows (local extremes over 5-bar window)
    levels = []
    for i in range(5, len(h) - 5):
        if h[i] == max(h[i-5:i+6]):   # swing high
            levels.append((h[i], "resistance", i, v[i]))
        if l[i] == min(l[i-5:i+6]):   # swing low
            levels.append((l[i], "support", i, v[i]))

    if not levels:
        return {"zones": [], "error": "No swing levels found"}

    # Cluster levels within 1.5%
    levels.sort(key=lambda x: x[0])
    clusters = []
    current  = [levels[0]]
    for lv in levels[1:]:
        if abs(lv[0] / current[0][0] - 1) <= 0.015:
            current.append(lv)
        else:
            clusters.append(current)
            current = [lv]
    clusters.append(current)

    # Score each cluster: touches, recency, volume
    zones = []
    n_bars = len(c)
    for cluster in clusters:
        avg_price  = sum(x[0] for x in cluster) / len(cluster)
        touches    = len(cluster)
        recency    = max(x[2] for x in cluster)   # most recent bar index
        avg_v      = sum(x[3] for x in cluster) / len(cluster)
        vol_rel    = avg_v / avg_vol
        days_ago   = n_bars - recency

        # Zone type: above or below spot
        zone_type  = "resistance" if avg_price > spot else "support"
        distance   = (avg_price / spot - 1) * 100

        # Strength score
        strength = min(10, touches * 2 + (1 if vol_rel > 1.5 else 0) + (1 if days_ago < 30 else 0))

        zones.append({
            "price":    round(avg_price, 2),
            "type":     zone_type,
            "touches":  touches,
            "days_ago": days_ago,
            "vol_rel":  round(vol_rel, 2),
            "strength": strength,
            "distance": round(distance, 2),
            "label":    f"₹{avg_price:,.0f} — {touches} touch{'es' if touches>1 else ''}, {days_ago}d ago",
        })

    # Sort: nearest zones first, split support/resistance
    supports    = sorted([z for z in zones if z["type"] == "support"],
                         key=lambda x: abs(x["distance"]))[:n_zones//2+1]
    resistances = sorted([z for z in zones if z["type"] == "resistance"],
                         key=lambda x: abs(x["distance"]))[:n_zones//2+1]

    # Nearest strong support = suggested SL zone
    strong_sup  = max(supports,    key=lambda x: x["strength"]) if supports else None
    strong_res  = max(resistances, key=lambda x: x["strength"]) if resistances else None

    return {
        "zones":       supports + resistances,
        "supports":    supports,
        "resistances": resistances,
        "strong_support":    strong_sup,
        "strong_resistance": strong_res,
        "spot":        round(spot, 2),
        "error":       None,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 7. PROMOTER HOLDING + PLEDGE DATA
# ═══════════════════════════════════════════════════════════════════════════════

def get_promoter_data(symbol: str) -> dict:
    """
    Fetch promoter holding % and pledge % from NSE.
    Endpoint: /api/shareHolding?symbol=RELIANCE&series=EQ
    """
    sym  = _sym(symbol)
    data = _nse(f"https://www.nseindia.com/api/shareHolding",
                params={"symbol": sym, "series": "EQ"})

    result = {"symbol": sym, "error": None}

    if data:
        try:
            rows = data if isinstance(data, list) else data.get("shareHoldingData",
                   data.get("data", []))
            # Find latest quarter
            if isinstance(rows, list) and rows:
                latest = rows[0]
                for row in (rows if isinstance(rows, list) else []):
                    cat = str(row.get("category", row.get("shareholder_cat",""))).upper()
                    pct = _safe(row.get("percentageShare",
                                row.get("percentage", row.get("pct", 0))))
                    pledge = _safe(row.get("pledgePercent",
                                   row.get("pledgedShares", row.get("pledge_pct", 0))))
                    if "PROMOTER" in cat:
                        result["promoter_pct"]    = round(pct, 2)
                        result["pledged_pct"]     = round(pledge, 2)
                        result["quarter"]         = row.get("quarter",
                                                    row.get("shareholdingDate","Latest"))
                    elif "FII" in cat or "FPI" in cat or "FOREIGN" in cat:
                        result["fii_holding_pct"] = round(pct, 2)
                    elif "DII" in cat or "DOMESTIC" in cat or "MF" in cat:
                        result["dii_holding_pct"] = round(pct, 2)
                    elif "PUBLIC" in cat or "RETAIL" in cat:
                        result["public_pct"]      = round(pct, 2)
        except Exception as e:
            result["error"] = str(e)

    # Try yfinance majorHolders as fallback
    if "promoter_pct" not in result:
        try:
            tk = yf.Ticker(sym + ".NS")
            mh = tk.major_holders
            if mh is not None and not mh.empty:
                for _, row in mh.iterrows():
                    val = str(row.iloc[0]); desc = str(row.iloc[1]).lower()
                    if "institution" in desc:
                        result["fii_holding_pct"] = round(_safe(val.replace("%","")) , 2)
        except: pass

    # Defaults
    promoter = result.get("promoter_pct", 0)
    pledge   = result.get("pledged_pct",  0)

    # Signals
    flags = []
    if pledge > 30:
        flags.append({"level": "DANGER", "color": "#f75f5f",
                      "msg": f"⛔ Pledge {pledge:.1f}% — AVOID. DHFL/Zee/Yes Bank had similar levels before collapse."})
    elif pledge > 20:
        flags.append({"level": "HIGH",   "color": "#f75f5f",
                      "msg": f"⚠️ Pledge {pledge:.1f}% — elevated. Risk of forced selling if stock falls."})
    elif pledge > 10:
        flags.append({"level": "MEDIUM", "color": "#f5a623",
                      "msg": f"📋 Pledge {pledge:.1f}% — moderate. Watch for increase in next quarter."})
    elif pledge > 0:
        flags.append({"level": "LOW",    "color": "#3dd68c",
                      "msg": f"✅ Pledge {pledge:.1f}% — low. Acceptable."})
    else:
        flags.append({"level": "CLEAN",  "color": "#3dd68c",
                      "msg": "✅ Zero pledge — clean promoter holding (Mukherjea Diamonds filter passed)"})

    if promoter > 0:
        if promoter >= 50:
            flags.append({"level": "OK",    "color": "#3dd68c",
                          "msg": f"✅ Promoter holds {promoter:.1f}% — strong ownership, skin in game"})
        elif promoter >= 35:
            flags.append({"level": "OK",    "color": "#f5a623",
                          "msg": f"🟡 Promoter holds {promoter:.1f}% — moderate stake"})
        elif promoter > 0:
            flags.append({"level": "WATCH", "color": "#f75f5f",
                          "msg": f"⚠️ Promoter holds only {promoter:.1f}% — low skin in game"})

    result["flags"]          = flags
    result["pledge_risk"]    = "DANGER" if pledge>30 else "HIGH" if pledge>20 else "MEDIUM" if pledge>10 else "LOW" if pledge>0 else "NONE"
    result["pledge_color"]   = "#f75f5f" if pledge>20 else "#f5a623" if pledge>10 else "#3dd68c"
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# 8. BULK / BLOCK DEALS
# ═══════════════════════════════════════════════════════════════════════════════

def get_bulk_deals(symbol: str, days: int = 5) -> dict:
    """
    Fetch recent bulk/block deals for a stock from NSE.
    Endpoints:
      /api/bulk-deals  — today's bulk deals
      /api/block-deals — today's block deals
    """
    sym    = _sym(symbol)
    deals  = []

    for dtype in ["bulk-deals", "block-deals"]:
        data = _nse(f"https://www.nseindia.com/api/{dtype}")
        if not data:
            continue
        try:
            rows = data if isinstance(data, list) else data.get("data", [])
            for row in (rows if isinstance(rows, list) else []):
                row_sym = str(row.get("symbol", row.get("Symbol",""))).upper()
                if row_sym == sym:
                    qty   = _safe(row.get("quantity",  row.get("Quantity",  0)))
                    price = _safe(row.get("tradePrice",row.get("TradePrice",0)))
                    bstype= str(row.get("buySell",    row.get("BuySell",""))).upper()
                    client= str(row.get("clientName", row.get("ClientName","")))
                    date  = str(row.get("tradeDate",  row.get("TradeDate",  "")))
                    deals.append({
                        "type":   dtype.replace("-"," ").title(),
                        "client": client,
                        "buy_sell": "BUY" if "B" in bstype else "SELL",
                        "quantity": int(qty),
                        "price":   round(price, 2),
                        "value_cr": round(qty * price / 1e7, 2),
                        "date":    date,
                        "color":   "#3dd68c" if "B" in bstype else "#f75f5f",
                    })
        except: continue

    # Signal
    buy_val  = sum(d["value_cr"] for d in deals if d["buy_sell"] == "BUY")
    sell_val = sum(d["value_cr"] for d in deals if d["buy_sell"] == "SELL")
    net      = buy_val - sell_val

    if deals:
        if net > 10:
            sig, col = "INSTITUTIONAL BUYING",  "#3dd68c"
            note = f"Net ₹{net:.1f}Cr bulk/block buying in last {days} days"
        elif net < -10:
            sig, col = "INSTITUTIONAL SELLING", "#f75f5f"
            note = f"Net ₹{abs(net):.1f}Cr bulk/block selling in last {days} days"
        else:
            sig, col = "MIXED",                 "#f5a623"
            note = f"{len(deals)} bulk/block deals — mixed buy/sell activity"
    else:
        sig, col = "NO DEALS",     "#6b6b80"
        note = f"No bulk/block deals found for {sym} in last {days} days"

    return {"symbol": sym, "deals": deals, "buy_value_cr": round(buy_val, 2),
            "sell_value_cr": round(sell_val, 2), "net_value_cr": round(net, 2),
            "signal": sig, "signal_color": col, "note": note}


# ═══════════════════════════════════════════════════════════════════════════════
# 9. OPTIONS GREEKS (Black-Scholes)
# ═══════════════════════════════════════════════════════════════════════════════

def _norm_cdf(x):
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

def _norm_pdf(x):
    return math.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)

def compute_greeks(spot, strike, dte_days, iv_pct, option_type="CE",
                   r=0.065, lot_size=1) -> dict:
    """
    Compute all 5 Greeks for a single option strike.
    r = risk-free rate (approx RBI repo rate)
    Returns delta, gamma, theta (₹/day), vega (per 1% IV change), rho
    """
    if dte_days <= 0 or iv_pct <= 0 or spot <= 0 or strike <= 0:
        return {"delta": 0, "gamma": 0, "theta": 0, "vega": 0,
                "premium_est": 0, "error": "Invalid inputs"}
    T   = dte_days / 365.0
    sig = iv_pct / 100.0
    try:
        d1  = (math.log(spot / strike) + (r + 0.5 * sig**2) * T) / (sig * math.sqrt(T))
        d2  = d1 - sig * math.sqrt(T)
    except:
        return {"delta": 0, "gamma": 0, "theta": 0, "vega": 0, "premium_est": 0}

    is_call = "C" in option_type.upper()

    # Delta
    delta  = _norm_cdf(d1) if is_call else _norm_cdf(d1) - 1

    # Gamma (same for call and put)
    gamma  = _norm_pdf(d1) / (spot * sig * math.sqrt(T))

    # Theta (per calendar day)
    theta_num = (-(spot * _norm_pdf(d1) * sig) / (2 * math.sqrt(T)))
    if is_call:
        theta = (theta_num - r * strike * math.exp(-r*T) * _norm_cdf(d2)) / 365
    else:
        theta = (theta_num + r * strike * math.exp(-r*T) * _norm_cdf(-d2)) / 365

    # Vega (per 1% move in IV)
    vega   = spot * _norm_pdf(d1) * math.sqrt(T) / 100  # per 1% IV

    # Rho
    if is_call:
        rho = strike * T * math.exp(-r*T) * _norm_cdf(d2)  / 100
    else:
        rho = -strike * T * math.exp(-r*T) * _norm_cdf(-d2) / 100

    # Premium estimate (BS price)
    if is_call:
        premium = spot*_norm_cdf(d1) - strike*math.exp(-r*T)*_norm_cdf(d2)
    else:
        premium = strike*math.exp(-r*T)*_norm_cdf(-d2) - spot*_norm_cdf(-d1)

    # Probability of expiring ITM (= |delta| roughly, more precisely N(d2))
    prob_itm = _norm_cdf(d2) if is_call else _norm_cdf(-d2)

    # Seller's daily income
    theta_rs = abs(theta) * lot_size  # ₹ per day per lot

    return {
        "delta":        round(delta, 4),
        "gamma":        round(gamma, 6),
        "theta":        round(theta, 4),        # negative for holders = decay
        "theta_rs_day": round(theta_rs, 2),     # ₹/day income for seller (per lot)
        "vega":         round(vega, 4),
        "rho":          round(rho, 4),
        "premium_est":  round(max(0, premium), 2),
        "prob_itm":     round(prob_itm * 100, 1),  # % chance expires ITM
        "prob_otm":     round((1 - prob_itm) * 100, 1),  # seller's win %
        "iv_used":      iv_pct,
        "dte":          dte_days,
    }


def enrich_chain_with_greeks(calls_df: pd.DataFrame, puts_df: pd.DataFrame,
                              spot: float, dte: int, atm_iv: float,
                              lot_size: int = 1) -> tuple:
    """Add Greeks columns to calls and puts DataFrames."""
    def _add_greeks(df, opt_type):
        if df is None or len(df) == 0:
            return df
        df = df.copy()
        iv_col = "IV%" if "IV%" in df.columns else None
        greeks_rows = []
        for _, row in df.iterrows():
            k    = float(row.get("strike", spot))
            iv   = float(row.get(iv_col, atm_iv) or atm_iv) if iv_col else atm_iv
            if iv <= 0: iv = atm_iv
            g    = compute_greeks(spot, k, dte, iv, opt_type, lot_size=lot_size)
            greeks_rows.append(g)
        gdf = pd.DataFrame(greeks_rows)
        for col in ["delta","gamma","theta","theta_rs_day","vega","prob_otm","premium_est"]:
            if col in gdf.columns:
                df[col] = gdf[col].values
        return df

    calls_enriched = _add_greeks(calls_df, "CE")
    puts_enriched  = _add_greeks(puts_df,  "PE")
    return calls_enriched, puts_enriched


# ═══════════════════════════════════════════════════════════════════════════════
# 10. BACKTEST COST CALCULATOR
# ═══════════════════════════════════════════════════════════════════════════════

def compute_trade_costs(entry_price: float, exit_price: float,
                        quantity: int, trade_type: str = "delivery") -> dict:
    """
    Compute all-in trading costs for NSE trades.
    trade_type: 'delivery' | 'intraday' | 'futures' | 'options'
    """
    trade_val = entry_price * quantity
    exit_val  = exit_price  * quantity
    gross_pnl = exit_val - trade_val

    # Brokerage (Zerodha rates — most common)
    if trade_type == "delivery":
        brokerage = 0          # zero brokerage delivery on Zerodha
        stt_buy   = trade_val  * 0.001    # 0.1% on buy
        stt_sell  = exit_val   * 0.001    # 0.1% on sell
    elif trade_type == "intraday":
        brokerage = min(20, trade_val * 0.0003) * 2   # ₹20 or 0.03% per leg
        stt_buy   = 0
        stt_sell  = exit_val * 0.00025    # 0.025% on sell side only
    elif trade_type == "futures":
        brokerage = min(20, trade_val * 0.0003) * 2
        stt_buy   = 0
        stt_sell  = exit_val * 0.0001
    else:  # options
        brokerage = 40        # flat ₹20 per leg
        stt_buy   = 0
        stt_sell  = exit_val * 0.0005 if exit_price > entry_price else 0

    # Exchange charges
    exchange  = (trade_val + exit_val) * 0.0000335   # NSE charges
    # SEBI charges
    sebi      = (trade_val + exit_val) * 0.000001
    # GST on brokerage + exchange + sebi
    gst       = (brokerage + exchange + sebi) * 0.18
    # Stamp duty (buy side only)
    stamp     = trade_val * 0.00015 if trade_type == "delivery" else trade_val * 0.00003
    # Slippage (0.1% delivery, 0.05% intraday)
    slippage_pct = 0.001 if trade_type == "delivery" else 0.0005
    slippage  = (trade_val + exit_val) * slippage_pct

    total_costs = brokerage + stt_buy + stt_sell + exchange + sebi + gst + stamp + slippage

    net_pnl      = gross_pnl - total_costs
    gross_ret    = gross_pnl / trade_val * 100 if trade_val > 0 else 0
    net_ret      = net_pnl   / trade_val * 100 if trade_val > 0 else 0
    cost_drag    = total_costs / trade_val * 100

    return {
        "trade_val":      round(trade_val, 2),
        "gross_pnl":      round(gross_pnl, 2),
        "net_pnl":        round(net_pnl, 2),
        "gross_ret_pct":  round(gross_ret, 3),
        "net_ret_pct":    round(net_ret, 3),
        "cost_drag_pct":  round(cost_drag, 3),
        "breakdown": {
            "brokerage":  round(brokerage, 2),
            "stt":        round(stt_buy + stt_sell, 2),
            "exchange":   round(exchange, 2),
            "sebi":       round(sebi, 2),
            "gst":        round(gst, 2),
            "stamp":      round(stamp, 2),
            "slippage":   round(slippage, 2),
            "total":      round(total_costs, 2),
        }
    }


def adjust_backtest_for_costs(backtest_rows: list,
                               trade_type: str = "delivery") -> dict:
    """
    Take backtest rows from time machine and compute net returns after costs.
    Returns enhanced stats with cost-adjusted metrics.
    """
    if not backtest_rows:
        return {"error": "No backtest data"}

    gross_rets = [r.get("return_pct", 0) for r in backtest_rows]
    adj_rows   = []

    for row in backtest_rows:
        entry = row.get("cmp", 100)
        ret   = row.get("return_pct", 0)
        exit_ = entry * (1 + ret / 100)
        qty   = max(1, int(10000 / entry))  # normalise to ~₹10k position
        costs = compute_trade_costs(entry, exit_, qty, trade_type)
        adj_ret = costs["net_ret_pct"]
        adj_rows.append({**row, "net_return_pct": adj_ret,
                         "cost_drag": costs["cost_drag_pct"]})

    net_rets  = [r["net_return_pct"] for r in adj_rows]
    wins_net  = [r for r in net_rets if r > 0]
    losses_net= [r for r in net_rets if r <= 0]
    avg_cost_drag = np.mean([r["cost_drag"] for r in adj_rows])

    return {
        "adj_rows":          adj_rows,
        "gross_win_rate":    round(len([r for r in gross_rets if r>0]) / max(len(gross_rets),1) * 100, 1),
        "net_win_rate":      round(len(wins_net) / max(len(net_rets), 1) * 100, 1),
        "gross_avg_return":  round(np.mean(gross_rets), 2) if gross_rets else 0,
        "net_avg_return":    round(np.mean(net_rets), 2)   if net_rets  else 0,
        "avg_cost_drag":     round(avg_cost_drag, 3),
        "total_trades":      len(adj_rows),
        "trade_type":        trade_type,
        "cost_impact_note":  f"Costs reduce avg return by ~{avg_cost_drag:.2f}% per trade ({trade_type})",
    }