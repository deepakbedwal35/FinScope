"""
Shared async Redis layer for the whole app.

Replaces the THREE separate `redis.from_url(...)` clients that used to live
in scanner_page.py, backtest_logic.py, and stock_info_page.py with one
connection pool, and replaces per-file TTL constants with market-hours-aware
TTLs computed in one place.

Import `cache` and use it everywhere instead of instantiating redis directly.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, time as dtime
from typing import Any, Awaitable, Callable, Optional
from zoneinfo import ZoneInfo

import redis.asyncio as redis

IST = ZoneInfo("Asia/Kolkata")

# NSE cash market: Mon-Fri, 09:15-15:30 IST
_MARKET_OPEN = dtime(9, 15)
_MARKET_CLOSE = dtime(15, 30)


def is_market_open(now: Optional[datetime] = None) -> bool:
    now = (now or datetime.now(IST)).astimezone(IST)
    if now.weekday() >= 5:  # Sat/Sun
        return False
    return _MARKET_OPEN <= now.time() <= _MARKET_CLOSE


class TTL:
    """
    Dynamic TTLs. Same cache *keys* as before, but the number of seconds
    now depends on whether the market is live. Live market -> short TTL
    (data goes stale fast). Closed -> long TTL (nothing's changing anyway).
    """

    # (live_seconds, closed_seconds)
    PRICE = (60, 900)  # was flat 180
    STOCK_DETAIL = (900, 21600)  # "curr_stock", was flat 18000
    MARKET_SCAN = (600, 14400)  # was flat 7200
    SECTOR_ROTATION = (1800, 21600)  # was flat 18000
    AI_ANALYSIS = (1800, 7200)  # was flat 3600
    BACKTEST = (3600, 14400)  # was flat 7200
    INDICES = (60, 300)  # was flat 180

    @staticmethod
    def resolve(pair: tuple[int, int]) -> int:
        live, closed = pair
        return live if is_market_open() else closed


class Cache:
    """
    Thin async wrapper around one Redis connection pool for the whole app.
    Two storage shapes, matched to the data:

    - `get_json` / `set_json` — for the big nested blobs (market_scan,
      curr_stock, sector_rotation, ai_analysis, backtest_cache, indices_data).
      These are lists/nested dicts, not flat records, so a hash buys nothing.
    - `get_field` / `set_fields` — for flat per-symbol records (live price
      ticks), stored as a Redis hash (HSET/HGET) instead of one stringified
      JSON blob per symbol. One hash key ("prices") holds every symbol as a
      field, so 500 symbols = 1 Redis key instead of 500.

    Note on hash TTLs: per-field TTL (HEXPIRE) needs Redis >= 7.4. If your
    Redis is older, the whole "prices" hash carries one TTL (reset on every
    write), which is the standard fallback and fine for this use case since
    all fields refresh on roughly the same cadence anyway.
    """

    def __init__(self, url: Optional[str] = None):
        self._url = url or os.environ.get("REDIS_URL", "redis://localhost:6379")
        self._client: Optional[redis.Redis] = None

    @property
    def client(self) -> redis.Redis:
        if self._client is None:
            self._client = redis.from_url(self._url, decode_responses=True)
        return self._client

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    # ---- blob cache (market_scan, curr_stock, sector_rotation, etc.) ----

    async def get_json(self, key: str) -> Any | None:
        raw = await self.client.get(key)
        return json.loads(raw) if raw is not None else None

    async def set_json(self, key: str, value: Any, ttl: int) -> None:
        await self.client.set(key, json.dumps(value), ex=ttl)

    async def delete(self, key: str) -> None:
        await self.client.delete(key)

    async def get_or_set(
        self,
        key: str,
        ttl: int,
        fetch: Callable[[], Awaitable[Any]],
        *,
        accept: Optional[Callable[[Any], bool]] = None,
    ) -> Any:
        """
        Single-lookup short-circuit: return the cached value if present and
        valid; otherwise compute it once via `fetch`, cache it, and return it.

        This is the fix for scanner_page.py calling
        `redis_client.get("market_scan")` seven separate times across
        different functions with no shared path. Call this once per request
        instead, and pass an `accept` predicate if a cached value needs
        validating (e.g. the old `result.get("symbol") == symbol` check).
        """
        cached = await self.get_json(key)
        if cached is not None and (accept is None or accept(cached)):
            return cached
        fresh = await fetch()
        if fresh is not None:
            await self.set_json(key, fresh, ttl)
        return fresh

    # ---- hash cache (per-symbol flat records, e.g. live price) ----

    async def get_field(self, hash_key: str, field: str) -> Any | None:
        raw = await self.client.hget(hash_key, field)
        return json.loads(raw) if raw is not None else None

    async def get_fields(self, hash_key: str, fields: list[str]) -> dict[str, Any | None]:
        if not fields:
            return {}
        raw_values = await self.client.hmget(hash_key, fields)
        return {
            f: (json.loads(v) if v is not None else None)
            for f, v in zip(fields, raw_values)
        }

    async def set_field(self, hash_key: str, field: str, value: Any, ttl: int) -> None:
        await self.client.hset(hash_key, field, json.dumps(value))
        await self.client.expire(hash_key, ttl)  # refreshes whole-hash TTL

    async def set_fields(self, hash_key: str, mapping: dict[str, Any], ttl: int) -> None:
        if not mapping:
            return
        await self.client.hset(
            hash_key, mapping={k: json.dumps(v) for k, v in mapping.items()}
        )
        await self.client.expire(hash_key, ttl)


# One instance, imported everywhere. Replaces the three duplicated
# `redis_client = redis.from_url(...)` blocks.
cache = Cache()