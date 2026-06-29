"""
entry_engine.py — Precision Entry System
=========================================
Based on:
  • Howard Bandy    — Quantitative Technical Analysis
  • Michael Covel   — Trend Following
  • Michael Halls-Moore — Successful Algorithmic Trading
  • John Murphy     — Technical Analysis of the Financial Markets
"""
import pandas as pd
import numpy as np
import random

QUOTES = [
    ("Trend Following — Michael Covel",
     "The trend is your friend until the end when it bends. Don't fight it, ride it."),
    ("Quantitative Technical Analysis — Howard Bandy",
     "A trading system without position sizing is like a car without a steering wheel."),
    ("Successful Algo Trading — Michael Halls-Moore",
     "Every strategy looks great on paper. The real test is out-of-sample performance."),
    ("Trend Following — Michael Covel",
     "Great traders don't predict. They react to what the market is telling them."),
    ("Quantitative Technical Analysis — Howard Bandy",
     "Risk of ruin is the most important number in trading. Keep it near zero."),
    ("Successful Algo Trading — Michael Halls-Moore",
     "Sharpe ratio separates luck from skill. A ratio above 1.0 is your target."),
    ("Trend Following — Michael Covel",
     "The Turtles proved it: trend following works. Discipline is the only edge you need."),
    ("Tech Analysis — John Murphy",
     "Volume is the fuel that drives the market. A breakout without volume is a false breakout."),
    ("Quantitative Technical Analysis — Howard Bandy",
     "Use MAE to set your stop. The market tells you where the stop should be — listen."),
    ("Trend Following — Michael Covel",
     "You will never catch the exact bottom or top. Accept it and trade what is, not what you think."),
    ("Successful Algo Trading — Michael Halls-Moore",
     "Slippage and commissions are silent killers of profitable systems. Always include them."),
    ("Tech Analysis — John Murphy",
     "Support and resistance are the cornerstones of technical analysis. Master them first."),
    ("Trend Following — Michael Covel",
     "Big trends make fortunes. Small trades make a living. Know which game you are playing."),
    ("Quantitative Technical Analysis — Howard Bandy",
     "The system quality number tells you whether your edge is real. Aim for SQN above 1.6."),
    ("Successful Algo Trading — Michael Halls-Moore",
     "Regime changes destroy strategies. Always check if market condition matches your system."),
]

def get_random_quote():
    return random.choice(QUOTES)

# ── helpers ──────────────────────────────────────────────────────────────────
def _r(v, d=2, default=0.0):
    try:
        f = float(v)
        if not np.isnan(f):
            return round(f, d)
        return float(default)
    except:
       
        return float(default)

def _pct(a, b):
    if a and b and a > 0:
        return round((b - a) / a * 100, 2)
    return None

def _rr(entry, sl, target):
    risk = abs(entry - sl) if entry and sl else None
    rew  = abs(target - entry) if entry and target else None
    if risk and rew and risk > 0:
        return round(rew / risk, 2)
    return None

def _safe_atr(df):
    try:
        v = df["ATR"].iloc[-1]
        if not pd.isna(v) and v > 0:
            return float(v)
    except:
        pass
    return float(df["Close"].iloc[-1]) * 0.02

# ── stop loss (3 methods) ─────────────────────────────────────────────────────

def compute_stop_loss(df, entry, dow_result=None):
    atr  = _safe_atr(df)
    cmp  = float(df["Close"].iloc[-1])
    results = {}

    # 1. ATR (Bandy) — scale multiplier by volatility
    try:
        ma_atr = float(df["ATR"].rolling(20).mean().iloc[-1])
        mult   = 2.0 if (atr / ma_atr > 1.3) else 1.5
    except:
        mult = 1.5
    results["atr"]    = {"sl": round(entry - mult * atr, 2),
                          "method": f"ATR x{mult} (Bandy)"}

    # 2. Swing low (Murphy)
    sl_s = None
    if dow_result:
        try:
            pts = dow_result.get("minor", {}).get("swing_lows")
            if pts is not None and len(pts) > 0:
                sl_s = round(float(pts["price"].iloc[-1]) * 0.995, 2)
        except:
            pass
    if sl_s is None:
        sl_s = round(float(df["Low"].tail(10).min()) * 0.995, 2)
    results["swing"]  = {"sl": sl_s, "method": "Swing Low (Murphy)"}

    # 3. Turtle 10-day low (Covel)
    results["turtle"] = {"sl": round(float(df["Low"].tail(10).min()) * 0.998, 2),
                          "method": "10-Day Low (Covel Turtle)"}

    # Pick highest (tightest) SL within 1–8% of entry
    valid = {k: v for k, v in results.items()
             if v["sl"] and entry * 0.92 <= v["sl"] <= entry * 0.99}

    if valid:
        best = max(valid, key=lambda k: valid[k]["sl"])
        sl   = valid[best]["sl"]
        meth = valid[best]["method"]
    else:
        sl   = round(entry * 0.97, 2)
        meth = "Fallback 3%"

    return {"sl": sl, "method": meth, "risk_pct": _pct(entry, sl), "all": results}

# ── targets (Covel + Bandy) ───────────────────────────────────────────────────

def compute_targets(df, entry, sl):
    atr  = _safe_atr(df)
    risk = abs(entry - sl)
    t1   = round(max(entry + 2.0 * risk, entry + 2.0 * atr), 2)
    t2   = round(max(entry + 3.5 * risk, entry + 3.5 * atr), 2)
    t3   = round(entry + 5.0 * risk, 2)
    return {"t1": t1, "t2": t2, "t3": t3,
            "risk": round(risk, 2), "risk_pct": _pct(entry, sl)}

