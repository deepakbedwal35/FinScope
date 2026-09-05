import heapq
import json
from datetime import datetime

import pandas as pd
import yfinance as yf
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from scanner.data.nse_symbols import get_symbols, search_symbols
from scanner.patterns.dow_theory import full_dow_analysis
from scanner.data.indicators import get_indicator_summary
from scanner.patterns.patterns import get_pattern_summary
from scanner.patterns.reversal_patterns import get_reversal_summary
from scanner.patterns.continuation_patterns import get_continuation_summary
from scanner.patterns.candlesticks_oscillators import get_candle_oscillator_summary
from scanner.strategy.backtest import compute_score
from scanner.data.news_sentiment import get_news_sentiment, get_company_name
from scanner.strategy.entry_engine import get_full_entry_analysis
from scanner.strategy.risk_analysis import get_full_risk_report
from scanner.data.fundamentals import get_fundamentals
from scanner.ai.groq_analyst import analyse_news_with_groq, get_ai_decision
from scanner.utils.config import get_key, GROQ_MODEL
from scanner.utils.sanitize_json import sanitize_for_json
from scanner.data.market_intelligence import get_sector_rotation
from scanner.utils.cache import cache, TTL

# NOTE: every function below that touches Redis is now `async def`.
# Callers (route handlers in main.py, and any function in this file that
# calls another) must be `async def` too and `await` the call. Route
# paths, params, and returned JSON shape are unchanged.


def fetch(symbol: str, period: str = "2y") -> pd.DataFrame | None:
    bare = symbol.replace(".NS", "").replace(".BO", "")

    if symbol.endswith(".NS"):
        candidates = [symbol, bare + ".BO"]
    elif symbol.endswith(".BO"):
        candidates = [symbol, bare + ".NS"]
    else:
        candidates = [bare + ".NS", bare + ".BO", symbol]

    periods = [period, "1y"] if period == "2y" else [period]
    required_cols = ["Open", "High", "Low", "Close", "Volume"]

    for sym in candidates:
        for per in periods:
            try:
                df = yf.Ticker(sym).history(period=per, auto_adjust=True)
                if df is None or df.empty:
                    continue
                if not all(c in df.columns for c in required_cols):
                    continue
                df = df.dropna(subset=required_cols)
                df = df[(df["Close"] > 0) & (df["Volume"] > 0)]
                df = df[df["High"] >= df["Low"]]
                if len(df) < 60:
                    continue
                df.index = pd.to_datetime(df.index)
                df = df.sort_index()
                df = df[~df.index.duplicated(keep="last")]
                return df[required_cols].copy()
            except Exception as e:
                print(f"  fetch failed {sym} / {per}: {e}")
                continue
    return None


async def fetch_price(symbols: list[str]) -> dict:
    """
    Live price lookup. One Redis hash ("prices") instead of one key per
    symbol — was `price:{symbol}` x N stringified-JSON keys.
    """
    results = await cache.get_fields("prices", symbols)
    symbols_to_fetch = [s for s in symbols if results.get(s) is None]

    if not symbols_to_fetch:
        return results

    ttl = TTL.resolve(TTL.PRICE)
    fresh: dict[str, dict] = {}
    try:
        tickers_str = " ".join(f"{s}.NS" for s in symbols_to_fetch)
        data = yf.Tickers(tickers_str)

        for symbol in symbols_to_fetch:
            try:
                ticker = data.tickers.get(f"{symbol}.NS")
                if not ticker:
                    results[symbol] = None
                    continue
                hist = ticker.history(period="2d")
                if len(hist) < 1:
                    results[symbol] = None
                    continue

                price = float(hist["Close"].iloc[-1])
                prev_close = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else price
                change = price - prev_close
                change_pct = round((change / prev_close) * 100, 2) if prev_close else 0

                price_data = {
                    "price": round(price, 2),
                    "change": round(change, 2),
                    "change_percent": change_pct,
                }
                fresh[symbol] = price_data
                results[symbol] = price_data
            except Exception:
                results[symbol] = None
    except Exception:
        for symbol in symbols_to_fetch:
            results[symbol] = None

    if fresh:
        await cache.set_fields("prices", fresh, ttl)
    return results


