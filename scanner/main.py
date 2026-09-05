import json

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional

from scanner.utils.sanitize_json import sanitize_for_json
from scanner.utils.encoder import NumpyEncoder
from scanner.data.fundamentals import get_summary
from scanner.pages.scanner_page import (
    analyze, fetch_price, run_full_scan, run_ai_analysis, get_risks,
    sectors_analysis, search_symbols_detail, get_market_scan_cache,
    get_candlesticks_stocks, get_reversal_pattern_Stocks, get_cont_pattern_Stocks,
    get_all_cache_stocks, fin_recommendation,
)
from scanner.pages.stock_info_page import get_all_indices_data
from scanner.pages.backtest_logic import run_backtest

app = FastAPI(title="Scanner API", json_encoder=NumpyEncoder)


class ScanRequest(BaseModel):
    symbols: Optional[List[str]] = None
    timeframe: str = "1d"


@app.get("/analyze/{symbol}")
async def scan_symbol(symbol: str):
    result = await analyze(symbol)
    return JSONResponse(content=sanitize_for_json(result))


@app.post("/fetch/price")
async def fetchCurrPrice(symbols: list[str]):
    result = await fetch_price(symbols)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/fundamentals/{symbol}")
def get_fundamentals_route(symbol: str):
    result = get_summary(symbol)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/cache/allstocks")
async def get_cache_stocks():
    result = await get_all_cache_stocks()
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/cache/fullscan")
async def full_scan_cache(filters: str):
    try:
        parsed_filters = json.loads(filters)
        result = await get_market_scan_cache(parsed_filters)
        return JSONResponse(content=sanitize_for_json(result))
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/candlesticks/stocks")
async def all_candlesticks_stocks():
    result = await get_candlesticks_stocks()
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/reversal/stocks")
async def all_reversal_stocks():
    result = await get_reversal_pattern_Stocks()
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/continuation/stocks")
async def all_continuation_stocks():
    result = await get_cont_pattern_Stocks()
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/runfullscan")
async def run_full_scan_admin():
    result = await run_full_scan(use_cache=False)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/ai/{symbol}")
async def get_ai_full_analysis(symbol: str):
    result = await run_ai_analysis(symbol)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/fin/recommends")
async def get_recom():
    result = await fin_recommendation()
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/backtest")
async def run_backtest_endpoint(filters: str):
    try:
        parsed_dict = json.loads(filters)
        result = await run_backtest(parsed_dict)
        return JSONResponse(content=sanitize_for_json(result))
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# --- /chart/{symbol}: intentionally left out ---
# The old handler called build_chart_demo(symbol), which ignored `symbol`
# entirely and returned 5 hardcoded fake candlesticks from Jan 2024 — dead
# demo code, not a real chart. It was removed in the scanner_page.py
# refactor rather than carried forward as-is. Two real options:
#   1. Wire this route to the real `build_chart(symbol, timeframe)` in
#      scanner_page.py (needs `r = await analyze(symbol)` fixed inside it
#      first — see the NotImplementedError note left there).
#   2. Delete the route if the frontend isn't actually using it.
# Tell me which and I'll wire it up; didn't want to guess and ship either
# fake data or a broken import silently.


@app.get("/risks/{symbol}")
async def get_risk_route(symbol: str):
    result = await get_risks(symbol)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/search")
def search(q: str = ""):
    result = search_symbols_detail(q)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/indices/data")
async def getIndicesData():
    result = await get_all_indices_data()
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/sector/analysis")
async def getSectorRotation():
    result = await sectors_analysis()
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/health")
def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "details": str(exc)},
    )