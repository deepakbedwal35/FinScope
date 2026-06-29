"""
fundamentals.py
===============
Fetches and formats fundamental data for any NSE stock using yfinance.
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, date


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _r(v, d=2):
    try:
        f = float(v)
        return round(f, d) if not (isinstance(f, float) and np.isnan(f)) else None
    except Exception:
        return None


def _crore(v):
    try:
        f = float(v)
        if abs(f) >= 1e12: return f"₹{f/1e12:.2f}L Cr"
        if abs(f) >= 1e9:  return f"₹{f/1e9:.0f} Cr"
        if abs(f) >= 1e7:  return f"₹{f/1e7:.0f}L"
        return f"₹{f:,.0f}"
    except Exception:
        return "—"


def _pct_change(new, old):
    try:
        if old and old != 0:
            return round((new - old) / abs(old) * 100, 1)
    except Exception:
        pass
    return None


def _color(v, positive_good=True):
    if v is None: return "#aaaaaa"
    if positive_good:
        return "#3dd68c" if v > 0 else "#f75f5f" if v < 0 else "#aaaaaa"
    return "#f75f5f" if v > 0 else "#3dd68c" if v < 0 else "#aaaaaa"


def _arrow(v):
    if v is None: return "—"
    return f"▲ +{v}%" if v > 0 else f"▼ {v}%" if v < 0 else f"→ {v}%"


def calculate_dividend_yield(dividends, current_price):
    if not dividends or not current_price:
        return None
    total = 0
    now = datetime.now()
    for d in dividends:
        try:
            dt = datetime.strptime(d["date"], "%d %b %Y")
            if (now - dt).days <= 365:
                total += float(d["amount"])
        except Exception:
            continue
    if current_price > 0:
        return round((total / current_price) * 100, 2)
    return None




def _quality_check(ratios: dict) -> dict:
    """
    Schilit/Diamonds-style quality gate, condensed into flat fields
    so React doesn't need to parse nested book logic.
    """
    pe     = ratios.get("pe_ratio")
    pb     = ratios.get("pb_ratio")
    roe    = ratios.get("roe")
    de     = ratios.get("debt_to_equity")
    margin = ratios.get("profit_margin")

    flags = []
    score = 0
    blocked = False

    if pe is not None:
        if pe < 0:
            flags.append("Negative PE — company reporting losses")
            blocked = True
        elif pe > 150:
            flags.append("Extremely high PE — possible overvaluation")
        elif 10 <= pe <= 35:
            score += 20

    if de is not None:
        if de > 3:
            flags.append("Very high debt/equity — leverage risk")
            blocked = True
        elif de > 1.5:
            flags.append("Elevated debt/equity")
        elif de < 1:
            score += 20

    if margin is not None:
        if margin < 0:
            flags.append("Negative profit margin — core business loss-making")
            blocked = True
        elif margin < 3:
            flags.append("Very thin profit margin")
        elif margin >= 10:
            score += 20

    if roe is not None:
        if roe >= 15:
            score += 25
        elif roe < 5:
            flags.append("Weak ROE — capital not productively used")

    if pb is not None and pb <= 3:
        score += 15

    score = max(0, min(100, score))

    if blocked:
        verdict = "AVOID"
        color   = "#f75f5f"
    elif score >= 65:
        verdict = "STRONG"
        color   = "#3dd68c"
    elif score >= 35:
        verdict = "MODERATE"
        color   = "#f5a623"
    else:
        verdict = "WEAK"
        color   = "#f75f5f"

    return {
        "score":   score,
        "verdict": verdict,
        "color":   color,
        "blocked": blocked,
        "flags":   flags,
    }


# ─────────────────────────────────────────────────────────────────────────────
# MAIN FETCH
# ─────────────────────────────────────────────────────────────────────────────

def get_fundamentals(symbol: str) -> dict:
    """
    Fetch all fundamental data for a stock.
    symbol: NSE symbol without .NS (e.g. 'RELIANCE')
    Returns structured dict for UI rendering.
    """
    result = {
        "symbol":    symbol.upper(),
        "info":      {},
        "quarterly": [],
        "annual":    [],
        "dividends": [],
        "ratios":    {},
        "quality":   {},
        "error":     None,
    }

    try:
        ticker = yf.Ticker(symbol + ".NS")
        info   = ticker.info or {}

        # ── Company Info ──────────────────────────────────────────────────
        result["info"] = {
            "name":        info.get("longName", symbol),
            "sector":      info.get("sector", "—"),
            "industry":    info.get("industry", "—"),
            "employees":   info.get("fullTimeEmployees"),
            "website":     info.get("website", ""),
            "description": (info.get("longBusinessSummary", "")[:400] + "...")
                            if info.get("longBusinessSummary", "") else "—",
            "exchange":    info.get("exchange", "NSE"),
            "currency":    info.get("currency", "INR"),
        }

        price = info.get("currentPrice") or info.get("regularMarketPrice")

        # ── Dividends FIRST — fixed: must be fetched before dividend yield ──
        try:
            div = ticker.dividends
            if div is not None and len(div) > 0:
                div = div.sort_index(ascending=False).head(8)
                divs = []
                for dt, amt in div.items():
                    try:
                        d_str = dt.strftime("%d %b %Y") if hasattr(dt, "strftime") else str(dt)[:10]
                        divs.append({
                            "date":       d_str,
                            "amount":     _r(float(amt), 2),
                            "amount_str": f"₹{_r(float(amt), 2)}/share",
                            "year":       str(dt)[:4],
                        })
                    except Exception:
                        continue
                result["dividends"] = divs
        except Exception:
            result["dividends"] = []

        # Now dividend yield can be computed correctly
        calculated_yield = calculate_dividend_yield(result["dividends"], price)

        # ── Key Ratios ────────────────────────────────────────────────────
        mcap = info.get("marketCap")
        result["ratios"] = {
            "market_cap":       _crore(mcap) if mcap else "—",
            "market_cap_raw":   mcap,
            "pe_ratio":         _r(info.get("trailingPE")),
            "forward_pe":       _r(info.get("forwardPE")),
            "pb_ratio":         _r(info.get("priceToBook")),
            "ps_ratio":         _r(info.get("priceToSalesTrailing12Months")),
            "roe":              _r((info.get("returnOnEquity") or 0) * 100, 1),
            "roa":              _r((info.get("returnOnAssets") or 0) * 100, 1),
            "profit_margin":    _r((info.get("profitMargins") or 0) * 100, 1),
            "operating_margin": _r((info.get("operatingMargins") or 0) * 100, 1),
            "debt_to_equity":   _r(info.get("debtToEquity")),
            "current_ratio":    _r(info.get("currentRatio")),
            "quick_ratio":      _r(info.get("quickRatio")),
            "beta":             _r(info.get("beta")),
            "52w_high":         _r(info.get("fiftyTwoWeekHigh")),
            "52w_low":          _r(info.get("fiftyTwoWeekLow")),
            "dividend_yield":   calculated_yield,
            "payout_ratio":     _r((info.get("payoutRatio") or 0) * 100, 1),
            "eps_ttm":          _r(info.get("trailingEps")),
            "book_value":       _r(info.get("bookValue")),
            "revenue_ttm":      _crore(info.get("totalRevenue")),
            "net_income_ttm":   _crore(info.get("netIncomeToCommon")),
            "free_cash_flow":   _crore(info.get("freeCashflow")),
            "enterprise_value": _crore(info.get("enterpriseValue")),
        }

        # ── Quality check — flat fields for React ────────────────────────
        result["quality"] = _quality_check(result["ratios"])

        # ── Quarterly Results ─────────────────────────────────────────────
        try:
            qf = ticker.quarterly_income_stmt
            if qf is not None and not qf.empty:
                qf = qf.T.sort_index(ascending=True).tail(5)

                def _qval(df, *keys):
                    for k in keys:
                        if k in df.columns:
                            return df[k]
                    return pd.Series([None] * len(df), index=df.index)

                rev   = _qval(qf, "Total Revenue", "Revenue")
                prof  = _qval(qf, "Net Income", "Net Income Common Stockholders")
                ebit  = _qval(qf, "EBITDA", "Operating Income")

                quarters = []
                prev_rev = prev_prof = None
                for i, (idx, row) in enumerate(qf.iterrows()):
                    try:
                        period = str(idx)[:7] if hasattr(idx, "strftime") else str(idx)[:10]
                        rev_v  = _r(rev.iloc[i])
                        pro_v  = _r(prof.iloc[i])
                        ebit_v = _r(ebit.iloc[i]) if hasattr(ebit, "iloc") else None

                        rev_chg  = _pct_change(rev_v, prev_rev)
                        prof_chg = _pct_change(pro_v, prev_prof)
                        margin   = _r(pro_v / rev_v * 100, 1) if (rev_v and pro_v and rev_v != 0) else None

                        quarters.append({
                            "period":         period,
                            "revenue":        rev_v,
                            "revenue_str":    _crore(rev_v),
                            "profit":         pro_v,
                            "profit_str":     _crore(pro_v),
                            "ebitda":         ebit_v,
                            "ebitda_str":     _crore(ebit_v),
                            "margin_pct":     margin,
                            "rev_chg":        rev_chg,
                            "prof_chg":       prof_chg,
                            "profit_color":   _color(pro_v),
                            "rev_chg_color":  _color(rev_chg),
                            "prof_chg_color": _color(prof_chg),
                            "rev_arrow":      _arrow(rev_chg),
                            "prof_arrow":     _arrow(prof_chg),
                            "is_profit":      (pro_v or 0) > 0,
                        })
                        prev_rev, prev_prof = rev_v, pro_v
                    except Exception:
                        continue

                result["annual"] = annual[::-1]
        except Exception:
            result["quarterly"] = []

        # ── Annual Results ────────────────────────────────────────────────
        try:
            af = ticker.financials
            if af is not None and not af.empty:
                af = af.T.sort_index(ascending=True).tail(4)

                def _aval(df, *keys):
                    for k in keys:
                        if k in df.columns:
                            return df[k]
                    return pd.Series([None] * len(df), index=df.index)

                arev  = _aval(af, "Total Revenue", "Revenue")
                aprof = _aval(af, "Net Income", "Net Income Common Stockholders")
                aebit = _aval(af, "EBITDA", "Operating Income")

                annual = []
                prev_arev = prev_aprof = None
                for i, (idx, row) in enumerate(af.iterrows()):
                    try:
                        year   = str(idx)[:4] if hasattr(idx, "strftime") else str(idx)[:4]
                        rev_v  = _r(arev.iloc[i])
                        pro_v  = _r(aprof.iloc[i])
                        ebt_v  = _r(aebit.iloc[i]) if hasattr(aebit, "iloc") else None
                        margin = _r(pro_v / rev_v * 100, 1) if (rev_v and pro_v and rev_v != 0) else None
                        rev_g  = _pct_change(rev_v, prev_arev)
                        pro_g  = _pct_change(pro_v, prev_aprof)

                        annual.append({
                            "year":         year,
                            "revenue":      rev_v,
                            "revenue_str":  _crore(rev_v),
                            "profit":       pro_v,
                            "profit_str":   _crore(pro_v),
                            "ebitda":       ebt_v,
                            "ebitda_str":   _crore(ebt_v),
                            "margin_pct":   margin,
                            "rev_growth":   rev_g,
                            "prof_growth":  pro_g,
                            "profit_color": _color(pro_v),
                            "rev_g_color":  _color(rev_g),
                            "pro_g_color":  _color(pro_g),
                            "rev_arrow":    _arrow(rev_g),
                            "prof_arrow":   _arrow(pro_g),
                            "is_profit":    (pro_v or 0) > 0,
                        })
                        prev_arev, prev_aprof = rev_v, pro_v
                    except Exception:
                        continue

                result["annual"] = annual[::-1]
        except Exception:
            result["annual"] = []

    except Exception as e:
        result["error"] = str(e)

    return result


def get_summary(symbol: str) -> dict:
    raw = get_fundamentals(symbol)
    return {
        "company_info": raw["info"],
        "key_ratios":   raw["ratios"],
        "quality":      raw["quality"],
        "quarterly":    raw["quarterly"],
        "annual":       raw["annual"],
        "dividends":    raw["dividends"],
        "error":        raw["error"],
    }


def render_quarterly_table(symbol):
    return get_summary(symbol)["quarterly"]


def render_annual_table(symbol):
    return get_summary(symbol)["annual"]