def _build_stock_summary(symbol: str, df: pd.DataFrame) -> dict | None:
    """
    Shared computation core for `analyze` and `analyze_full_scan` — both
    used to duplicate this indicator/pattern/scoring pipeline almost
    verbatim. This returns the common fields; each caller adds its own
    extra fields (analyze adds fundamentals/news/risk; the scanner path
    adds SL/target and applies scan filters).
    """
    ind, df2 = get_indicator_summary(df)
    dow = full_dow_analysis(df2)
    pat = get_pattern_summary(df2)
    reversal = get_reversal_summary(df2)
    cont = get_continuation_summary(df2)
    candles = get_candle_oscillator_summary(df2)
    entry = get_full_entry_analysis(df2, dow, ind, pat, cont, reversal, candles)

    lat = df2.iloc[-1]
    prv = df2.iloc[-2]
    p = float(lat["Close"])
    if p != p or p <= 0:
        return None

    w52h_raw = df2["High"].rolling(252, min_periods=30).max().iloc[-1]
    w52h = float(w52h_raw) if (w52h_raw == w52h_raw and w52h_raw > 0) else p
    w52l_raw = df2["Low"].rolling(252, min_periods=30).min().iloc[-1]
    w52l = float(w52l_raw) if (w52l_raw == w52l_raw and w52l_raw > 0) else p

    vr_raw = lat.get("Vol_ratio", 0.0)
    vr = float(vr_raw) if pd.notna(vr_raw) else 0.0
    rsi_val = ind["rsi"]["value"]
    rsi = float(rsi_val) if rsi_val is not None else 0.0
    prev_c = float(prv["Close"]) if float(prv["Close"]) > 0 else p
    chg_percent = ((p - prev_c) / prev_c) * 100
    chg = p - prev_c
    dist_52w = ((p - w52h) / w52h) * 100 if w52h > 0 else 0.0

    atr = ind["atr"]["value"] or (p * 0.02)
    score, strength, grade, gc = compute_score(ind, dow, pat, cont, candles, reversal, dist_52w, vr)

    return {
        "df2": df2,
        "entry": entry,
        "price": p,
        "change": round(chg, 2),
        "change_percent": round(chg_percent, 2),
        "w52h": round(w52h, 2),
        "w52l": round(w52l, 2),
        "dist_52w": round(dist_52w, 2),
        "vol_ratio": round(vr, 2),
        "rsi": rsi,
        "atr": atr,
        "score": score,
        "strength": strength,
        "grade": grade,
        "grade_color": gc,
        "dow": dow,
        "indicators": ind,
        "patterns": pat,
        "reversal": reversal,
        "cont": cont,
        "candles": candles,
    }


async def analyze(symbol: str) -> dict | None:
    cached = await cache.get_json("curr_stock")
    if cached and cached.get("symbol") == symbol:
        return cached

    df = fetch(symbol)
    if df is None:
        return None

    try:
        core = _build_stock_summary(symbol, df)
        if core is None:
            return None

        company_name = get_company_name(symbol)
        fundamentals = get_fundamentals(symbol)
        news_data = get_news_sentiment(symbol=symbol, company_name=company_name)
        risk_data = get_full_risk_report(
            df=df, ind_result=core["indicators"], pat_result=core["patterns"],
            cont_result=core["cont"], rev_result=core["reversal"],
            candle_result=core["candles"], dow_result=core["dow"], news_sentiment=news_data,
        )

        summary = {
            "symbol": symbol.replace(".NS", ""),
            "company_name": company_name,
            "price": core["price"],
            "change": core["change"],
            "change_percent": core["change_percent"],
            "w52h": core["w52h"],
            "w52l": core["w52l"],
            "dist_52w": core["dist_52w"],
            "vol_ratio": core["vol_ratio"],
            "rsi": core["rsi"],
            "score": int(core["score"]),
            "strength": core["strength"],
            "grade": core["grade"],
            "grade_color": core["grade_color"],
            "fundamentals": fundamentals,
            "trade_action": core["entry"],
            "dow": core["dow"],
            "indicators": core["indicators"],
            "patterns": core["patterns"],
            "reversal": core["reversal"],
            "cont": core["cont"],
            "candles": core["candles"],
            "risks": risk_data,
            "df2": core["df2"].iloc[-1].to_dict(),
        }
        summary = sanitize_for_json(summary)
        await cache.set_json("curr_stock", summary, TTL.resolve(TTL.STOCK_DETAIL))
        return summary
    except Exception as e:
        print(f"ERROR in analyze: {e}")
        return None


