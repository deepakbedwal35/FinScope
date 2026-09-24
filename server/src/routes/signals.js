// server/src/routes/signals.js
//
// All signal/scanner routes with Redis stampede protection via withCache().
//
// Cache TTL strategy:
//   Per-symbol analysis / chart   → 120s  (2 min — frequent individual lookups)
//   Candlesticks / patterns       → 300s  (5 min — batch scans, expensive)
//   Sector rotation / indices     →  60s  (1 min — market summary)
//   Fundamentals                  → 900s  (15 min — stable company data)
//   AI analysis                   → 600s  (10 min — LLM call, costly)
//   Risks                         → 300s  (5 min)
//   Fin recommendations           → 600s  (10 min)
//
// Non-cached routes (by design):
//   POST /backtest, POST /fullscan → user-driven, filter-specific, not cacheable
//   POST /fetch/price              → real-time, TTL=0 by nature
//   GET  /runfullscan              → admin trigger, intentionally skips cache

const express  = require("express");
const router   = express.Router();
const scanner  = require("../services/scannerService");
const { withCache, invalidateCache } = require("../services/cacheService");

// ── Dev redirect ─────────────────────────────────────────────────────────────
router.get("/demo", (req, res) => {
  res.redirect("http://localhost:5173");
});

// ── All signals scan (full list) ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const data = await withCache("signals:all", () => scanner.getSignals(), 120);
    res.json(data);
  } catch (err) {
    console.error("[signals /] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Per-symbol chart ─────────────────────────────────────────────────────────
router.get("/chart/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await withCache(
      `signals:chart:${symbol}`,
      () => scanner.getChart(symbol),
      120
    );
    res.json(data);
  } catch (err) {
    console.error(`[signals /chart/${symbol}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Per-symbol technical analysis ────────────────────────────────────────────
router.get("/analyze/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await withCache(
      `signals:analyze:${symbol}`,
      () => scanner.getSignalForStock(symbol),
      120
    );
    res.json(data);
  } catch (err) {
    console.error(`[signals /analyze/${symbol}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Fundamentals (stable data — long TTL) ────────────────────────────────────
router.get("/fundamentals/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await withCache(
      `signals:fundamentals:${symbol}`,
      () => scanner.getFundamentals(symbol),
      900  // 15 min — company financials change slowly
    );
    res.json(data);
  } catch (err) {
    console.error(`[signals /fundamentals/${symbol}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── AI Analysis (expensive LLM call) ─────────────────────────────────────────
router.get("/ai/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await withCache(
      `signals:ai:${symbol}`,
      () => scanner.get_ai_analysis(symbol),
      600  // 10 min — LLM calls are slow & costly
    );
    res.json(data);
  } catch (err) {
    console.error(`[signals /ai/${symbol}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: trigger full scan (NOT cached — intentional admin action) ──────────
router.get("/runfullscan", async (req, res) => {
  try {
    console.log("[signals /runfullscan] Admin triggered — bypassing cache");
    const data = await scanner.runFullScanAdmin();
    // Invalidate stale pattern caches so next requests get fresh data
    await Promise.allSettled([
      invalidateCache("dashboard:candlesticks"),
      invalidateCache("dashboard:reversals"),
      invalidateCache("dashboard:continuations"),
      invalidateCache("signals:candlesticks"),
      invalidateCache("signals:reversals"),
      invalidateCache("signals:continuations"),
    ]);
    console.log("[signals /runfullscan] ♻️  Related caches invalidated");
    res.json(data);
  } catch (err) {
    console.error("[signals /runfullscan] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Backtest (user-driven, filter-specific — NOT cacheable) ──────────────────
router.post("/backtest", async (req, res) => {
  try {
    const filters = req.body;
    console.log("[signals /backtest] Filters received:", JSON.stringify(filters));
    const data = await scanner.runBacktest(filters);
    return res.json(data);
  } catch (err) {
    console.error("[signals /backtest] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── Full scan (user-driven filter scan — NOT cacheable) ──────────────────────
router.post("/fullscan", async (req, res) => {
  try {
    const filters = req.body;
    console.log("[signals /fullscan] Filters:", JSON.stringify(filters));
    const data = await scanner.getTopStocks(filters);
    return res.status(200).json(data);
  } catch (error) {
    console.error("[signals /fullscan] Error:", error.message);
    res.status(500).json({
      error: "Backend computation failure",
      details: error.message,
      filters_received: req.body,
    });
  }
});

// ── Risk assessment ───────────────────────────────────────────────────────────
router.get("/risks/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await withCache(
      `signals:risks:${symbol}`,
      () => scanner.getRisks(symbol),
      300
    );
    res.json(data);
  } catch (err) {
    console.error(`[signals /risks/${symbol}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Stock search (short TTL — user types in real-time) ───────────────────────
router.get("/search", async (req, res) => {
  const q = req.query.q;
  try {
    // Short TTL: search results for the same query string are valid briefly
    const data = await withCache(
      `signals:search:${q}`,
      () => scanner.searchStock(q),
      60  // 1 min
    );
    res.json(data);
  } catch (err) {
    console.error(`[signals /search?q=${q}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Index data (near real-time prices) ───────────────────────────────────────
router.get("/indices/data", async (req, res) => {
  try {
    const data = await withCache(
      "signals:indices",
      () => scanner.getIndicesData(),
      60  // 1 min — live market data
    );
    res.json(data);
  } catch (err) {
    console.error("[signals /indices/data] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Sector rotation analysis ──────────────────────────────────────────────────
router.get("/analysis/sector-rotation", async (req, res) => {
  try {
    const data = await withCache(
      "signals:sector-rotation",
      () => scanner.getSectorAnalysis(),
      300  // 5 min — sector moves slowly
    );
    res.json(data);
  } catch (err) {
    console.error("[signals /analysis/sector-rotation] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Candlestick pattern stocks (heavy scan — stampede protection critical) ────
router.get("/candlesticks/stocks", async (req, res) => {
  try {
    const data = await withCache(
      "signals:candlesticks",
      () => scanner.getCandlesticksStock(),
      300
    );
    res.json(data);
  } catch (err) {
    console.error("[signals /candlesticks/stocks] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Reversal pattern stocks ───────────────────────────────────────────────────
router.get("/reversal/stocks", async (req, res) => {
  try {
    const data = await withCache(
      "signals:reversals",
      () => scanner.getReversalPatternStock(),
      300
    );
    res.json(data);
  } catch (err) {
    console.error("[signals /reversal/stocks] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Continuation pattern stocks ───────────────────────────────────────────────
router.get("/continuation/stocks", async (req, res) => {
  try {
    const data = await withCache(
      "signals:continuations",
      () => scanner.getContPatternStock(),
      300
    );
    res.json(data);
  } catch (err) {
    console.error("[signals /continuation/stocks] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Live price fetch (real-time — NOT cached) ─────────────────────────────────
router.post("/fetch/price", async (req, res) => {
  try {
    const { symbols } = req.body;
    console.log("[signals /fetch/price] Symbols requested:", symbols);

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: "symbols must be a non-empty array" });
    }

    // Live prices — no caching, always fresh
    const prices = await scanner.fetchCurrPrice(symbols);
    res.json(prices);
  } catch (err) {
    console.error("[signals /fetch/price] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Fin recommendations ───────────────────────────────────────────────────────
router.get("/fin/recommends", async (req, res) => {
  try {
    const data = await withCache(
      "signals:fin-recommends",
      () => scanner.finRecommends(),
      600  // 10 min
    );
    res.json(data);
  } catch (err) {
    console.error("[signals /fin/recommends] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Custom scan (POST, symbols-specific — NOT cacheable) ──────────────────────
router.post("/", async (req, res) => {
  try {
    console.log("[signals POST /] Custom scan symbols:", req.body.symbols);
    const data = await scanner.customScan(req.body.symbols);
    res.json(data);
  } catch (err) {
    console.error("[signals POST /] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports = router;