# ── regime check (Halls-Moore) ────────────────────────────────────────────────

def check_regime(df):
    atr    = _safe_atr(df)
    try:
        ma_atr = float(df["ATR"].rolling(20).mean().iloc[-1])
        vr     = atr / ma_atr if ma_atr > 0 else 1.0
    except:
        vr = 1.0

    try:
        vol    = float(df["Volume"].iloc[-1])
        ma_vol = float(df["Volume"].rolling(20).mean().iloc[-1])
        vp     = vol / ma_vol if ma_vol > 0 else 1.0
    except:
        vp = 1.0

    try:
        m200  = float(df["SMA_200"].iloc[-1])
        m200b = float(df["SMA_200"].iloc[-21])
        slope = (m200 - m200b) / m200b * 100
    except:
        m200 = None; slope = 0

    # Volatility
    if vr > 2.0:
        vr_note = f"ATR {vr:.1f}x avg — HIGH VOLATILITY. Halve position size."
        vr_c = "#f75f5f"; vr_pen = -20; vr_ok = False
    elif vr > 1.3:
        vr_note = f"ATR {vr:.1f}x avg — Elevated. Reduce size slightly."
        vr_c = "#f5a623"; vr_pen = -10; vr_ok = True
    else:
        vr_note = f"ATR {vr:.1f}x avg — Normal volatility. Full size OK."
        vr_c = "#3dd68c"; vr_pen = 0; vr_ok = True

    # Participation
    if vp >= 1.5:
        vp_note = f"Volume {vp:.1f}x avg — Strong institutional participation "
        vp_c = "#3dd68c"; vp_bon = +5
    elif vp >= 0.8:
        vp_note = f"Volume {vp:.1f}x avg — Normal."
        vp_c = "#f5a623"; vp_bon = 0
    else:
        vp_note = f"Volume {vp:.1f}x avg — Weak participation ⚠️"
        vp_c = "#f75f5f"; vp_bon = -10

    # Trend
    if slope > 0.5:
        tr_note = f"MA200 rising +{slope:.1f}% — Primary uptrend confirmed (Covel)"
        tr_c = "#3dd68c"; tr_bon = +10
    elif slope < -0.5:
        tr_note = f"MA200 falling {slope:.1f}% — Downtrend  (Covel: don't buy)"
        tr_c = "#f75f5f"; tr_bon = -25
    else:
        tr_note = f"MA200 flat {slope:.1f}% — Sideways. Lower confidence."
        tr_c = "#f5a623"; tr_bon = -5

    total = vr_pen + vp_bon + tr_bon
    ok    = vr_ok and tr_bon >= 0

    return {
        "vol_ratio": round(vr, 2), "vol_note": vr_note, "vol_color": vr_c, "vol_penalty": vr_pen,
        "participation": round(vp, 2), "part_note": vp_note, "part_color": vp_c, "part_bonus": vp_bon,
        "trend_note": tr_note, "trend_color": tr_c, "trend_bonus": tr_bon,
        "total_adjustment": total, "regime_ok": ok,
        "summary": ("✅ All regimes favourable" if ok and total >= 0
                    else "⚠️ Regime caution — reduce position" if ok
                    else "❌ Unfavourable regime — skip (Halls-Moore)"),
    }





def _build(name, emoji, entry, sl_d, tgts, etype, conf, reason, cond, bars_ago=0):
    if not entry or not sl_d:
        return None
    sl    = sl_d["sl"]
    decay = max(0, bars_ago - 1) * 0.20
    aconf = max(10, int(conf * (1 - decay)))
    rr1   = _rr(entry, sl, tgts["t1"])
    rr2   = _rr(entry, sl, tgts["t2"])
    rr_ok = rr1 is not None and rr1 >= 1.5
    return {
        "name": name, "emoji": emoji,
        "entry": _r(entry), "sl": _r(sl), "sl_method": sl_d["method"],
        "t1": _r(tgts["t1"]), "t2": _r(tgts["t2"]), "t3": _r(tgts["t3"]),
        "rr_t1": rr1, "rr_t2": rr2,
        "entry_type": etype, "condition": cond,
        "confidence": aconf, "reasoning": reason,
        "risk_pct": sl_d["risk_pct"],
        "r1_pct": _pct(entry, tgts["t1"]),
        "r2_pct": _pct(entry, tgts["t2"]),
        "rr_ok": rr_ok, "bars_ago": bars_ago,
        "decay_note": f"Signal {bars_ago} bar(s) old — confidence reduced" if bars_ago > 0 else "",
    }


def entry_dow(df, dow):
    try:
        if dow["primary"]["trend"] != "UPTREND": return None
        cmp = float(df["Close"].iloc[-1])
        sec = dow["secondary"]["trend"]; mn = dow["minor"]["trend"]
        if sec == "DOWNTREND" and mn == "UPTREND":
            e = cmp; conf = 85; etype = "IMMEDIATE"
            r = ("Classic Dow: Primary UP, Secondary pulled back, Minor turning UP. "
                 "Covel: 'The trend is your friend — ride the tide.'")
            c = "Buy at CMP — Dow 3-tier alignment"
        elif mn == "UPTREND":
            ma20 = _r(df["SMA_20"].iloc[-1]) if "SMA_20" in df.columns else _r(cmp*0.98)
            e = float(df["SMA_20"].iloc[-1]) if "SMA_20" in df.columns else cmp*0.98
            conf = 65; etype = "LIMIT"
            r = (f"Primary uptrend. Murphy: 'Buy pullbacks in the direction of the primary trend.' "
                 f"Limit at MA20 ₹{ma20}.")
            c = f"Limit buy near MA20 ≈ ₹{ma20}"
        else:
            return None
        sl = compute_stop_loss(df, e, dow)
        tg = compute_targets(df, e, sl["sl"])
        return _build("Dow Theory","🌊", e, sl, tg, etype, conf, r, c)
    except: return None

