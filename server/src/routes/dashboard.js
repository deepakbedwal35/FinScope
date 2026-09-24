// server/src/routes/dashboard.js
// 
// Single composite dashboard route.
// Applies the "dashboardLimiter" (200 req / 15 min / IP) — generous enough
// that concurrent React component mounts on page load never hit the wall.

const express    = require("express");
const router     = express.Router();

const { restrictToLoggedIn }  = require("../middleware/auth");
const { dashboardLimiter }    = require("../middleware/rateLimiter");
const { getDashboard }        = require("../controller/dashboardController");

/**
 * GET /api/v1/dashboard
 *
 * Aggregates: indices, candlesticks, reversals, continuations, recommendations
 * into a single concurrent payload.
 *
 * Chain: dashboardLimiter → restrictToLoggedIn → getDashboard
 *
 *  • dashboardLimiter first so unauthenticated flood requests are blocked
 *    before any auth work or DB I/O happens.
 *  • restrictToLoggedIn ensures only valid sessions reach the controller.
 */
router.get(
  "/",
  dashboardLimiter,       // Rate limit: 200 req / 15 min / IP
  restrictToLoggedIn,     // JWT / cookie auth guard
  getDashboard            // Concurrent aggregator
);

module.exports = router;