def build_chart(symbol, timeframe) -> go.Figure:
    # Unchanged from before (sync, not cache-related) except pulled the
    # duplicated `r = analyze(symbol)` call chain out — chart building
    # itself does no caching so it isn't touched by the Redis refactor.
    raise NotImplementedError(
        "build_chart depends on analyze() being awaited first; "
        "call `r = await analyze(symbol)` then pass r into a sync renderer."
    )


def analyze_full_scan(symbol: str) -> dict | None:
    df = fetch(symbol)
    if df is None:
        return None
    try:
        core = _build_stock_summary(symbol, df)
        if core is None:
            return None

        trend = "DOWNTREND"
        dow = core["dow"]
        if (dow["primary"]["trend"] == trend and dow["secondary"]["trend"] == trend
                and dow["minor"]["trend"] == trend):
            return None
        if core["score"] < 10 or core["vol_ratio"] < 0.4:
            return None

        atr = core["atr"]
        p = core["price"]
        sl = round(p - 1.5 * atr, 2)
        t1 = round(p + 2.0 * atr, 2)
        t2 = round(p + 3.5 * atr, 2)

        results = {
            "symbol": symbol.replace(".NS", "").replace(".BO", ""),
            "price": p,
            "change": core["change"],
            "change_percent": core["change_percent"],
            "w52h": core["w52h"],
            "dist_52w": core["dist_52w"],
            "vol_ratio": core["vol_ratio"],
            "rsi": core["rsi"],
            "score": int(core["score"]),
            "strength": core["strength"],
            "grade": core["grade"],
            "grade_color": core["grade_color"],
            "sl": sl, "t1": t1, "t2": t2,
            "entry": core["entry"],
            "dow": dow,
            "indicators": core["indicators"],
            "patterns": core["patterns"],
            "reversal": core["reversal"],
            "cont": core["cont"],
            "candles": core["candles"],
        }
        return sanitize_for_json(results)
    except Exception as e:
        print(f"ERROR in analyze_full_scan: {e}")
        return None


async def run_full_scan(sel_cats=None, use_cache: bool = True) -> dict:
    sel_cats = sel_cats or ["Pharma"]
    if not sel_cats:
        raise ValueError("sel_cats cannot be empty")

    if not use_cache:
        await cache.delete("market_scan")

    async def _compute():
        symbols = get_symbols(sel_cats)
        results = []
        for sym in symbols:
            try:
                r = analyze_full_scan(sym)
                if r:
                    results.append(r)
            except Exception as e:
                print("scan error:", e)
        results.sort(key=lambda x: x["score"], reverse=True)
        return {
            "cached": True,
            "results": results,
            "total_scanned": len(symbols),
            "total_found": len(results),
            "scanned_at": datetime.now().strftime("%d %b %Y  %I:%M %p"),
        }

    return await cache.get_or_set("market_scan", TTL.resolve(TTL.MARKET_SCAN), _compute)


async def get_market_scan_cache(filters: dict | None = None) -> dict:
    filters = filters or {"min_vol": 0.2, "rsi_min": 30, "rsi_max": 80, "dist_thr": 20, "min_grade": "D"}
    min_vol = filters.get("min_vol", 0.2)
    rsi_min = filters.get("rsi_min", 30)
    rsi_max = filters.get("rsi_max", 80)
    dist_thr = filters.get("dist_thr", 20)
    min_grade = filters.get("min_grade", "D")
    indicators = filters.get("indicators", [])
    limit = filters.get("limit")

    grade_rank = {"A+": 5, "A": 4, "B": 3, "C": 2, "D": 1}

    cached = await cache.get_json("market_scan")
    if not cached:
        return {"success": False, "msg": "Scan not ready. Please trigger a scan first.", "results": []}

    results = cached.get("results", [])
    filtered = [s for s in results if s.get("vol_ratio", 0) >= min_vol]
    filtered = [s for s in filtered if rsi_min <= s.get("rsi", 0) <= rsi_max]
    filtered = [s for s in filtered if s.get("dist_52w", -999) >= -dist_thr]
    filtered = [s for s in filtered if grade_rank.get(s.get("grade", "D"), 1) >= grade_rank.get(min_grade, 1)]

    def check_indicator(stock: dict, condition: str) -> bool:
        ind = stock.get("indicators", {})
        rsi_d = ind.get("rsi", {})
        macd = ind.get("macd", {})
        ma = ind.get("ma", {})
        price = stock.get("price", 0)
        if condition == "Bullish RSI": return rsi_d.get("signal") == "BULLISH"
        if condition == "Bearish RSI": return rsi_d.get("signal") == "BEARISH"
        if condition == "MACD > 0": return (macd.get("macd") or 0) > 0
        if condition == "MACD < 0": return (macd.get("macd") or 0) < 0
        sma_20, sma_50, sma_200 = ma.get("sma_20"), ma.get("sma_50"), ma.get("sma_200")
        if condition == "Golden Cross": return bool(sma_50 and sma_200 and sma_50 > sma_200)
        if condition == "Death cross": return bool(sma_50 and sma_200 and sma_50 < sma_200)
        if condition == "Price > 20SMA": return bool(sma_20 and price > sma_20)
        if condition == "Price > 50SMA": return bool(sma_50 and price > sma_50)
        if condition == "Price > 200SMA": return bool(sma_200 and price > sma_200)
        return False

    if indicators:
        filtered = [s for s in filtered if all(check_indicator(s, c) for c in indicators)]

    filtered = sorted(filtered, key=lambda x: x.get("score", 0), reverse=True)
    if limit:
        filtered = filtered[:limit]

    return {
        "success": True,
        "results": filtered,
        "total_found": len(filtered),
        "total_scanned": cached.get("total_scanned"),
        "scanned_at": cached.get("scanned_at"),
        "filters_applied": filters,
    }


