import yfinance as yf

from scanner.utils.sanitize_json import sanitize_for_json
from scanner.utils.cache import cache, TTL

_YFINANCE_TICKER_MAP = {
    "NIFTY 50": "^NSEI",
    "NIFTY BANK": "^NSEBANK",
    "NIFTY NEXT 50": "^NSMIDCP",
    "INDIA VIX": "^INDIAVIX",
}


async def get_all_indices_data() -> dict:
    cached = await cache.get_json("indices_data")
    if cached:
        return cached

    result_dict = {}
    for human_name, ticker_symbol in _YFINANCE_TICKER_MAP.items():
        try:
            ticker_obj = yf.Ticker(ticker_symbol)
            live_history = ticker_obj.history(period="1d")
            ticker_info = ticker_obj.info

            if live_history.empty:
                continue

            current_price = live_history["Close"].iloc[-1]
            open_price = live_history["Open"].iloc[-1]
            high_price = live_history["High"].iloc[-1]
            low_price = live_history["Low"].iloc[-1]
            volume = (
                int(live_history["Volume"].iloc[-1])
                if "Volume" in live_history.columns and not live_history["Volume"].empty
                else 0
            )

            computed_change = ((current_price - open_price) / open_price) * 100

            w52h = ticker_info.get("fiftyTwoWeekHigh")
            w52l = ticker_info.get("fiftyTwoWeekLow")
            dist_52w = round(((w52h - current_price) * 100) / w52h, 2) if w52h else None

            avg_volume = ticker_info.get("averageVolume") or ticker_info.get("averageVolume10Days")
            vol_ratio = round(volume / avg_volume, 2) if (avg_volume and volume > 0) else 0.00

            result_dict[human_name] = {
                "Price": round(current_price, 2),
                "Close": round(current_price, 2),
                "change_percent": round(computed_change, 2),
                "Open": round(open_price, 2),
                "High": round(high_price, 2),
                "Low": round(low_price, 2),
                "w52l": round(w52l, 2) if w52l else None,
                "w52h": round(w52h, 2) if w52h else None,
                "dist_52w": dist_52w,
                "Volume": volume,
                "Vol_ratio": vol_ratio,
                "source": "yfinance",
            }
        except Exception as yf_err:
            print(f"Failed parsing fallback data for ticker {ticker_symbol}: {yf_err}")

    result_dict = sanitize_for_json(result_dict)
    await cache.set_json("indices_data", result_dict, TTL.resolve(TTL.INDICES))
    return result_dict