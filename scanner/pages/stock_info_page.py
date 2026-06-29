
import requests
from scanner.utils.sanitize_json import sanitize_for_json
import yfinance as yf
import redis
import json
redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)


def get_all_indices_data():
    data = redis_client.get("indices_data")
    
    if data:
        print("Indices data Using cache")
        return json.loads(data)
    
    

    
    result_dict = {}
    yfinance_ticker_map = {
        "NIFTY 50": "^NSEI",
        "NIFTY BANK": "^NSEBANK",
        "NIFTY NEXT 50": "^NSMIDCP",
        # "NIFTY MIDCAP 50": "^CRSMID",
        "INDIA VIX": "^INDIAVIX"
    }
    
    for human_name, ticker_symbol in yfinance_ticker_map.items():
        try:
            ticker_obj = yf.Ticker(ticker_symbol)
      
            live_history = ticker_obj.history(period="1d")
            ticker_info = ticker_obj.info
            
            if not live_history.empty:
               
                current_price = live_history['Close'].iloc[-1] 
                open_price = live_history['Open'].iloc[-1]
                high_price = live_history['High'].iloc[-1]
                low_price = live_history['Low'].iloc[-1]
                volume = live_history['Volume'].iloc[-1] if 'Volume' in live_history.columns else 0
                
                computed_change = ((current_price - open_price) / open_price) * 100
                
                w52h = ticker_info.get('fiftyTwoWeekHigh', None)
                w52l = ticker_info.get('fiftyTwoWeekLow', None)
                
                if w52h:
                    dist_52w = round(((w52h - current_price) * 100) / w52h, 2)
                else:
                    dist_52w = None
                
                result_dict[human_name] = {
                    "Price": round(current_price, 2),        # Live trading price
                    "Close": round(current_price, 2),        # Explicit close price column
                    "change_percent": round(computed_change, 2),
                    "Open": round(open_price, 2),
                    "High": round(high_price, 2),
                    "Low": round(low_price, 2),
                    "w52l": round(w52l, 2) if w52l else None,
                    "w52h": round(w52h, 2) if w52h else None,
                    "dist_52w": dist_52w,
                    "Volume": volume,
                    "Vol_ratio" : "N/A",
                    "source": "yfinance"
                }
        except Exception as yf_err:
            print(f"Failed parsing fallback data for ticker {ticker_symbol}: {yf_err}")
        
        
    result_dict = sanitize_for_json(result_dict)
        
        
    try:
        print("Add indices data in cache")
        redis_client.setex("indices_data", 3600 , json.dumps(result_dict))
    
    except Exception as e:
        print("Cannot add inidces data in cache  because" , e)
    
    
            
    return result_dict


# print(get_all_indices_data())