def entry_rsi(df, ind):
    try:
        rd = ind["rsi"]; rsi = rd.get("value"); div = rd.get("divergence","NONE")
        if rsi is None: return None
        cmp = float(df["Close"].iloc[-1])
        ma200 = df["SMA_200"].iloc[-1] if "SMA_200" in df.columns else None
        if ma200 and cmp < float(ma200): return None
        if div == "BULLISH_DIVERGENCE":
            e=cmp;conf=82;etype="IMMEDIATE"
            r=(f"RSI Bullish Divergence detected. RSI:{rsi:.0f}. "
               "Murphy Ch.10: 'Divergence is one of the most valuable concepts in TA.'")
            c="Buy at CMP — RSI divergence confirmed"
        elif rsi < 35:
            e=cmp;conf=70;etype="LIMIT"
            r=(f"RSI oversold {rsi:.0f}. Bandy: 'Wait for confirmation — oversold can stay oversold.' "
               "Enter when RSI crosses above 40.")
            c=f"Limit buy — wait for RSI to cross 40 (now {rsi:.0f})"
        elif 50<=rsi<=62:
            e=cmp;conf=67;etype="IMMEDIATE"
            r=(f"RSI {rsi:.0f} healthy momentum zone. Not overbought, room to run. "
               "Murphy: 'RSI between 40-80 in uptrend is normal.'")
            c=f"Buy at CMP — RSI {rsi:.0f} bullish zone"
        elif rsi>72: return None
        else: return None
        sl=compute_stop_loss(df,e); tg=compute_targets(df,e,sl["sl"])
        return _build("RSI Signal","📊",e,sl,tg,etype,conf,r,c)
    except: return None

def entry_macd(df, ind):
    try:
        m=ind["macd"]; sig=m.get("signal",""); cross=m.get("cross","NONE")
        hist=m.get("histogram"); mv=m.get("macd")
        if sig in ("N/A","BEARISH","SELL SIGNAL"): return None
        cmp=float(df["Close"].iloc[-1])
        ma200=df["SMA_200"].iloc[-1] if "SMA_200" in df.columns else None
        if ma200 and cmp<float(ma200): return None
        if cross=="BULLISH_CROSS":
            e=cmp;conf=84;etype="IMMEDIATE"
            r=(f"MACD Bullish Crossover. Murphy Ch.10: 'MACD crossover is widely used.' "
               f"MACD:{_r(mv,3)}")
            c="Buy at CMP — fresh MACD bullish crossover"
        elif sig=="BULLISH" and hist and hist>0:
            ma20=float(df["SMA_20"].iloc[-1]) if "SMA_20" in df.columns else cmp*0.98
            e=min(cmp,ma20);conf=68;etype="LIMIT"
            r=(f"MACD bullish, histogram positive ({_r(hist,3)}). "
               "Halls-Moore: 'Enter on pullbacks, not after extended moves.'")
            c=f"Limit buy at MA20 ≈ ₹{_r(ma20)}"
        else: return None
        sl=compute_stop_loss(df,e); tg=compute_targets(df,e,sl["sl"])
        return _build("MACD Signal","📉📈",e,sl,tg,etype,conf,r,c)
    except: return None

def entry_bollinger(df, ind):
    try:
        bb=ind["bb"]; sig=bb.get("signal",""); sq=bb.get("squeeze",False)
        pct=bb.get("pct_b"); up=bb.get("upper"); lo=bb.get("lower"); mi=bb.get("mid")
        if sig in ("N/A","NEUTRAL") and not sq: return None
        cmp=float(df["Close"].iloc[-1])
        ma200=df["SMA_200"].iloc[-1] if "SMA_200" in df.columns else None
        if sq:
            e=cmp;conf=80;etype="IMMEDIATE"
            r=("BB Squeeze — bands at 120-bar minimum. Murphy Ch.9: 'Narrow bands precede explosive moves.' "
               "Bandy: 'Low→high volatility transition is tradeable.'")
            c="Buy at CMP — BB squeeze about to release"
            sl_d=compute_stop_loss(df,e)
        elif sig=="BREAKOUT":
            e=cmp;conf=76;etype="IMMEDIATE"
            r=(f"Price broke above upper BB ₹{_r(up)}. Murphy: 'Walking upper band = strong uptrend.' "
               f"SL at mid-band ₹{_r(mi)}.")
            c=f"Buy at CMP — above BB upper ₹{_r(up)}"
            sl_d=compute_stop_loss(df,e)
            if mi: sl_d["sl"]=round(float(mi)*0.998,2); sl_d["method"]="Mid-band SL (Murphy)"
        elif sig=="OVERSOLD" and pct and pct<=0.2:
            if ma200 and cmp<float(ma200): return None
            e=float(lo) if lo else cmp;conf=68;etype="LIMIT"
            r=(f"Price near lower BB ₹{_r(lo)} in uptrend. Murphy: 'Lower band in uptrend = buy opp.' "
               f"T1 at mid ₹{_r(mi)}, T2 at upper ₹{_r(up)}.")
            c=f"Limit buy at lower BB ≈ ₹{_r(lo)}"
            sl_d=compute_stop_loss(df,e)
            if lo: sl_d["sl"]=round(float(lo)*0.99,2); sl_d["method"]="1% below lower BB (Murphy)"
        else: return None
        tg=compute_targets(df,e,sl_d["sl"])
        if lo and up and sig in ("OVERSOLD","SQUEEZE"):
            if mi: tg["t1"]=float(mi)
            if up: tg["t2"]=float(up)
        return _build("Bollinger Bands","🎯",e,sl_d,tg,etype,conf,r,c)
    except: return None

