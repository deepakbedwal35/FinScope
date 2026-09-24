// server/src/services/cacheService.js
//
// Cache-Aside pattern with Redis Mutex Locking (SETNX).
// Solves the "Cache Stampede" (Thundering Herd) problem:
// When high-traffic cached Redis keys expire, hundreds of simultaneous concurrent
// user requests hit the database, exhausting MongoDB's connection pool and CPU.
//
// ─── Execution Flow ───────────────────────────────────────────────────────
//
//   1. Check Redis cache first. On a Cache Hit, return data immediately.
//   2. On a Cache Miss, attempt to acquire the lock:
//      redis.set(lockKey, 'LOCKED', { NX: true, EX: 10 })
//   3. The thread that acquires the lock queries MongoDB/upstream services,
//      updates Redis with the new TTL, and releases the lock.
//   4. Threads that fail to acquire the lock wait 50–100ms and recursively
//      retry reading from Redis (bypassing MongoDB entirely).
//   5. Fail-Safe Mechanism: Explicit 10-second lock expiration prevents deadlocks
//      if the primary worker thread throws an error. If Redis is unavailable,
//      it gracefully falls back to direct execution.

const { getRedisClient } = require("../config/redis");

const LOCK_EXPIRY_SECONDS = 10; // Explicit 10s expiration to prevent deadlocks
const MAX_LOCK_RETRIES    = 20; // Maximum recursive retries (~1.5s total wait)

/**
 * Executes a function with Cache-Aside caching and Redis Mutex locking.
 *
 * @param {string}   cacheKey  - Unique Redis key for caching
 * @param {Function} fetchFn   - Async worker function (DB / API call)
 * @param {number}   ttlSec    - Cache Time-To-Live in seconds
 * @param {number}   [retries] - Current retry count
 * @returns {Promise<any>}
 */
async function withCache(cacheKey, fetchFn, ttlSec, retries = 0) {
  const redis = getRedisClient();

  // Fail-Safe: If Redis is offline or not ready, bypass cache and execute directly
  if (!redis || !redis.isOpen) {
    console.warn(`[CacheService] ⚠️ Redis offline/unavailable. Bypassing cache for key="${cacheKey}"`);
    return await fetchFn();
  }

  const lockKey = `lock:${cacheKey}`;

  try {
    // ── Step 1: Check Redis cache first ───────────────────────────────────
    console.log(`[CacheService] 🔍 Checking Redis cache → key="${cacheKey}"`);
    const cached = await redis.get(cacheKey);

    if (cached !== null) {
      console.log(`[CacheService] ✅ CACHE HIT → key="${cacheKey}"`);
      return JSON.parse(cached);
    }

    console.log(`[CacheService] ❌ CACHE MISS → key="${cacheKey}" (attempt ${retries + 1})`);

    // ── Step 2: On Cache Miss, attempt atomic mutex lock acquisition ───────
    // SET lockKey "LOCKED" NX EX 10
    const lockAcquired = await redis.set(lockKey, "LOCKED", {
      NX: true, // Only set if Not eXists (atomic mutex)
      EX: LOCK_EXPIRY_SECONDS, // Fail-safe auto-expire in 10s
    });

    if (lockAcquired === "OK") {
      // ── Step 3: Primary worker thread acquired lock ─────────────────────
      console.log(`[CacheService] 🔒 LOCK ACQUIRED → key="${cacheKey}" | Querying origin...`);
      try {
        const freshData = await fetchFn();

        // Update Redis with fresh data and TTL
        if (freshData !== undefined) {
          await redis.set(cacheKey, JSON.stringify(freshData), { EX: ttlSec });
          console.log(`[CacheService] 💾 CACHE SET → key="${cacheKey}" | TTL=${ttlSec}s`);
        }

        return freshData;
      } catch (workerErr) {
        console.error(`[CacheService] ⚠️ Worker execution failed for key="${cacheKey}":`, workerErr.message);
        throw workerErr;
      } finally {
        // Release the mutex lock
        try {
          await redis.del(lockKey);
          console.log(`[CacheService] 🔓 LOCK RELEASED → key="${cacheKey}"`);
        } catch (delErr) {
          console.error(`[CacheService] ⚠️ Failed to delete lock key="${lockKey}":`, delErr.message);
        }
      }
    } else {
      // ── Step 4: Secondary threads fail to acquire lock ──────────────────
      if (retries >= MAX_LOCK_RETRIES) {
        console.warn(
          `[CacheService] ⏱️ Max lock retries (${MAX_LOCK_RETRIES}) reached for key="${cacheKey}". Bypassing cache.`
        );
        return await fetchFn();
      }

      // Dynamic backoff with 50-100ms jitter to prevent thundering herd on retry
      const retryDelayMs = 50 + Math.floor(Math.random() * 51);
      console.log(
        `[CacheService] ⏳ LOCK CONTENTION → key="${cacheKey}" | Waiting ${retryDelayMs}ms then recursively retrying (${retries + 1}/${MAX_LOCK_RETRIES})...`
      );

      await sleep(retryDelayMs);

      // Recursively retry reading from Redis (bypassing MongoDB entirely)
      return withCache(cacheKey, fetchFn, ttlSec, retries + 1);
    }
  } catch (err) {
    console.error(`[CacheService] ❌ Redis error on key="${cacheKey}":`, err.message);
    // Graceful degradation: query origin directly so request doesn't fail
    return await fetchFn();
  }
}

/**
 * Manually invalidate a cache key (e.g. after database updates)
 */
async function invalidateCache(cacheKey) {
  try {
    const redis = getRedisClient();
    if (!redis || !redis.isOpen) return 0;
    const deleted = await redis.del(cacheKey);
    console.log(`[CacheService] 🗑️ invalidateCache → key="${cacheKey}" deleted=${deleted}`);
    return deleted;
  } catch (err) {
    console.error(`[CacheService] ⚠️ Failed to invalidate key="${cacheKey}":`, err.message);
    return 0;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { withCache, invalidateCache };

