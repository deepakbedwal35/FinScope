# scanner/tests/integration/test_cache_integration.py
import pytest
import pandas as pd
from datetime import datetime
from zoneinfo import ZoneInfo
import fakeredis.aioredis
from scanner.utils.cache import Cache, TTL, is_market_open


@pytest.fixture
def fake_cache():
    """Provides an isolated Cache instance connected to an in-memory fakeredis client."""
    c = Cache()
    c._client = fakeredis.aioredis.FakeRedis(decode_responses=True)
    return c


@pytest.mark.asyncio
async def test_set_json_and_get_json_round_trip(fake_cache):
    # Checks that complex nested dictionaries serialize to Redis and deserialize back without corruption,
    # catching JSON encoding/decoding errors in the scanner cache layer.

    # Arrange
    stock_payload = {
        "symbol": "TCS",
        "price": 3850.25,
        "indicators": {"rsi": 64.2, "macd": "BULLISH"},
        "grade": "A",
    }

    # Act: Store into Redis with 60s TTL and retrieve it
    await fake_cache.set_json("stock:TCS", stock_payload, ttl=60)
    cached_data = await fake_cache.get_json("stock:TCS")

    # Assert
    assert cached_data is not None
    assert cached_data["symbol"] == "TCS"
    assert cached_data["price"] == 3850.25
    assert cached_data["indicators"]["rsi"] == 64.2
    assert cached_data["grade"] == "A"


@pytest.mark.asyncio
async def test_get_or_set_prevents_duplicate_expensive_computation(fake_cache):
    # Checks that get_or_set returns cached data on subsequent calls without re-invoking the fetch function,
    # catching cache-bypassing bugs that would trigger thundering-herd API calls.

    # Arrange: Fetch function with an invocation counter
    fetch_call_count = 0

    async def expensive_scan_computation():
        nonlocal fetch_call_count
        fetch_call_count += 1
        return {"status": "completed", "result_count": 50}

    # Act: First call (cache miss) executes fetch; second call (cache hit) uses cache
    first_call_data = await fake_cache.get_or_set(
        "scan:market", ttl=300, fetch=expensive_scan_computation
    )
    second_call_data = await fake_cache.get_or_set(
        "scan:market", ttl=300, fetch=expensive_scan_computation
    )

    # Assert: Function called only once; both calls return identical data
    assert fetch_call_count == 1
    assert first_call_data == second_call_data
    assert first_call_data["result_count"] == 50


@pytest.mark.asyncio
async def test_dataframe_round_trip_through_redis_cache(fake_cache):
    # Checks that a pandas DataFrame can be serialized into Redis records and restored losslessly,
    # catching data type conversions or truncation bugs when caching OHLCV history.

    # Arrange: 3-row OHLCV DataFrame
    original_df = pd.DataFrame({
        "Close": [2450.0, 2480.5, 2510.0],
        "Volume": [100000, 150000, 120000],
    })
    records = original_df.to_dict(orient="records")

    # Act: Cache records in Redis and reconstruct into a new DataFrame
    await fake_cache.set_json("df:RELIANCE", records, ttl=120)
    cached_records = await fake_cache.get_json("df:RELIANCE")
    restored_df = pd.DataFrame(cached_records)

    # Assert: Restored DataFrame matches original values and shape
    assert len(restored_df) == 3
    assert list(restored_df["Close"]) == [2450.0, 2480.5, 2510.0]
    assert list(restored_df["Volume"]) == [100000, 150000, 120000]


@pytest.mark.asyncio
async def test_hash_storage_for_multi_symbol_price_ticks(fake_cache):
    # Checks that multiple stock prices are stored as hash fields and retrieved in a single batch,
    # catching bugs where per-symbol prices overwrite the entire key instead of their respective field.

    # Arrange: Batch of live prices
    price_ticks = {
        "INFY": {"price": 1820.0, "change": 1.2},
        "WIPRO": {"price": 540.5, "change": -0.4},
    }

    # Act: Store into the "prices" hash and read fields back
    await fake_cache.set_fields("prices", price_ticks, ttl=60)
    result = await fake_cache.get_fields("prices", ["INFY", "WIPRO", "MISSING_SYM"])

    # Assert
    assert result["INFY"]["price"] == 1820.0
    assert result["WIPRO"]["price"] == 540.5
    assert result["MISSING_SYM"] is None


def test_market_hours_ttl_resolution():
    # Checks that is_market_open accurately detects live NSE trading hours (Mon-Fri 09:15-15:30 IST),
    # catching timezone or day-of-week bugs that would serve stale prices during market hours.

    ist = ZoneInfo("Asia/Kolkata")

    # Tuesday at 11:00 AM IST (Market is OPEN)
    tuesday_market_time = datetime(2026, 3, 10, 11, 0, 0, tzinfo=ist)
    # Sunday at 11:00 AM IST (Market is CLOSED)
    sunday_weekend_time = datetime(2026, 3, 15, 11, 0, 0, tzinfo=ist)

    # Assert
    assert is_market_open(tuesday_market_time) is True
    assert is_market_open(sunday_weekend_time) is False

