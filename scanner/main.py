# main.py

from fastapi   import FastAPI  , Request , Query
import traceback
from fastapi.responses import JSONResponse
# from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Optional
from scanner.utils.sanitize_json import sanitize_for_json

from scanner.pages.scanner_page import (analyze  ,fetch_price ,  build_chart_demo , run_full_scan ,
              run_ai_analysis , get_risks , sectors_analysis, search_symbols_detail , get_market_scan_cache
              ,get_candlesticks_stocks , get_reversal_pattern_Stocks , get_cont_pattern_Stocks , get_all_cache_stocks ,
              fin_recommendation)
from scanner.pages.stock_info_page import get_all_indices_data
from scanner.utils.encoder import NumpyEncoder
from scanner.data.fundamentals import get_summary

from scanner.pages.backtest_logic import run_backtest 
import json
app = FastAPI(title="Scanner API", json_encoder=NumpyEncoder)


# Request model (for POST)
class ScanRequest(BaseModel):
    symbols: Optional[List[str]] = None
    timeframe: str = "1d"


    
@app.get("/analyze/{symbol}")
def scan_symbol(symbol: str):
    result = analyze(symbol)
    return JSONResponse(content=sanitize_for_json(result))


@app.post("/fetch/price")
def fetchCurrPrice(symbols : list[str]):
    result = fetch_price(symbols)
    return JSONResponse(content=sanitize_for_json(result))
    
@app.get("/fundamentals/{symbol}")
def get_fundamentals(symbol:str):
    result = get_summary(symbol)
    return JSONResponse(content=sanitize_for_json(result))
    
@app.get("/cache/allstocks")
def get_cache_stocks():
    return JSONResponse(get_all_cache_stocks())
   
   
@app.get("/cache/fullscan")
def full_scan_cache(filters : str):
    print("Received filters for cache scan:", filters)  # Debug log
    try : 
        parsed_filters = json.loads(filters)
        result = get_market_scan_cache(parsed_filters)
        return JSONResponse(content = sanitize_for_json(result))
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
   
@app.get("/candlesticks/stocks")
def all_candlesticks_stocks():
    return JSONResponse(get_candlesticks_stocks())

@app.get("/reversal/stocks")
def all_reversal_stocks():
    return JSONResponse(get_reversal_pattern_Stocks())
    
@app.get("/continuation/stocks")
def all_reversal_stocks():
    return JSONResponse(get_cont_pattern_Stocks())
          
   
   
@app.get("/runfullscan")
def run_full_scan_admin():
    result = run_full_scan(use_cache=False)
    return JSONResponse(content = sanitize_for_json(result))
        
@app.get("/ai/{symbol}")
def get_ai_full_analysis(symbol:str):
    result = run_ai_analysis(symbol)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/fin/recommends")
def get_recom():
    return JSONResponse(fin_recommendation())
    
@app.get("/backtest")
def run_backtest_endpoint(filters: str): 
    try:
        parsed_dict = json.loads(filters)
        
        result = run_backtest(parsed_dict)
        return JSONResponse(content=sanitize_for_json(result))
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/chart/{symbol}")
async def get_chart(symbol:str):
    fig = build_chart_demo(symbol)
    return fig

@app.get("/risks/{symbol}")
def get_risk_route(symbol: str):
    result = get_risks(symbol)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/search")
def search(q: str = ""):
    result = search_symbols_detail(q)
    return JSONResponse(content=sanitize_for_json(result))


@app.get("/indices/data")
def getIndicesData():
    result = get_all_indices_data()
    return JSONResponse(content = sanitize_for_json(result))

@app.get("/sector/analysis")
def getSectorRotation():
    result = sectors_analysis()
    return JSONResponse(content = sanitize_for_json(result))
    



# health check
@app.get("/health")
def health():
    return {"status": "ok"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "details": str(exc)},
    )