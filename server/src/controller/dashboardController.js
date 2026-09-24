// server/src/controller/dashboardController.js
//
// Dashboard Aggregator Controller
// ================================
// Solves the "Frontend Request Flooding" problem:
//
//   BEFORE: React home page fires 5–8 separate HTTP requests on mount
//   (candlesticks, reversals, continuations, index data, recommendations,
//   live prices, user profile ...). Each request competes for Express
//   rate-limiter slots → false-positive 429 errors.
//
//   AFTER: ONE composite request to GET /api/v1/dashboard returns a single unified
//   JSON payload. All underlying data sources are fetched CONCURRENTLY
//   via Promise.allSettled(), so total latency equals the slowest
//   single fetch rather than the sum of all serial calls.
//
// ─── Concurrency Management ───────────────────────────────────────────────
//
//   • Concurrent Execution: Queries are kicked off in parallel across worker
//     promises to maximize throughput.
//   • Fault Isolation: Promise.allSettled() prevents one slow or failing service
//     (e.g., Python ML scanner waking up on cold start) from taking down the entire dashboard.
//   • Stampede Prevention: Every sub-query uses withCache() which employs Redis
//     SETNX mutex locks to ensure only one thread queries the origin upon cache miss/expiry.
//
// ─── Cache Strategy ───────────────────────────────────────────────────────
//
//   TTLs are tuned to individual data freshness requirements:
//     - Indices data (prices)    → 60s   (1 minute — near real-time)
//     - Candlestick/Reversal     → 300s  (5 minutes — pattern scans)
//     - Recommendations          → 600s  (10 minutes — daily analysis from Mongo)

const scanner = require("../services/scannerService");
const Recommendations = require("../models/Recommendations");
const { withCache } = require("../services/cacheService");

// ── Cache TTLs (seconds) ──────────────────────────────────────────────────
const TTL = {
  indices:         60,   // 1 min  — live index prices
  candlesticks:   300,   // 5 min  — pattern scan results
  reversals:      300,   // 5 min  — reversal scan results
  continuations:  300,   // 5 min  — continuation patterns
  recommendations: 600,  // 10 min — daily stock recommendations
};

// ─────────────────────────────────────────────────────────────────────────
// Helper: normalise Promise.allSettled result into { data, error }
// ─────────────────────────────────────────────────────────────────────────
function settle(result, label) {
  if (result.status === "fulfilled") {
    console.log(`[DashboardController] ✅ ${label} fetch succeeded`);
    return { data: result.value, error: null };
  }
  console.warn(`[DashboardController] ⚠️  ${label} fetch failed:`, result.reason?.message);
  return { data: null, error: result.reason?.message || "Internal Service Error" };
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/dashboard
// ─────────────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  const startTime = Date.now();
  console.log(`[DashboardController] 🚀 GET /api/v1/dashboard invoked by IP: ${req.ip}`);

  try {
    // ── Execute all queries concurrently with Redis Mutex cache protection ──
    const [
      indicesResult,
      candlesticksResult,
      reversalsResult,
      continuationsResult,
      recommendationsResult,
    ] = await Promise.allSettled([
      // 1. Live Index summary (Nifty 50, Bank Nifty, etc.)
      withCache(
        "dashboard:indices",
        () => scanner.getIndicesData(),
        TTL.indices
      ),

      // 2. Candlestick patterns
      withCache(
        "dashboard:candlesticks",
        () => scanner.getCandlesticksStock(),
        TTL.candlesticks
      ),

      // 3. Reversal pattern stocks
      withCache(
        "dashboard:reversals",
        () => scanner.getReversalPatternStock(),
        TTL.reversals
      ),

      // 4. Continuation pattern stocks
      withCache(
        "dashboard:continuations",
        () => scanner.getContPatternStock(),
        TTL.continuations
      ),

      // 5. Open recommendations from MongoDB (protected against connection pool exhaustion)
      withCache(
        "dashboard:recommendations",
        () => Recommendations.find({ isOpen: true }).lean(),
        TTL.recommendations
      ),
    ]);

    const elapsedMs = Date.now() - startTime;
    console.log(`[DashboardController] ⏱️ All concurrent queries completed in ${elapsedMs}ms`);

    // Normalize results
    const indices         = settle(indicesResult,         "indices");
    const candlesticks    = settle(candlesticksResult,    "candlesticks");
    const reversals       = settle(reversalsResult,       "reversals");
    const continuations   = settle(continuationsResult,   "continuations");
    const recommendations = settle(recommendationsResult, "recommendations");

    const allFailed = [
      indices, candlesticks, reversals, continuations, recommendations
    ].every((r) => r.data === null);

    const statusCode = allFailed ? 503 : 200;

    return res.status(statusCode).json({
      success: !allFailed,
      meta: {
        timestamp: new Date().toISOString(),
        elapsedMs,
      },
      data: {
        indices:         indices.data,
        candlesticks:    candlesticks.data,
        reversals:       reversals.data,
        continuations:   continuations.data,
        recommendations: recommendations.data,
      },
      ...(
        [indices, candlesticks, reversals, continuations, recommendations].some((r) => r.error) && {
          errors: {
            indices:         indices.error,
            candlesticks:    candlesticks.error,
            reversals:       reversals.error,
            continuations:   continuations.error,
            recommendations: recommendations.error,
          },
        }
      ),
    });
  } catch (err) {
    console.error("[DashboardController] ❌ Unhandled error in aggregator:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate dashboard payload",
      error: err.message,
    });
  }
};

module.exports = { getDashboard };

