// server/src/services/cacheService.js
//
// Cache-Aside pattern with Redis Mutex Locking (SETNX).
// Solves the "Cache Stampede" problem: when a hot key expires and hundreds of
// concurrent requests all hit MongoDB at the same time.
//
// ─── Execution Flow ───────────────────────────────────────────────────────
//
//   1. CHECK Redis for the cached key.
//      └─ CACHE HIT  → return parsed JSON immediately. ✅
//
//   2. CACHE MISS → attempt to acquire a distributed Redis mutex lock.
//      (uses atomic SET key NX EX so only ONE thread wins the race)
//
//      a. LOCK ACQUIRED (this thread is the "primary worker"):
//         ├─ Execute the expensive fetchFn() (Python API / MongoDB query)
//         ├─ Write result back to Redis with the caller-specified TTL
//         └─ Release the lock (DEL lockKey)
//
//      b. LOCK NOT ACQUIRED (another thread is already fetching):
//         ├─ Wait 75 ms  (jitter avoids thundering-herd on retry)
//         └─ Recursively call withCache() again → goes back to step 1
//            (the primary worker should have populated Redis by now)
//
//   3. FAIL-SAFE: lock has a 10-second hard expiry (set at acquisition time)
//      so a crashed primary worker can't hold the lock forever.
//
// ─── Usage ────────────────────────────────────────────────────────────────
//
//   const data = await withCache(
//     "candlestick:stocks",        // Redis cache key
//     () => scanner.getCandlesticksStock(),  // expensive fetch fn
//     300                          // TTL in seconds (5 min)
//   );

const { getRedisClient } = require("../config/redis");

// How long (ms) a thread that failed to acquire the lock waits before
// retrying.  A small random jitter prevents all waiters waking simultaneously.
const LOCK_RETRY_DELAY_MS     = 50 + Math.floor(Math.random() * 50); // 50–100 ms
const LOCK_EXPIRY_SECONDS     = 10; // Hard cap: prevents deadlocks if primary crashes
const MAX_LOCK_RETRIES        = 20; // ~1-2 seconds of total wait (20 × 75ms)

/**
 * @param {string}   cacheKey  - Redis key for the cached value
 * @param {Function} fetchFn   - Async function that produces fresh data
 * @param {number}   ttlSec    - Cache TTL in seconds
 * @param {number}   [retries] - Internal retry counter (do not pass manually)
 * @returns {Promise<any>}
 */
async function withCache(cacheKey, fetchFn, ttlSec, retries = 0) {
  const redis = getRedisClient();

  // ── Step 1: Try the cache first ─────────────────────────────────────────
  console.log(`[CacheService] 🔍 Checking Redis cache → key="${cacheKey}"`);
  const cached = await redis.get(cacheKey);

  if (cached !== null) {
    console.log(`[CacheService] ✅ CACHE HIT  → key="${cacheKey}"`);
    return JSON.parse(cached);
  }

  console.log(`[CacheService] ❌ CACHE MISS → key="${cacheKey}" (attempt ${retries + 1})`);

  // ── Step 2: Stampede guard — try to acquire the mutex lock ───────────────
  const lockKey = `lock:${cacheKey}`;

  // SET lockKey "LOCKED" NX EX 10
  //   NX  → only set if the key does NOT already exist (atomic CAS)
  //   EX  → auto-expire after LOCK_EXPIRY_SECONDS (deadlock prevention)
  const lockAcquired = await redis.set(lockKey, "LOCKED", {
    NX: true,             // Only if Not eXists
    EX: LOCK_EXPIRY_SECONDS,
  });

  if (lockAcquired === "OK") {
    // ── This thread WON the lock ────────────────────────────────────────
    console.log(`[CacheService] 🔒 LOCK ACQUIRED → key="${cacheKey}" | fetching fresh data...`);
    try {
      // Execute the expensive operation (Python API call / DB query)
      const freshData = await fetchFn();

      // Persist to Redis so every subsequent request gets a cache hit
      await redis.set(cacheKey, JSON.stringify(freshData), { EX: ttlSec });
      console.log(`[CacheService] 💾 CACHE SET → key="${cacheKey}" | TTL=${ttlSec}s`);

      return freshData;
    } catch (err) {
      // Do NOT rethrow without releasing the lock — that would deadlock
      // all waiters for 10 full seconds.
      console.error(`[CacheService] ⚠️  fetchFn FAILED for key="${cacheKey}":`, err.message);
      throw err;
    } finally {
      // Always release the lock, even on error
      await redis.del(lockKey);
      console.log(`[CacheService] 🔓 LOCK RELEASED → key="${cacheKey}"`);
    }
  } else {
    // ── Another thread holds the lock ──────────────────────────────────
    if (retries >= MAX_LOCK_RETRIES) {
      // Safety valve: if we've been spinning for ~2 seconds and the cache
      // is still empty, bypass caching and fetch directly.
      console.warn(
        `[CacheService] ⏱️  Max lock retries (${MAX_LOCK_RETRIES}) reached for ` +
        `key="${cacheKey}". Bypassing cache and fetching directly.`
      );
      return fetchFn();
    }

    console.log(
      `[CacheService] ⏳ LOCK CONTENTION → key="${cacheKey}" | ` +
      `waiting ${LOCK_RETRY_DELAY_MS}ms then retrying (attempt ${retries + 1}/${MAX_LOCK_RETRIES})...`
    );

    // Wait a small amount then re-enter — the primary worker should have
    // populated the cache during this window.
    await sleep(LOCK_RETRY_DELAY_MS);
    return withCache(cacheKey, fetchFn, ttlSec, retries + 1);
  }
}

/**
 * Invalidate (delete) a specific cache key.
 * Useful after admin write operations that stale data.
 */
async function invalidateCache(cacheKey) {
  const redis = getRedisClient();
  const deleted = await redis.del(cacheKey);
  console.log(`[CacheService] 🗑️  invalidateCache → key="${cacheKey}" deleted=${deleted}`);
  return deleted;
}

/**
 * Simple promise-based sleep helper
 * @param {number} ms - Milliseconds to wait
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { withCache, invalidateCache };