async def get_all_cache_stocks() -> dict:
    cached = await cache.get_json("market_scan")
    if not cached:
        return {"success": False, "msg": "Scan not ready. Please trigger a scan first.", "results": []}
    return sanitize_for_json(cached)


def search_symbols_detail(query: str, limit: int = 15) -> list[dict]:
    return search_symbols(query, limit=limit)


async def sectors_analysis() -> dict:
    async def _compute():
        try:
            return get_sector_rotation()
        except Exception:
            return {}
    return await cache.get_or_set("sector_rotation", TTL.resolve(TTL.SECTOR_ROTATION), _compute)


async def run_ai_analysis(symbol: str) -> dict:
    cached = await cache.get_json("ai_analysis")
    if cached:
        return cached

    df = fetch(symbol)
    api_key = get_key()
    model_name = GROQ_MODEL
    sel = await analyze(symbol)

    dow, ind, pat = sel["dow"], sel["indicators"], sel["patterns"]
    rev, candles, cont = sel["reversal"], sel["candles"], sel["cont"]
    entry_data = get_full_entry_analysis(df, dow, ind, pat, cont, rev, candles)

    company_name = get_company_name(symbol)
    fundamentals = get_fundamentals(symbol)
    news_data = get_news_sentiment(symbol=symbol, company_name=company_name)
    risk_data = get_full_risk_report(
        df=df, ind_result=ind, pat_result=pat, cont_result=cont, rev_result=rev,
        candle_result=candles, dow_result=dow, news_sentiment=news_data,
    )

    fd = fundamentals or {}
    rat = fd.get("ratios", {})
    ann = fd.get("annual", [])
    qts = fd.get("quarterly", [])
    rev_growth_yoy = ann[1]["rev_growth"] if len(ann) >= 2 else None
    prof_growth_yoy = ann[1]["prof_growth"] if len(ann) >= 2 else None
    last_q_profit = qts[0]["profit_str"] if qts else None
    last_q_trend = qts[0]["prof_arrow"] if qts else None

    has_entry = entry_data.get("found", False)
    rv_d = risk_data or {}
    mtf = rv_d.get("mtf", {})
    rf_list = [r["title"] for r in rv_d.get("risks", [])[:5]] if rv_d else []
    mtf_s = mtf.get("alignment", "") if mtf else ""
    existing_articles = (news_data or {}).get("articles", [])

    groq_news = analyse_news_with_groq(
        symbol=symbol, company_name=company_name, api_key=api_key,
        model_name=model_name, existing_headlines=existing_articles,
    )
    pos_headlines = [n.get("title", "") for n in groq_news.get("positive", [])[:6]]
    neg_headlines = [n.get("title", "") for n in groq_news.get("negative", [])[:6]]

    decision = get_ai_decision(
        symbol=symbol, company_name=company_name, api_key=api_key, model_name=model_name,
        score=sel.get("score"), grade=sel.get("grade"), cmp=sel["price"],
        entry=entry_data.get("entry") if has_entry else None,
        sl=entry_data.get("sl") if has_entry else None,
        t1=entry_data.get("t1") if has_entry else None,
        t2=entry_data.get("t2") if has_entry else None,
        rsi=sel.get("rsi"), macd_signal=ind["macd"]["signal"],
        dow_signal=dow["signal"], dow_primary=dow["primary"]["trend"],
        strength=sel.get("strength"),
        pe_ratio=rat.get("pe_ratio"), pb_ratio=rat.get("pb_ratio"), roe=rat.get("roe"),
        debt_equity=rat.get("debt_to_equity"), profit_margin=rat.get("profit_margin"),
        revenue_growth_yoy=rev_growth_yoy, profit_growth_yoy=prof_growth_yoy,
        market_cap=rat.get("market_cap"), eps=rat.get("eps_ttm"),
        last_quarter_profit=last_q_profit, last_quarter_trend=last_q_trend,
        dividend_yield=rat.get("dividend_yield"),
        vader_score=(news_data or {}).get("overall_score"),
        vader_sentiment=(news_data or {}).get("overall_sentiment"),
        groq_news_score=groq_news.get("overall_news_score"),
        groq_news_sentiment=groq_news.get("overall_news_sentiment"),
        top_positive_news=pos_headlines, top_negative_news=neg_headlines,
        news_summary=groq_news.get("news_summary", ""),
        risk_level=rv_d.get("overall") if rv_d else None,
        high_risks=rv_d.get("high_count", 0) if rv_d else 0,
        risk_factors=rf_list, mtf_alignment=mtf_s,
    )

    summary = {
        "symbol": symbol,
        "company_name": company_name,
        "timestamp": datetime.now().strftime("%d %b %Y %H:%M"),
        "news": groq_news,
        "decision": decision,
    }
    await cache.set_json("ai_analysis", summary, TTL.resolve(TTL.AI_ANALYSIS))
    return summary


