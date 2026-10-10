"""
Unit tests for the demo full-scan fallback logic in Python scanner.
Validates:
- Returns demo fixture with isDemo=True when Redis cache is empty.
- Returns live cache with isDemo=False when Redis cache has real data.
- Demo fallback is purely read-only and never writes to Redis.
- Pattern endpoints return isDemo=True when relying on fallback.
"""

import pytest
from unittest.mock import AsyncMock, patch
from scanner.pages.scanner_page import (
    get_or_fallback_market_scan,
    get_market_scan_cache,
    get_candlesticks_stocks,
)
from scanner.utils.demo_loader import load_demo_full_scan, DEMO_DATE


@pytest.mark.asyncio
async def test_empty_cache_returns_demo_fixture_with_is_demo_true():
    # Arrange: Redis cache returns None for both market_scan and snapshot
    with patch("scanner.pages.scanner_page.cache.get_json", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        # Act: Request full scan fallback
        data, is_demo = await get_or_fallback_market_scan()

        # Assert: Returns demo fixture with isDemo=True and expected date
        # Catch bug: Empty cache failing or returning empty list instead of demo fallback
        assert is_demo is True
        assert data.get("isDemo") is True
        assert data.get("demoAsOf") == DEMO_DATE
        assert len(data.get("results", [])) > 0


@pytest.mark.asyncio
async def test_populated_cache_returns_live_data_with_is_demo_false():
    # Arrange: Redis cache has live market_scan data
    live_scan = {
        "cached": True,
        "scanned_at": "10 Oct 2026 01:00 PM",
        "results": [{"symbol": "INFY.NS", "score": 85, "price": 1900.0}],
    }
    with patch("scanner.pages.scanner_page.cache.get_json", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = live_scan

        # Act: Request scan data
        data, is_demo = await get_or_fallback_market_scan()

        # Assert: Returns live data with isDemo=False
        # Catch bug: Returning demo data even when live scan cache exists
        assert is_demo is False
        assert data["results"][0]["symbol"] == "INFY.NS"


@pytest.mark.asyncio
async def test_demo_fallback_never_writes_to_redis():
    # Arrange: Mock both get_json and set_json
    with patch("scanner.pages.scanner_page.cache.get_json", new_callable=AsyncMock) as mock_get, \
         patch("scanner.pages.scanner_page.cache.set_json", new_callable=AsyncMock) as mock_set:
        mock_get.return_value = None

        # Act: Request fallback
        data, is_demo = await get_or_fallback_market_scan()

        # Assert: set_json was never called
        # Catch bug: Demo fallback polluting live Redis cache keys
        assert is_demo is True
        mock_set.assert_not_called()


@pytest.mark.asyncio
async def test_get_market_scan_cache_endpoint_includes_is_demo_flag():
    # Arrange: Cache is empty
    with patch("scanner.pages.scanner_page.cache.get_json", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        # Act: Call endpoint function with standard filters
        res = await get_market_scan_cache({"min_vol": 0.1, "min_grade": "D"})

        # Assert: Endpoint returns isDemo=True, demoAsOf date, and filtered stocks
        # Catch bug: Filtering discarding all demo stocks or omitting isDemo flag
        assert res["success"] is True
        assert res["isDemo"] is True
        assert res["demoAsOf"] == DEMO_DATE
        assert len(res["results"]) > 0


@pytest.mark.asyncio
async def test_get_candlesticks_stocks_includes_is_demo_flag():
    # Arrange: Cache is empty
    with patch("scanner.pages.scanner_page.cache.get_json", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        # Act: Call candlestick endpoint
        res = await get_candlesticks_stocks(limit=10)

        # Assert: Candlestick endpoint returns isDemo=True
        # Catch bug: Candlesticks panel omitting isDemo flag when reading fallback
        assert res["success"] is True
        assert res["isDemo"] is True
        assert res["demoAsOf"] == DEMO_DATE
        assert "results" in res