def entry_stochastic(df, cnd):
    try:
        st=cnd["stochastic"]; sig=st.get("signal",""); k=st.get("k"); cross=st.get("cross","NONE")
        if sig in ("N/A","BEARISH","OVERBOUGHT","SELL SIGNAL"): return None
        cmp=float(df["Close"].iloc[-1])
        ma200=df["SMA_200"].iloc[-1] if "SMA_200" in df.columns else None
        if ma200 and cmp<float(ma200): return None
        if sig=="BUY SIGNAL" and cross=="BULLISH":
            e=cmp;conf=78;etype="IMMEDIATE"
            r=(f"Stochastic %K({k}) crossed above %D in oversold. "
               "Murphy Ch.10: 'Stochastic crossover in oversold = high probability buy.'")
            c=f"Buy at CMP — Stochastic crossover (K={k})"
        elif k and k<20:
            e=cmp;conf=58;etype="LIMIT"
            r=(f"Stochastic oversold {k:.0f}. Bandy: 'Confirmation prevents catching falling knives.'")
            c=f"Wait for %K crossover (now {k:.0f})"
        else: return None
        sl=compute_stop_loss(df,e); tg=compute_targets(df,e,sl["sl"])
        return _build("Stochastic","🔄",e,sl,tg,etype,conf,r,c)
    except: return None

def entry_golden_cross(df, cont):
    try:
        mc=cont["ma_crosses"]
        if not mc.get("ma50_above_ma200"): return None
        cmp=float(df["Close"].iloc[-1])
        ma50 =float(df["SMA_50"].iloc[-1])  if "SMA_50"  in df.columns else None
        ma200=float(df["SMA_200"].iloc[-1]) if "SMA_200" in df.columns else None
        atr=_safe_atr(df)
        if mc.get("golden_cross"):
            e=cmp;conf=87;etype="IMMEDIATE"
            r=(f"Golden Cross on {mc.get('golden_cross_date','')}! "
               "Murphy Ch.9: 'Most reliable long-term buy signal.' "
               "Covel: 'The trend is now officially UP — ride it.'")
            c="Buy at CMP — fresh Golden Cross"
        elif ma50 and cmp<=ma50*1.015:
            e=ma50;conf=73;etype="LIMIT"
            r=(f"Pullback to MA50 ₹{_r(ma50)} in golden cross alignment. "
               "Murphy: 'MA50 is dynamic support in uptrend.' "
               "Halls-Moore: 'Pullback entries improve R:R.'")
            c=f"Limit buy at MA50 ≈ ₹{_r(ma50)}"
        else:
            e=ma50 if ma50 else cmp;conf=55;etype="WAIT"
            r=(f"Golden cross but price {_r((cmp/(ma50 or cmp)-1)*100)}% above MA50. "
               "Bandy: 'Chasing entry reduces R:R. Wait for pullback.'")
            c=f"Wait for pullback to MA50 ≈ ₹{_r(ma50)}"
        sl_d=compute_stop_loss(df,e)
        if ma200: sl_d["sl"]=max(sl_d["sl"],round(ma200*0.99,2)); sl_d["method"]+=" + MA200 floor"
        tg=compute_targets(df,e,sl_d["sl"])
        return _build("Golden Cross","🌟",e,sl_d,tg,etype,conf,r,c)
    except: return None

def entry_sr(df, cont):
    try:
        sr=cont["sr"]; cmp=float(df["Close"].iloc[-1]); atr=_safe_atr(df)
        ns=sr.get("nearest_support"); nr=sr.get("nearest_resistance")
        if ns:
            sp=float(ns["price"]); sd=float(ns["dist_pct"]); ss=ns["strength"]
            if -3.0<=sd<=0.5:
                e=round(sp*1.002,2); conf=55+(20 if ss=="STRONG" else 10 if ss=="MODERATE" else 0)
                r=(f"{ss} support ₹{_r(sp)} ({ns['touches']} touches). "
                   "Murphy Ch.4: 'The more times a level is tested, the more significant.' "
                   "SL 2% below support.")
                c=f"Limit buy near support ≈ ₹{_r(e)}"
                sl_d=compute_stop_loss(df,e); sl_d["sl"]=round(sp*0.98,2); sl_d["method"]="2% below support (Murphy)"
                tg=compute_targets(df,e,sl_d["sl"])
                if nr: tg["t1"]=max(tg["t1"],float(nr["price"]))
                return _build("Support Level","📏",e,sl_d,tg,"LIMIT",conf,r,c)
        if nr:
            rp=float(nr["price"]); rd=float(nr["dist_pct"]); rs=nr["strength"]
            if 0<=rd<=2.0:
                e=round(rp*1.005,2); conf=50+(25 if rs=="STRONG" else 12 if rs=="MODERATE" else 0)
                r=(f"{rs} resistance ₹{_r(rp)} ({nr['touches']} touches). "
                   "Murphy: 'Resistance broken becomes support.' Buy stop 0.5% above.")
                c=f"Buy stop ₹{_r(e)} above resistance ₹{_r(rp)}"
                sl_d=compute_stop_loss(df,e); sl_d["sl"]=round(rp*0.98,2); sl_d["method"]="Below broken resistance (Murphy)"
                tg=compute_targets(df,e,sl_d["sl"])
                return _build("Resistance Break","📏⬆️",e,sl_d,tg,"BREAKOUT",conf,r,c)
        return None
    except: return None

