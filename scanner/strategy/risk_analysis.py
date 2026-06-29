

import pandas as pd
import numpy as np
import ta


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

def _safe(df, col, idx=-1):
    try:
        v = df[col].iloc[idx]
        return float(v) if not pd.isna(v) else None
    except:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# 1. RISK ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────

def get_risk_analysis(df, ind_result, pat_result, cont_result,
                      rev_result, candle_result, dow_result,
                      news_sentiment=None) -> dict:
    """
    Scans all available data and returns a list of risk factors.

    Each risk:
        severity    : HIGH / MEDIUM / LOW
        category    : Technical / Pattern / Volume / Trend / News
        title       : short name
        description : plain English explanation
        action      : what trader should do
        color       : UI colour
        emoji       : icon
    """
    risks = []

    cmp   = float(df["Close"].iloc[-1])
    atr   = _safe(df, "ATR") or cmp * 0.02

    # ── 1. OVERBOUGHT RSI ─────────────────────────────────────────────────────
    rsi = ind_result["rsi"]["value"] if ind_result else None
    if rsi:
        if rsi > 75:
            risks.append({
                "severity": "HIGH", "category": "Technical",
                "emoji": "🌡️", "title": f"RSI Extremely Overbought ({rsi:.0f})",
                "description": (f"RSI at {rsi:.0f} is deeply overbought (>75). "
                                
                                "High probability of pullback in next 5-10 bars."),
                "action": "Wait for RSI to pull back below 65 before entering. "
                          "If already in trade, tighten stop loss.",
                "color": "#f75f5f",
            })
        elif rsi > 68:
            risks.append({
                "severity": "MEDIUM", "category": "Technical",
                "emoji": "⚠️", "title": f"RSI Approaching Overbought ({rsi:.0f})",
                "description": (f"RSI at {rsi:.0f} — approaching overbought zone. "
                                "Room to run but watch for momentum slowdown."),
                "action": "Acceptable entry but reduce position size by 25%.",
                "color": "#f5a623",
            })

    # ── 2. BEARISH RSI DIVERGENCE ─────────────────────────────────────────────
    rsi_div = ind_result["rsi"]["divergence"] if ind_result else "NONE"
    if rsi_div == "BEARISH_DIVERGENCE":
        risks.append({
            "severity": "HIGH", "category": "Technical",
            "emoji": "📉", "title": "RSI Bearish Divergence",
            "description": ("Price making higher highs but RSI making lower highs. "
                            
                            "This is one of the most reliable warning signals."),
            "action": "Avoid new long entries. If in trade, raise stop loss to breakeven.",
            "color": "#f75f5f",
        })

    # ── 3. MACD BEARISH SIGNAL ────────────────────────────────────────────────
    if ind_result:
        macd_sig = ind_result["macd"]["signal"]
        macd_cross = ind_result["macd"]["cross"]
        if macd_cross == "BEARISH_CROSS":
            risks.append({
                "severity": "HIGH", "category": "Technical",
                "emoji": "📉", "title": "MACD Bearish Crossover",
                "description": ("MACD line just crossed BELOW signal line. "
                                
                                "Fresh signal — high impact."),
                "action": "Do not enter long. Exit existing longs or tighten SL significantly.",
                "color": "#f75f5f",
            })
        elif macd_sig in ("BEARISH", "WEAKENING"):
            risks.append({
                "severity": "MEDIUM", "category": "Technical",
                "emoji": "📊", "title": f"MACD Momentum {macd_sig}",
                "description": (f"MACD signal: {macd_sig}. "
                                "Upward momentum is slowing. May not be best entry timing."),
                "action": "Wait for MACD to turn bullish before entering.",
                "color": "#f5a623",
            })

    # ── 4. NEAR STRONG RESISTANCE ─────────────────────────────────────────────
    if cont_result:
        sr = cont_result.get("sr", {})
        nr = sr.get("nearest_resistance")
        if nr:
            dist = float(nr["dist_pct"])
            strength = nr["strength"]
            if 0 < dist <= 2.0 and strength == "STRONG":
                risks.append({
                    "severity": "HIGH", "category": "Technical",
                    "emoji": "🧱", "title": f"STRONG Resistance at ₹{_r(nr['price'])} (+{dist}%)",
                    "description": (f"Strong resistance zone at ₹{_r(nr['price'])} "
                                    f"— only {dist}% above current price. "
                                    f"Tested {nr['touches']} times. "
                                    
                                    "Price often reverses here."),
                    "action": f"Set T1 just below ₹{_r(nr['price'])}. "
                              "Wait for a confirmed breakout with high volume before targeting higher.",
                    "color": "#f75f5f",
                })
            elif 0 < dist <= 3.0 and strength in ("STRONG", "MODERATE"):
                risks.append({
                    "severity": "MEDIUM", "category": "Technical",
                    "emoji": "⚠️", "title": f"{strength} Resistance at ₹{_r(nr['price'])} (+{dist}%)",
                    "description": (f"{strength} resistance at ₹{_r(nr['price'])} — {dist}% away. "
                                    "May act as temporary ceiling."),
                    "action": "Book partial profits near resistance. Hold remaining for breakout.",
                    "color": "#f5a623",
                })

    # ── 5. DEATH CROSS / BEARISH MA ALIGNMENT ────────────────────────────────
    if cont_result:
        mc = cont_result.get("ma_crosses", {})
        if mc.get("death_cross"):
            risks.append({
                "severity": "HIGH", "category": "Trend",
                "emoji": "💀", "title": f"Death Cross on {mc.get('death_cross_date','')}",
                "description": ("SMA50 crossed BELOW SMA200 — major bearish signal. "
                                "Murphy Ch.9: 'Death cross signals long-term downtrend. "
                                ),
                "action": "AVOID long positions. Wait for Golden Cross confirmation.",
                "color": "#f75f5f",
            })
        elif not mc.get("ma50_above_ma200"):
            risks.append({
                "severity": "MEDIUM", "category": "Trend",
                "emoji": "📉", "title": "SMA50 Below SMA200 — Bearish Alignment",
                "description": ("Price and SMA50 are below SMA200. "
                                "Long-term trend is bearish. "
                                ),
                "action": "Reduce position size. Only short-term trades advisable here.",
                "color": "#f5a623",
            })

    # ── 6. DOW SECONDARY DOWNTREND ────────────────────────────────────────────
    if dow_result:
        if dow_result["primary"]["trend"] == "DOWNTREND":
            risks.append({
                "severity": "HIGH", "category": "Trend",
                "emoji": "🌊⬇️", "title": "Dow Primary Trend: DOWNTREND",
                "description": ("The primary (tide) trend is DOWN. "
                                "Covel: 'Never trade against the primary trend.' "
                                "Even pullback rallies in downtrends fail."),
                "action": "Avoid all long entries until primary trend turns UP.",
                "color": "#f75f5f",
            })
        elif dow_result["secondary"]["trend"] == "DOWNTREND":
            risks.append({
                "severity": "MEDIUM", "category": "Trend",
                "emoji": "〽️⬇️", "title": "Dow Secondary Trend: Pullback in Progress",
                "description": ("Secondary (wave) trend is currently pulling back. "
                                "Murphy: 'Secondary corrections retrace 1/3 to 2/3 of prior move.' "
                                "Could fall further before reversing."),
                "action": "Wait for secondary pullback to end (minor trend turns up) before entry.",
                "color": "#f5a623",
            })

    # ── 7. BOLLINGER OVEREXTENDED ─────────────────────────────────────────────
    if ind_result:
        bb = ind_result["bb"]
        pct_b = bb.get("pct_b")
        if pct_b and pct_b > 1.1:
            risks.append({
                "severity": "MEDIUM", "category": "Technical",
                "emoji": "📊", "title": f"Price Above Upper Bollinger Band (%B={_r(pct_b*100)}%)",
                "description": (f"Price is {_r((pct_b-1)*100)}% above the upper BB. "
                                "Bandy: 'Price far above upper band = high volatility risk.' "
                                "Mean reversion likely."),
                "action": "Avoid chasing here. Wait for %B to come back below 1.0.",
                "color": "#f5a623",
            })

    # ── 8. STOCHASTIC OVERBOUGHT ──────────────────────────────────────────────
    if candle_result:
        stoch = candle_result.get("stochastic", {})
        k = stoch.get("k")
        if k and k > 80:
            risks.append({
                "severity": "MEDIUM", "category": "Technical",
                "emoji": "🔄", "title": f"Stochastic Overbought (%K={k:.0f})",
                "description": (f"Stochastic %K at {k:.0f} — above 80 overbought zone. "
                                "Murphy Ch.10: '%K above 80 = watch for bearish crossover.'"),
                "action": "Wait for %K to cross below %D in overbought zone as exit signal.",
                "color": "#f5a623",
            })

    # ── 9. BEARISH REVERSAL PATTERNS ─────────────────────────────────────────
    if rev_result:
        for p in rev_result.get("patterns", []):
            if p["direction"] == "BEARISH" and p["confidence"] >= 50:
                risks.append({
                    "severity": "HIGH" if p["confirmed"] else "MEDIUM",
                    "category": "Pattern",
                    "emoji": "🔻", "title": f"{p['name'].replace('_',' ')} Pattern Detected",
                    "description": (f"{p['desc']} "
                                    f"Confidence: {p['confidence']}%. "
                                    "Murphy Ch.5: 'Reversal patterns signal end of trend.'"),
                    "action": (f"{'CONFIRMED — exit longs immediately.' if p['confirmed'] else 'Watching — tighten SL to ₹' + str(p.get('neckline','?'))} "
                               f"Target: ₹{p.get('price_target','?')}"),
                    "color": "#f75f5f" if p["confirmed"] else "#f5a623",
                })

    # ── 10. BEARISH CHART PATTERNS ────────────────────────────────────────────
    if pat_result:
        for p in pat_result.get("patterns", []):
            if p["direction"] == "BEARISH" and p.get("confidence", 0) >= 50:
                risks.append({
                    "severity": "MEDIUM", "category": "Pattern",
                    "emoji": "📐", "title": f"Bearish Pattern: {p['type'].replace('_',' ')}",
                    "description": (f"{p['description']} Confidence {p['confidence']}%."),
                    "action": p.get("trade_note", "Reduce exposure."),
                    "color": "#f5a623",
                })

    # ── 11. BEARISH CANDLESTICK PATTERNS ─────────────────────────────────────
    if candle_result:
        bearish_candles = [c for c in candle_result.get("bearish", [])
                           if c.get("bars_ago", 99) <= 1 and c.get("strength") == "STRONG"]
        for c in bearish_candles[:2]:
            risks.append({
                "severity": "MEDIUM", "category": "Pattern",
                "emoji": c.get("emoji", "🕯️"),
                "title": f"Bearish Candle: {c['name'].replace('_',' ')} (today/yesterday)",
                "description": (f"{c.get('desc','')} "
                                "Murphy Ch.12: 'Strong bearish candles warn of short-term reversal.'"),
                "action": "Wait 1-2 bars for confirmation before entering.",
                "color": "#f5a623",
            })

    # ── 12. WEAK / DECLINING VOLUME ───────────────────────────────────────────
    vol_ratio = _safe(df, "Vol_ratio") if "Vol_ratio" in df.columns else None
    if vol_ratio and vol_ratio < 0.6:
        risks.append({
            "severity": "MEDIUM", "category": "Volume",
            "emoji": "📉", "title": f"Weak Volume ({_r(vol_ratio)}x average)",
            "description": (f"Volume at only {_r(vol_ratio)}x the 20-day average. "
                            "Murphy: 'Volume confirms price moves — low volume = suspect move.' "
                            "Breakouts without volume often fail."),
            "action": "Only enter when volume picks up to at least 1.5x average.",
            "color": "#f5a623",
        })

    # ── 13. HIGH VOLATILITY REGIME ────────────────────────────────────────────
    atr_ma = df["ATR"].rolling(20).mean().iloc[-1] if "ATR" in df.columns else None
    if atr_ma and atr_ma > 0:
        vol_regime = atr / atr_ma
        if vol_regime > 2.0:
            risks.append({
                "severity": "HIGH", "category": "Technical",
                "emoji": "⚡", "title": f"HIGH Volatility Regime (ATR {_r(vol_regime)}x normal)",
                "description": (f"Current ATR is {_r(vol_regime)}x its 20-day average. "
                                "Halls-Moore: 'High volatility regimes destroy strategies.' "
                                "Stop losses hit more easily. Wider swings expected."),
                "action": "Reduce position size by 50%. Widen stop loss OR skip this trade.",
                "color": "#f75f5f",
            })

    # ── 14. TRENDLINE BREAK WARNING ───────────────────────────────────────────
    if cont_result:
        tl = cont_result.get("trendlines", {})
        if tl.get("uptrend_broken"):
            risks.append({
                "severity": "HIGH", "category": "Trend",
                "emoji": "📏", "title": "Uptrend Line BROKEN",
                "description": (f"{tl.get('description','')} "
                                "Murphy Ch.4: 'Close below trendline = warning of trend change.'"),
                "action": "Do not enter long. Wait for price to reclaim trendline.",
                "color": "#f75f5f",
            })

    # ── 15. DEEP BELOW 52W HIGH ───────────────────────────────────────────────
    if "ATR" in df.columns:
        w52 = float(df["High"].rolling(252, min_periods=50).max().iloc[-1])
        dist_52w = _pct(w52, cmp)  # negative = below
        if dist_52w and dist_52w < -35:
            risks.append({
                "severity": "HIGH", "category": "Technical",
                "emoji": "📉", "title": f"Deep Below 52W High ({_r(dist_52w)}%)",
                "description": (f"Price is {abs(_r(dist_52w))}% below its 52-week high. "
                                "Could indicate a broken stock or sector weakness. "
                                "Covel: 'Stocks far below their highs are not in uptrends.'"),
                "action": "Require very strong fundamental reason to buy. "
                          "Wait for primary trend to turn UP first.",
                "color": "#f75f5f",
            })

    # ── 16. RECENT NEGATIVE GAPS ─────────────────────────────────────────────
    if rev_result:
        neg_gaps = [g for g in rev_result.get("gaps", [])
                    if g["direction"] == "DOWN"
                    and g["significance"] in ("HIGH", "MEDIUM")
                    and g["is_recent"]]
        for g in neg_gaps[:1]:
            risks.append({
                "severity": "HIGH" if g["significance"] == "HIGH" else "MEDIUM",
                "category": "Pattern",
                "emoji": "⬇️", "title": f"Recent {g['type'].replace('_',' ')} (Down {g['gap_size']}%)",
                "description": (f"{g['description']} "
                                "Murphy: 'Breakaway gaps down signal start of new downtrend.'"),
                "action": "Wait for gap to be filled or strong reversal candle before buying.",
                "color": "#f75f5f" if g["significance"] == "HIGH" else "#f5a623",
            })

    # ── 17. NEWS RISK (VADER — no new API) ───────────────────────────────────
    if news_sentiment and news_sentiment.get("overall_score") is not None:
        ns = float(news_sentiment["overall_score"])
        neg_n = len(news_sentiment.get("negative", []))
        if ns < -4:
            risks.append({
                "severity": "HIGH", "category": "News",
                "emoji": "📰", "title": f"Strongly Negative News Sentiment (Score {ns:+.1f})",
                "description": (f"{neg_n} negative articles found. "
                                f"VADER score {ns:+.1f}/10 is strongly bearish. "
                                f"Key risks: {', '.join(news_sentiment.get('risk_factors', [])[:2])}"),
                "action": "Avoid entry until news sentiment improves. Check for earnings miss, regulatory, or legal issues.",
                "color": "#f75f5f",
            })
        elif ns < -2:
            risks.append({
                "severity": "MEDIUM", "category": "News",
                "emoji": "📰", "title": f"Negative News Sentiment (Score {ns:+.1f})",
                "description": (f"{neg_n} negative articles. "
                                f"VADER score {ns:+.1f}/10. "
                                f"Risks: {', '.join(news_sentiment.get('risk_factors', [])[:2])}"),
                "action": "Be cautious. Read recent news before entering.",
                "color": "#f5a623",
            })

    # ── SORT BY SEVERITY ──────────────────────────────────────────────────────
    sev_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    risks.sort(key=lambda x: sev_order.get(x["severity"], 2))

    high_n   = sum(1 for r in risks if r["severity"] == "HIGH")
    medium_n = sum(1 for r in risks if r["severity"] == "MEDIUM")

    # Overall risk rating
    if high_n >= 3:
        overall = "VERY HIGH"
        overall_color = "#ff3333"
        overall_desc  = "Multiple high-severity risks — avoid or use minimal position"
    elif high_n >= 1:
        overall = "HIGH"
        overall_color = "#f75f5f"
        overall_desc  = "At least one critical risk present — trade with caution"
    elif medium_n >= 3:
        overall = "MODERATE"
        overall_color = "#f5a623"
        overall_desc  = "Several moderate risks — reduce position size"
    elif medium_n >= 1:
        overall = "LOW-MODERATE"
        overall_color = "#7c6af7"
        overall_desc  = "Minor risks present — standard position size OK"
    else:
        overall = "LOW"
        overall_color = "#3dd68c"
        overall_desc  = "No significant risks detected — favourable setup"

    return {
        "risks":         risks,
        "total":         len(risks),
        "high_count":    high_n,
        "medium_count":  medium_n,
        "overall":       overall,
        "overall_color": overall_color,
        "overall_desc":  overall_desc,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 2. MULTI-TIMEFRAME ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────

def _add_basic_indicators(df):
    """Add indicators to a resampled dataframe."""
    df = df.copy()
    if len(df) < 20:
        return df
    try:
        df["MA20"]  = df["Close"].rolling(20).mean()
        df["MA50"]  = df["Close"].rolling(min(50, len(df))).mean()
        df["MA200"] = df["Close"].rolling(min(200, len(df))).mean()
        df["RSI"]   = ta.momentum.RSIIndicator(df["Close"], 14).rsi()
        macd        = ta.trend.MACD(df["Close"])
        df["MACD"]  = macd.macd()
        df["MACD_s"]= macd.macd_signal()
        df["ATR"]   = ta.volatility.AverageTrueRange(
                          df["High"], df["Low"], df["Close"], 14
                      ).average_true_range()
    except:
        pass
    return df


def _score_timeframe(df, label) -> dict:
    """
    Score a timeframe dataframe and return signal dict.
    """
    if df is None or len(df) < 15:
        return {
            "label": label, "direction": "NEUTRAL", "strength": "WEAK",
            "score": 0, "signals": [], "entry": None,
            "color": "#aaaaaa", "emoji": "➡️",
            "summary": "Not enough data for this timeframe",
        }

    df  = _add_basic_indicators(df)
    lat = df.iloc[-1]
    cmp = float(lat["Close"])

    score  = 0
    sigs   = []

    # MA alignment
    ma20  = _safe(df, "MA20")
    ma50  = _safe(df, "MA50")
    ma200 = _safe(df, "MA200")
    rsi   = _safe(df, "RSI")
    macd  = _safe(df, "MACD")
    macd_s= _safe(df, "MACD_s")

    if ma20 and cmp > ma20:   score += 1; sigs.append("Above MA20")
    if ma50 and cmp > ma50:   score += 2; sigs.append("Above MA50")
    if ma200 and cmp > ma200: score += 3; sigs.append("Above MA200 ✅")
    if ma50 and ma200 and ma50 > ma200: score += 2; sigs.append("MA50 > MA200 (Golden)")
    if ma50 and ma200 and ma50 < ma200: score -= 2; sigs.append("MA50 < MA200 (Death) ❌")

    # RSI
    if rsi:
        if 50 <= rsi <= 70:    score += 2; sigs.append(f"RSI {rsi:.0f} bullish")
        elif rsi > 70:         score += 0; sigs.append(f"RSI {rsi:.0f} overbought")
        elif rsi < 40:         score -= 2; sigs.append(f"RSI {rsi:.0f} weak ❌")

    # MACD
    if macd and macd_s:
        if macd > macd_s:      score += 2; sigs.append("MACD > Signal ✅")
        else:                  score -= 1; sigs.append("MACD < Signal")
        if macd > 0:           score += 1; sigs.append("MACD above zero")

    # Price vs recent high
    period_high = float(df["High"].tail(20).max())
    dist_high   = _pct(period_high, cmp)  # negative = below high
    if dist_high and dist_high >= -3:      score += 2; sigs.append("Near period high")
    elif dist_high and dist_high < -20:    score -= 1; sigs.append("Far below period high")

    # MA200 slope
    if ma200 and len(df) >= 25:
        ma200_old = _safe(df, "MA200", -21)
        if ma200_old:
            slope = (ma200 - ma200_old) / ma200_old * 100
            if slope > 0.3:   score += 2; sigs.append("MA200 rising ✅")
            elif slope < -0.3: score -= 2; sigs.append("MA200 falling ❌")

    # Classify
    if score >= 8:
        direction = "BULLISH"; strength = "STRONG"
        color = "#3dd68c"; emoji = "🟢⬆️"
    elif score >= 4:
        direction = "BULLISH"; strength = "MODERATE"
        color = "#7c6af7"; emoji = "🟣⬆️"
    elif score >= 1:
        direction = "NEUTRAL"; strength = "WEAK"
        color = "#f5a623"; emoji = "🟡➡️"
    elif score >= -3:
        direction = "BEARISH"; strength = "MODERATE"
        color = "#f75f5f"; emoji = "🔴⬇️"
    else:
        direction = "BEARISH"; strength = "STRONG"
        color = "#ff3333"; emoji = "🔴⬇️⬇️"

    # Entry suggestion
    if direction == "BULLISH":
        if ma20 and cmp <= ma20 * 1.02:
            entry_note = f"Good entry near MA20 ≈ ₹{_r(ma20)}"
        elif ma50 and cmp <= ma50 * 1.02:
            entry_note = f"Good entry near MA50 ≈ ₹{_r(ma50)}"
        else:
            entry_note = "Wait for pullback to MA20/MA50 for better entry"
    elif direction == "BEARISH":
        entry_note = "Avoid long entries in this timeframe"
    else:
        entry_note = "No clear directional bias — wait for confirmation"

    summary = f"{direction} ({strength}) — Score {score} | " + " · ".join(sigs[:3])

    return {
        "label":      label,
        "direction":  direction,
        "strength":   strength,
        "score":      score,
        "signals":    sigs,
        "entry_note": entry_note,
        "color":      color,
        "emoji":      emoji,
        "summary":    summary,
        "cmp":        _r(cmp),
        "ma20":       _r(ma20),
        "ma50":       _r(ma50),
        "ma200":      _r(ma200),
        "rsi":        _r(rsi),
    }


def get_multi_timeframe(df_daily: pd.DataFrame) -> dict:
    """
    Analyse three timeframes from daily OHLCV data.

    Short Term  (1-4 weeks)  : Last 30 daily bars
    Medium Term (1-3 months) : Last 90 daily bars
    Long Term   (6+ months)  : Weekly resampled data

    Returns alignment signal + per-timeframe breakdown.
    """
    # Short term: last 30 daily bars
    short_df = df_daily.tail(30).copy()
    short    = _score_timeframe(short_df, "Short Term (1–4 Weeks)")

    # Medium term: last 90 daily bars
    med_df = df_daily.tail(90).copy()
    med    = _score_timeframe(med_df, "Medium Term (1–3 Months)")

    # Long term: weekly resampled
    try:
        weekly = df_daily.resample("W").agg({
            "Open":  "first", "High": "max",
            "Low":   "min",   "Close": "last",
            "Volume": "sum"
        }).dropna()
        long_df = weekly.tail(52)   # last 52 weeks = 1 year
    except:
        long_df = df_daily.tail(200)
    long = _score_timeframe(long_df, "Long Term (6+ Months)")

    # Alignment
    directions = [short["direction"], med["direction"], long["direction"]]
    bull_count = directions.count("BULLISH")
    bear_count = directions.count("BEARISH")

    if bull_count == 3:
        alignment = "FULLY ALIGNED BULLISH"
        align_color = "#3dd68c"
        align_emoji = "🟢🟢🟢"
        align_desc  = ("All 3 timeframes bullish — highest confidence setup. "
                       "Covel: 'Trade in the direction all timeframes agree.'")
        confidence  = "HIGH"
    elif bull_count == 2 and bear_count == 0:
        alignment = "MOSTLY BULLISH"
        align_color = "#7c6af7"
        align_emoji = "🟢🟢🟡"
        align_desc  = "2 of 3 timeframes bullish. Good but wait for 3rd to confirm."
        confidence  = "MEDIUM"
    elif bull_count == 2 and bear_count == 1:
        alignment = "MIXED — CONFLICTING SIGNALS"
        align_color = "#f5a623"
        align_emoji = "🟢🟢🔴"
        align_desc  = "Mixed signals across timeframes. Reduce position size and be selective."
        confidence  = "LOW"
    elif bear_count == 3:
        alignment = "FULLY ALIGNED BEARISH"
        align_color = "#f75f5f"
        align_emoji = "🔴🔴🔴"
        align_desc  = "All 3 timeframes bearish — avoid all long entries."
        confidence  = "AVOID"
    elif bear_count == 2:
        alignment = "MOSTLY BEARISH"
        align_color = "#f75f5f"
        align_emoji = "🔴🔴🟡"
        align_desc  = "2 of 3 timeframes bearish. Not a good environment for longs."
        confidence  = "AVOID"
    else:
        alignment = "NEUTRAL / SIDEWAYS"
        align_color = "#aaaaaa"
        align_emoji = "🟡🟡🟡"
        align_desc  = "No clear trend. Wait for alignment before trading."
        confidence  = "WAIT"

    # Best timeframe to trade
    best_tf = None
    if confidence in ("HIGH", "MEDIUM"):
        if short["direction"] == "BULLISH" and short["strength"] in ("STRONG","MODERATE"):
            best_tf = "Short Term"
        elif med["direction"] == "BULLISH":
            best_tf = "Medium Term"
        else:
            best_tf = "Long Term"

    return {
        "short":      short,
        "medium":     med,
        "long":       long,
        "alignment":  alignment,
        "align_color":align_color,
        "align_emoji":align_emoji,
        "align_desc": align_desc,
        "confidence": confidence,
        "best_tf":    best_tf,
    }


def get_full_risk_report(df, ind_result, pat_result, cont_result,
                          rev_result, candle_result, dow_result,
                          entry=None, sl=None, t1=None, t2=None,
                          news_sentiment=None) -> dict:
    """
    Run all 3 analyses and return combined report.
    Single call from app.py.
    """
    risks  = get_risk_analysis(df, ind_result, pat_result, cont_result,
                                rev_result, candle_result, dow_result,
                                news_sentiment)
    mtf    = get_multi_timeframe(df)
    # target = check_target_achievability(df, entry, sl, t1, t2, cont_result)

    return  risks
        
        # "targets": target,
    