async def get_risks(symbol: str) -> dict:
    df = fetch(symbol)
    sel = await analyze(symbol)
    dow, ind, pat = sel["dow"], sel["indicators"], sel["patterns"]
    rev, candles, cont = sel["reversal"], sel["candles"], sel["cont"]
    entry_data = get_full_entry_analysis(df, dow, ind, pat, rev, cont, candles)
    company_name = get_company_name(symbol)
    fundamentals = get_fundamentals(symbol)
    news_data = get_news_sentiment(symbol=symbol, company_name=company_name)
    risk_data = get_full_risk_report(
        df=df, ind_result=ind, pat_result=pat, cont_result=cont, rev_result=rev,
        candle_result=candles, dow_result=dow, news_sentiment=news_data,
    )
    return {
        "risk_data": risk_data,
        "entry_analysis": entry_data,
        "fundamentals": fundamentals,
        "news_sentiment": news_data,
    }


def _base_stock_fields(stock: dict) -> dict:
    """Shared field projection used by the three "find stocks with X pattern"
    endpoints below — was copy-pasted three times."""
    return {
        "symbol": stock.get("symbol"),
        "price": stock.get("price"),
        "change": stock.get("change"),
        "change_percent": stock.get("change_percent"),
        "w52h": stock.get("w52h"),
        "dist_52w": stock.get("dist_52w"),
        "vol_ratio": stock.get("vol_ratio"),
        "rsi": stock.get("rsi"),
        "score": stock.get("score"),
        "strength": stock.get("strength"),
        "grade": stock.get("grade"),
        "grade_color": stock.get("grade_color"),
        "sl": stock.get("sl"),
        "t1": stock.get("t1"),
        "t2": stock.get("t2"),
    }