def entry_pattern(df, pat, cont):
    try:
        cmp=float(df["Close"].iloc[-1]); atr=_safe_atr(df)
        pats=(pat.get("patterns",[]) if pat and pat.get("found") else []) + \
             (cont.get("patterns",[]) if cont and cont.get("found") else [])
        bull=[p for p in pats if p.get("direction")=="BULLISH"]
        if not bull: return None
        best=sorted(bull,key=lambda x:x.get("confidence",0),reverse=True)[0]
        nl=best.get("neckline"); tgt=best.get("price_target")
        pname=best.get("name","").replace("_"," "); cp=best.get("confidence",50)
        broke=best.get("confirmed",False) or best.get("breakout",False)
        if broke:
            e=cmp;etype="IMMEDIATE"
            r=(f"{pname} breakout CONFIRMED. Murphy Ch.6: 'Enter on confirmed close above boundary.' "
               f"SL back below neckline ₹{_r(nl)}.")
            c=f"Buy at CMP — {pname} confirmed"
            sl_d=compute_stop_loss(df,e)
            if nl: sl_d["sl"]=round(float(nl)*0.98,2); sl_d["method"]=f"Below {pname} neckline"
        elif nl and float(nl)>cmp:
            e=round(float(nl)*1.005,2);etype="BREAKOUT"
            r=(f"{pname} forming (conf {cp}%). Murphy: 'Wait for close above neckline.' "
               "Halls-Moore: '0.5% buffer improves fill quality.'")
            c=f"Buy stop ₹{_r(e)} above {pname} neckline ₹{_r(nl)}"
            sl_d=compute_stop_loss(df,e)
        else:
            e=round(cmp*0.99,2);etype="LIMIT"
            r=f"{pname} forming — slight pullback entry."
            c=f"Limit buy ≈ ₹{_r(e)}"
            sl_d=compute_stop_loss(df,e)
        tg=compute_targets(df,e,sl_d["sl"])
        if tgt and float(tgt)>e: tg["t1"]=float(tgt)
        em={"SYMMETRICAL TRIANGLE":"🔺","ASCENDING TRIANGLE":"📐⬆️","FALLING WEDGE":"📉🔺",
            "BULL FLAG":"🚩","BULL PENNANT":"📐","CUP AND HANDLE":"☕","RECTANGLE":"▭"}.get(pname.upper(),"📊")
        return _build(pname,em,e,sl_d,tg,etype,cp,r,c)
    except: return None

def entry_reversal(df, rev):
    try:
        if not rev.get("found"): return None
        bull=[p for p in rev["patterns"] if p.get("direction")=="BULLISH"]
        if not bull: return None
        best=sorted(bull,key=lambda x:x.get("confidence",0),reverse=True)[0]
        nl=best.get("neckline"); tgt=best.get("price_target")
        pname=best.get("name","").replace("_"," "); cp=best.get("confidence",50)
        cmp=float(df["Close"].iloc[-1])
        if best.get("confirmed"):
            e=cmp;etype="IMMEDIATE"
            r=(f"{pname} confirmed above neckline ₹{_r(nl)}. "
               "Murphy Ch.5: 'Volume should expand on neckline breakout.' Target: ₹{_r(tgt)}.")
            c=f"Buy at CMP — {pname} confirmed"
        elif nl and float(nl)>cmp:
            e=round(float(nl)*1.005,2);etype="BREAKOUT"
            r=(f"{pname} forming. Murphy: 'Buy stop just above neckline for confirmation.' Target: ₹{_r(tgt)}.")
            c=f"Buy stop ₹{_r(e)} above neckline ₹{_r(nl)}"
        else: return None
        sl_d=compute_stop_loss(df,e)
        if nl: sl_d["sl"]=round(float(nl)*0.98,2); sl_d["method"]=f"Below {pname} neckline"
        tg=compute_targets(df,e,sl_d["sl"])
        if tgt and float(tgt)>e: tg["t1"]=float(tgt)
        em={"INVERSE HEAD AND SHOULDERS":"🙃","DOUBLE BOTTOM":"Ⓦ","TRIPLE BOTTOM":"🏔️"}.get(pname.upper(),"🔄")
        return _build(pname,em,e,sl_d,tg,etype,cp,r,c)
    except: return None

