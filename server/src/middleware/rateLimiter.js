// server/src/middleware/rateLimiter.js
//
// Adaptive, profile-based rate limiting using express-rate-limit.
//
// ─── Why separate profiles? ───────────────────────────────────────────────
//
//   • AUTH routes (login / signup) must be strict — brute-force protection.
//   • DASHBOARD / read endpoints get generous limits to prevent false-429s
//     when React fires multiple concurrent fetches on page load.
//   • ADMIN / write routes sit in the middle.
//
// ─── Proxy trust ─────────────────────────────────────────────────────────
//
//   app.set('trust proxy', 1) is set in index.js so that
//   express-rate-limit reads the real client IP from X-Forwarded-For
//   (set by Nginx / Cloudflare / Render) instead of the proxy's LAN IP.
//   Without this every request appears to come from the same IP → all
//   users share a single rate-limit bucket.
//
// ─── Sliding Window ──────────────────────────────────────────────────────
//
//   express-rate-limit v7 uses a sliding-window by default when the
//   `windowMs` counter is reset at each window boundary.  For a proper
//   sliding log per-IP the Rate-Limit-Reset header is sent automatically.

const rateLimit = require("express-rate-limit");

// ─────────────────────────────────────────────────────────────────────────
// Helper: build a limiter with a shared, readable config object.
// ─────────────────────────────────────────────────────────────────────────
function buildLimiter({ windowMs, max, name }) {
  return rateLimit({
    windowMs,
    max,

    // Sliding-window: the counter is reset only when the OLDEST request
    // inside the window ages out — not on a fixed boundary.
    standardHeaders: "draft-7", // Sends RateLimit-* headers (RFC 9110)
    legacyHeaders: false,        // Disable deprecated X-RateLimit-* headers

    // Friendly error body with enough context for frontend debugging
    handler: (req, res) => {
      const retryAfter = Math.ceil(
        (req.rateLimit.resetTime - Date.now()) / 1000
      );
      console.warn(
        `[RateLimiter] 🚫 429 on [${name}] — IP: ${req.ip} | ` +
        `hits: ${req.rateLimit.current}/${max} | ` +
        `retry in: ${retryAfter}s`
      );
      res.status(429).json({
        success: false,
        error: "Too Many Requests",
        message: `Rate limit exceeded on [${name}]. Please retry after ${retryAfter} seconds.`,
        retryAfterSeconds: retryAfter,
        limiterProfile: name,
      });
    },

    // Skip rate-limiting for health-check pings so uptime monitors
    // don't consume request budget.
    skip: (req) => req.path === "/" || req.path === "/health",
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Profile 1 — AUTH  (strict, brute-force protection)
// 5 requests per minute per IP.
// Applies to: POST /user/login, POST /user/signup
// ─────────────────────────────────────────────────────────────────────────
const authLimiter = buildLimiter({
  windowMs: 60 * 1000,   // 1 minute sliding window
  max: 5,                // 5 attempts / minute / IP
  name: "auth",
});

// ─────────────────────────────────────────────────────────────────────────
// Profile 2 — DASHBOARD / READ  (generous, prevents false-429 on page load)
// 200 requests per 15 minutes per IP.
// Applies to: GET /api/v1/dashboard, GET /api/signals/*, GET /watchlist/*
// ─────────────────────────────────────────────────────────────────────────
const dashboardLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,  // 15-minute sliding window
  max: 200,                   // 200 reads / 15 min / IP
  name: "dashboard-read",
});

// ─────────────────────────────────────────────────────────────────────────
// Profile 3 — API WRITE  (moderate — trades, watchlist mutations)
// 60 requests per 10 minutes per IP.
// ─────────────────────────────────────────────────────────────────────────
const apiWriteLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,  // 10-minute sliding window
  max: 60,                    // 60 writes / 10 min / IP
  name: "api-write",
});

// ─────────────────────────────────────────────────────────────────────────
// Profile 4 — GLOBAL FALLBACK  (catches anything not explicitly limited)
// 300 requests per 15 minutes per IP.
// ─────────────────────────────────────────────────────────────────────────
const globalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  name: "global",
});

module.exports = {
  authLimiter,
  dashboardLimiter,
  apiWriteLimiter,
  globalLimiter,
};