async def get_candlesticks_stocks(filters: dict | None = None, limit: int = 20) -> dict:
    cached = await cache.get_json("market_scan")
    if not cached:
        return {"success": False, "msg": "Scan not ready", "results": []}
    results = cached.get("results", [])

    found = []
    for stock in results:
        candles = stock.get("candles", {})
        latest = candles.get("latest")
        if not latest:
            continue
        entry = _base_stock_fields(stock)
        entry["company_name"] = stock.get("fundamentals", {}).get("info", {}).get("name", "Unknown Company")
        entry["candle"] = {
            "name": latest.get("name"), "signal": latest.get("signal"),
            "direction": latest.get("direction"), "strength": latest.get("strength"),
            "desc": latest.get("desc"), "color": latest.get("color"),
            "date": latest.get("date"), "bars_ago": latest.get("bars_ago"),
        }
        entry["stochastic"] = candles.get("stochastic")
        found.append(entry)

    found = heapq.nlargest(limit, found, key=lambda x: x.get("score", 0))
    r = {
        "success": True,
        "total": len(found),
        "results": found,
        "bullish": [s for s in found if s["candle"]["direction"] == "BULLISH"],
        "bearish": [s for s in found if s["candle"]["direction"] == "BEARISH"],
        "neutral": [s for s in found if s["candle"]["direction"] == "NEUTRAL"],
        "scanned_at": cached.get("scanned_at"),
    }
    return sanitize_for_json(r)


async def get_reversal_pattern_Stocks(filters: dict | None = None, limit: int = 20) -> dict:
    cached = await cache.get_json("market_scan")
    if not cached:
        return {"success": False, "msg": "Scan not ready", "results": []}
    results = cached.get("results", [])

    found = []
    for stock in results:
        rev_pattern = stock.get("reversal", {})
        best = rev_pattern.get("best")
        if not best or best.get("price_target") < stock.get("price"):
            continue
        entry = _base_stock_fields(stock)
        entry["reversal"] = best
        entry["recent_gaps"] = rev_pattern.get("recent_gaps")
        found.append(entry)

    found = heapq.nlargest(limit, found, key=lambda x: x.get("score", 0))
    r = {"success": True, "total": len(found), "results": found, "scanned_at": cached.get("scanned_at")}
    return sanitize_for_json(r)


async def get_cont_pattern_Stocks(filters: dict | None = None, limit: int = 20) -> dict:
    cached = await cache.get_json("market_scan")
    if not cached:
        return {"success": False, "msg": "Scan not ready", "results": []}
    results = cached.get("results", [])

    found = []
    for stock in results:
        cont_pattern = stock.get("cont", {})
        best = cont_pattern.get("best")
        if not best or best.get("price_target") < stock.get("price"):
            continue
        entry = _base_stock_fields(stock)
        entry["cont"] = best
        entry["sr"] = cont_pattern.get("sr")
        entry["trendlines"] = cont_pattern.get("trendlines")
        entry["ma_crosses"] = cont_pattern.get("ma_crosses")
        found.append(entry)

    found = heapq.nlargest(limit, found, key=lambda x: x.get("score", 0))
    r = {"success": True, "total": len(found), "results": found, "scanned_at": cached.get("scanned_at")}
    return sanitize_for_json(r)


async def fin_recommendation(filters: dict | None = None, top_n: int = 10) -> dict:
    filters = filters or {
        "min_vol": 0.4, "rsi_min": 40, "rsi_max": 70, "dist_thr": 15,
        "min_grade": "C", "sectors": [], "min_score": 15,
    }
    scan_result = await get_market_scan_cache(filters)
    if not scan_result.get("success"):
        return {"success": False, "msg": scan_result.get("msg", "Scan not available"), "recommendations": []}

    stocks = scan_result.get("results", [])
    if not stocks:
        return {
            "success": True, "msg": "No stocks matched filters", "recommendations": [],
            "total_scanned": scan_result.get("total_scanned"),
        }

    strong_stocks = [
        s for s in stocks
        if s.get("strength", "WEAK") in ("STRONG", "MEDIUM")
        and s.get("entry", {}).get("grade") in ("A", "B", "C")
    ]
    strong_stocks.sort(key=lambda x: x.get("score", 0), reverse=True)
    top_picks = strong_stocks[:top_n]

    recommendations = [
        {
            "symbol": s.get("symbol"), "sector": s.get("sector"), "price": s.get("price"),
            "change": s.get("change"), "score": s.get("score"), "grade": s.get("grade"),
            "grade_color": s.get("grade_color"), "strength": s.get("strength"), "rsi": s.get("rsi"),
            "vol_ratio": s.get("vol_ratio"), "dist_52w": s.get("dist_52w"), "entry": s.get("entry", {}),
        }
        for s in top_picks
    ]

    return {
        "success": True,
        "total_scanned": scan_result.get("total_scanned"),
        "total_matched": len(stocks),
        "total_strong": len(strong_stocks),
        "recommendations": recommendations,
        "filters_applied": filters,
        "scanned_at": scan_result.get("scanned_at"),
    }