def entry_candlestick(df, cnd):
    try:
        bull=[c for c in cnd.get("bullish",[]) if c.get("bars_ago",99)<=2 and c.get("strength")=="STRONG"]
        if not bull: return None
        best=bull[0]; cmp=float(df["Close"].iloc[-1])
        ma200=df["SMA_200"].iloc[-1] if "SMA_200" in df.columns else None
        if ma200 and cmp<float(ma200): return None
        ba=best.get("bars_ago",0); pl=float(df["Low"].iloc[-(ba+1)])
        name=best.get("name","").replace("_"," "); conf=72
        r=(f"{name} pattern ({'today' if ba==0 else str(ba)+' bars ago'}). {best.get('desc','')} "
           "Murphy Ch.12: 'SL below pattern low is the natural stop.'")
        c=f"Buy at CMP — {name}"
        sl_d=compute_stop_loss(df,cmp); sl_d["sl"]=round(pl*0.995,2); sl_d["method"]="Below pattern candle low (Murphy Ch.12)"
        tg=compute_targets(df,cmp,sl_d["sl"])
        return _build(f"Candle: {name}",best.get("emoji","🕯️"),cmp,sl_d,tg,
                      "IMMEDIATE" if ba==0 else "LIMIT",conf,r,c,bars_ago=ba)
    except: return None

def entry_52w_turtle(df):
    try:
        cmp=float(df["Close"].iloc[-1]); atr=_safe_atr(df)
        w52=float(df["High"].rolling(252,min_periods=50).max().iloc[-1])
        vr=float(df["Vol_ratio"].iloc[-1]) if "Vol_ratio" in df.columns else 1.0
        dist=(cmp-w52)/w52*100
        if dist<-5.0: return None
        low10=float(df["Low"].tail(10).min())
        if dist>=-1.0:
            e=cmp;conf=82+(8 if vr>=2.0 else 0);etype="IMMEDIATE"
            r=(f"52W High BREAKOUT ₹{_r(cmp)} (52W: ₹{_r(w52)}), vol {_r(vr)}x. "
               "Covel Turtle System 1: '20-day high breakout is the entry.' "
               "Murphy Ch.4: 'New highs attract momentum buyers.' "
               f"Turtle SL: 10-day low ₹{_r(low10)}.")
            c=f"Buy at CMP — 52W breakout, {_r(vr)}x volume"
        else:
            e=round(w52*1.005,2);conf=72;etype="BREAKOUT"
            r=(f"Approaching 52W high ₹{_r(w52)} — {abs(dist):.1f}% away. "
               "Covel: 'Don't anticipate breakouts — wait for confirmation.'")
            c=f"Buy stop ₹{_r(e)} above 52W high ₹{_r(w52)}"
        sl_d=compute_stop_loss(df,e)
        ts=round(low10*0.998,2)
        if abs(e-ts)/e<=0.08: sl_d["sl"]=ts; sl_d["method"]="Turtle 10-Day Low (Covel)"
        tg=compute_targets(df,e,sl_d["sl"])
        return _build("52W + Turtle","🐢🚀",e,sl_d,tg,etype,conf,r,c)
    except: return None

# target acheivebility :
def check_target_achievability(df, entry, sl, t1, t2) -> dict:
    """
    For a given entry/sl/t1/t2 — how many days to reach each target
    and what is the historical SL hit probability.
    """
    if not entry or not t1:
        return {"t1": None, "t2": None, "sl": None}

    closes = df["Close"]
    atr    = float(df["ATR"].iloc[-1]) if "ATR" in df.columns and not pd.isna(df["ATR"].iloc[-1]) else float(closes.iloc[-1]) * 0.02
    atr_pct = round(atr / float(closes.iloc[-1]) * 100, 2)
    def _days_to_target(target):
        if not target or target <= entry:
            return None

        move_abs = abs(target - entry)
        move_pct = round(move_abs / entry * 100, 2)

        # ATR-based estimate
        atr_days = round(move_abs / atr, 0) if atr > 0 else None
        weeks    = round(atr_days / 5, 1) if atr_days else None

        # Historical — look at actual past trades
        # How many bars did it take to move this % from any given point
        days_taken = []
        closes_arr = closes.values
        for i in range(len(closes_arr) - 1):
            start = closes_arr[i]
            for j in range(i + 1, min(i + 60, len(closes_arr))):
                move = (closes_arr[j] - start) / start * 100
                if move >= move_pct:
                    days_taken.append(j - i)
                    break

        if days_taken:
            hist_avg    = round(statistics.mean(days_taken), 0)
            hist_median = round(statistics.median(days_taken), 0)
            hist_min    = min(days_taken)
            hist_max    = max(days_taken)
            achieved    = len(days_taken)
            total_tries = len(closes_arr) - 1
            success_rate = round(achieved / total_tries * 100, 1)
        else:
            hist_avg = hist_median = hist_min = hist_max = None
            success_rate = 0
            achieved     = 0

        # Final estimate — blend ATR days and historical median
        if hist_median and atr_days:
            est_days  = round((atr_days + hist_median) / 2, 0)
        elif hist_median:
            est_days  = hist_median
        else:
            est_days  = atr_days

        est_weeks = round(est_days / 5, 1) if est_days else None

        # Verdict
        if success_rate >= 60 and est_days and est_days <= 15:
            verdict       = "LIKELY FAST"
            verdict_color = "#3dd68c"
            verdict_note  = f"Historically reached in ~{int(est_days)} days ({int(est_weeks*5//5)} weeks)"
        elif success_rate >= 40:
            verdict       = "LIKELY"
            verdict_color = "#7c6af7"
            verdict_note  = f"Usually takes ~{int(est_days)} days if momentum holds"
        elif success_rate >= 20:
            verdict       = "POSSIBLE"
            verdict_color = "#f5a623"
            verdict_note  = f"Achieved only {success_rate}% of the time historically"
        else:
            verdict       = "UNLIKELY"
            verdict_color = "#f75f5f"
            verdict_note  = f"Rarely moves this much — only {success_rate}% historically"

        return {
            "target":       round(target, 2),
            "move_pct":     move_pct,
            "est_days":     int(est_days) if est_days else None,
            "est_weeks":    est_weeks,
            "atr_days":     int(atr_days) if atr_days else None,
            "hist_median_days": int(hist_median) if hist_median else None,
            "hist_min_days":    int(hist_min) if hist_min else None,
            "hist_max_days":    int(hist_max) if hist_max else None,
            "success_rate": success_rate,
            "times_achieved": achieved,
            "verdict":      verdict,
            "verdict_color":verdict_color,
            "verdict_note": verdict_note,
        }

    def _sl_analysis(sl):
        if not sl or sl >= entry:
            return None

        sl_pct   = round(abs(entry - sl) / entry * 100, 2)
        closes_arr = closes.values

        # How often does stock drop this % within 5 bars from any point
        sl_hits = 0
        total   = 0
        for i in range(len(closes_arr) - 5):
            start    = closes_arr[i]
            worst_5d = min(closes_arr[i+1:i+6])
            drop_pct = abs((worst_5d - start) / start * 100)
            if drop_pct >= sl_pct:
                sl_hits += 1
            total += 1

        hit_rate = round(sl_hits / total * 100, 1) if total > 0 else 0

        if hit_rate < 15:
            verdict       = "SAFE"
            verdict_color = "#3dd68c"
            verdict_note  = f"Only {hit_rate}% chance of hitting SL in any 5-day window"
        elif hit_rate < 30:
            verdict       = "MODERATE RISK"
            verdict_color = "#f5a623"
            verdict_note  = f"{hit_rate}% chance of hitting SL — set alerts"
        else:
            verdict       = "HIGH RISK"
            verdict_color = "#f75f5f"
            verdict_note  = f"{hit_rate}% chance of hitting SL — SL may be too tight"

        return {
            "sl":           round(sl, 2),
            "sl_pct":       sl_pct,
            "hit_rate_5d":  hit_rate,
            "verdict":      verdict,
            "verdict_color":verdict_color,
            "verdict_note": verdict_note,
        }

    t1_result = _days_to_target(t1)
    t2_result = _days_to_target(t2) if t2 else None
    sl_result = _sl_analysis(sl)

    # T2 extra — days from T1 to T2 (not from entry)
    if t1_result and t2_result:
        extra_days = None
        if t1_result["est_days"] and t2_result["est_days"]:
            extra_days = max(0, t2_result["est_days"] - t1_result["est_days"])
        t2_result["extra_days_from_t1"] = extra_days

    return {
        "t1":  t1_result,
        "t2":  t2_result,
        "sl":  sl_result,
        "atr": {
        "value": round(atr, 2),
        "pct":   atr_pct,
        "note":  f"ATR ₹{round(atr, 2)} ({atr_pct}% of price) — daily expected move"
        }
    }

import statistics

def compute_overall_entry(all_entries, df, regime, capital, risk_pct):
    valid = [e for e in all_entries if e is not None and e.get("entry")]

    if not valid:
        return {
            "found": False,
            "reason": "No entry signals available",
            "entries": [],
            "regime": regime,
        }

    # ── Direction consensus ──────────────────────────────────────────────────
    bullish = [e for e in valid if e.get("rr_t1", 0) > 0]  # adjust per your schema
    n_signals = len(valid)

    # ── ENTRY: weighted by confidence, not plain average ────────────────────
    # High confidence signals (RSI div 82%, breakout 100%) should pull entry
    # toward them more than low confidence ones (Golden Cross 55%)
    total_conf = sum(e.get("confidence", 50) for e in valid)
    weighted_entry = sum(
        e["entry"] * e.get("confidence", 50) for e in valid
    ) / total_conf if total_conf > 0 else statistics.median(e["entry"] for e in valid)

    # ── ENTRY RANGE (your "range" request) ───────────────────────────────────
    entries_list   = sorted(e["entry"] for e in valid)
    entry_median   = statistics.median(entries_list)
    raw_spread_pct = (entries_list[-1] - entries_list[0]) / entry_median * 100

    MAX_RANGE_PCT = 2.0

    if raw_spread_pct <= MAX_RANGE_PCT:
        entry_low, entry_high = entries_list[0], entries_list[-1]
    else:
        entry_low  = round(entry_median * (1 - MAX_RANGE_PCT / 200), 2)
        entry_high = round(entry_median * (1 + MAX_RANGE_PCT / 200), 2)

    # ── SL: use MEDIAN not average (resistant to outliers) ──────────────────
    # Your data shows SLs from 1759 to 1806 — huge spread
    # Median protects against one bad signal setting unrealistic SL
    sls = sorted(e["sl"] for e in valid)
    sl_median = statistics.median(sls)

    # Widest acceptable SL = tightest risk protection
    # Use the MOST CONSERVATIVE (lowest) SL among high-confidence signals only
    high_conf_entries = [e for e in valid if e.get("confidence", 0) >= 60]
    t_high_conf_enrties = len(high_conf_entries)
    if high_conf_entries:
        sl_from_strong = statistics.median(e["sl"] for e in high_conf_entries)
    else:
        sl_from_strong = sl_median

    final_sl = min(sl_from_strong, sl_median)  # safer of the two

    # Sanity check — SL must give meaningful risk room (Murphy/Bandy: min 1.5-2%)
    min_risk_pct = 1.5
    if (entry_median - final_sl) / entry_median * 100 < min_risk_pct:
        final_sl = round(entry_median * (1 - min_risk_pct / 100), 2)

    # ── TARGETS: median across all signals ───────────────────────────────────
    t1_median = statistics.median(e["t1"] for e in valid if e.get("t1"))
    t2_median = statistics.median(e["t2"] for e in valid if e.get("t2"))
    t3_values = [e["t3"] for e in valid if e.get("t3")]
    t3_median = statistics.median(t3_values) if t3_values else None

    # ── MODE — most frequently suggested entry_type ──────────────────────────
    entry_types = [e.get("entry_type") for e in valid if e.get("entry_type")]
    try:
        mode_entry_type = statistics.mode(entry_types)
    except statistics.StatisticsError:
        mode_entry_type = entry_types[0] if entry_types else "WAIT"

    # ── R:R from median values ───────────────────────────────────────────────
    risk_per_share = entry_median - final_sl
    rr_t1 = round((t1_median - entry_median) / risk_per_share, 2) if risk_per_share > 0 else 0
    rr_t2 = round((t2_median - entry_median) / risk_per_share, 2) if risk_per_share > 0 else 0

    # ── Overall confidence — average confidence weighted by signal count ────
    avg_confidence = round(sum(e.get("confidence", 0) for e in valid) / n_signals, 1)

    # Boost confidence if signals agree closely (low entry spread = high agreement)
    entry_spread_pct = (entry_high - entry_low) / entry_median * 100
    agreement_bonus = 10 if entry_spread_pct < 2 else 5 if entry_spread_pct < 4 else 0
    final_confidence = min(avg_confidence + agreement_bonus, 100)

    # ── Grade from confidence ────────────────────────────────────────────────
    if final_confidence >= 80 and t_high_conf_enrties > 7:
        grade, grade_color, grade_desc = "A+", "#3dd68c", "Excellent setup — high signal agreement"
    elif final_confidence >= 65 and  t_high_conf_enrties > 5:
        grade, grade_color, grade_desc = "A", "#3dd68c", "Strong setup — most signals agree"
    elif final_confidence >= 50 and t_high_conf_enrties > 4:
        grade, grade_color, grade_desc = "B", "#7c6af7", "Good setup — confirm with volume"
    elif final_confidence >= 35 and t_high_conf_enrties > 3:
        grade, grade_color, grade_desc = "C", "#f5a623", "Moderate setup — wait for confirmation"
    else:
        grade, grade_color, grade_desc = "D", "#f75f5f", "Weak setup — high uncertainty"

    # ── Position sizing ───────────────────────────────────────────────────────
  
    target_acheive = check_target_achievability(df = df , sl = final_sl , entry=weighted_entry , t1 = t1_median , t2 = t2_median)

    return {
        "found": n_signals >= 4,  # require at least 2 agreeing signals
        "n_signals": n_signals,
        "t_high_conf_signals":t_high_conf_enrties,

        # Single point entry (weighted, for quick display)
        # "entry": round(weighted_entry, 2),
        "entry": round(entry_low, 2),
        

        # Range — your request
        "entry_range": {
            "low":    round(entry_low, 2),
            "high":   round(entry_high, 2),
            "median": round(entry_median, 2),
            "spread_pct": round(raw_spread_pct, 2),   # show actual signal disagreement
            "clamped": raw_spread_pct > MAX_RANGE_PCT
        },

        # "sl": round(final_sl, 2),
        "sl": round(min(sls), 2),
        "sl_range": {
            "tightest":  round(min(sls), 2),
            "widest":    round(max(sls), 2),
            "median":    round(sl_median, 2),
            "used":      round(final_sl, 2),
            "method":    "Conservative median of high-confidence signals",
        },

        "t1": round(t1_median, 2),
        "t2": round(t2_median, 2),
        "t3": round(t3_median, 2) if t3_median else None,

        "rr_t1": rr_t1,
        "rr_t2": rr_t2,

        "entry_type": mode_entry_type,   # mode, not first signal's type
        "confidence": final_confidence,
        "grade": grade,
        "grade_color": grade_color,
        "grade_desc": grade_desc,

        "risk_pct": round((entry_median - final_sl) / entry_median * 100, 2),
        "r1_pct": round((t1_median - entry_median) / entry_median * 100, 2),
        "r2_pct": round((t2_median - entry_median) / entry_median * 100, 2),
        "target_hits" : target_acheive,
    

        "regime": regime,
        "entries": valid,   
    }

# ── MASTER ────────────────────────────────────────────────────────────────────

def get_full_entry_analysis(df, dow, ind, pat, cont, rev, cnd,
                             capital=100000, risk_pct=1.0):
    regime = check_regime(df)

    all_entries = [
        entry_dow(df,dow)           if dow  else None,
        entry_rsi(df,ind)           if ind  else None,
        entry_macd(df,ind)          if ind  else None,
        entry_bollinger(df,ind)     if ind  else None,
        entry_stochastic(df,cnd)    if cnd  else None,
        entry_golden_cross(df,cont) if cont else None,
        entry_sr(df,cont)           if cont else None,
        entry_pattern(df,pat,cont)  if pat and cont else None,
        entry_reversal(df,rev)      if rev  else None,
        entry_candlestick(df,cnd)   if cnd  else None,
        entry_52w_turtle(df),
    ]

    return compute_overall_entry(all_entries, df, regime, capital, risk_pct)
