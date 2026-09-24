// server/src/index.js
//
// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap Order (matters!):
//   1. Load env vars
//   2. Init Redis (singleton client — all services depend on it)
//   3. Connect MongoDB
//   4. Wire Express: CORS → trust proxy → body parsing → rate limiters → routes → error handler
//   5. Start HTTP server
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Environment ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");

const connectDB               = require("./config/db");
const { handleRedisCaching }  = require("./config/redis");   // ← updated singleton export
const errorHandler            = require("./middleware/errorHandler");

// Adaptive rate-limit profiles
const { authLimiter, dashboardLimiter, globalLimiter } = require("./middleware/rateLimiter");

const PORT = process.env.PORT || 8080;
const app  = express();

// ── Route Imports ───────────────────────────────────────────────────────────
const scanRouter       = require("./routes/signals");
const userRouter       = require("./routes/user");
const watchRouter      = require("./routes/watchlist");
const tradeRouter      = require("./routes/trades");
const recommendsRouter = require("./routes/recommendations");
const dashboardRouter  = require("./routes/dashboard");        // ← NEW

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow all origins (keeps Render / Vercel deploys simple).
// Tighten in production by checking against an allowlist env var.
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
    methods:      ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "x-access-token"],
  })
);

// ── Proxy Trust ───────────────────────────────────────────────────────────────
// REQUIRED for express-rate-limit to read the real client IP from
// X-Forwarded-For set by Nginx / Cloudflare / Render's edge.
// Without this every request appears to originate from the proxy's LAN IP
// and ALL users share a single rate-limit bucket.
app.set("trust proxy", 1);
console.log("[Bootstrap] trust proxy = 1 (rate-limiter reads X-Forwarded-For)");

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check (exempt from rate limiting) ─────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);
app.get("/", (req, res) =>
  res.json({ status: "FinScope API is running" })
);

// ── Routes with targeted rate limiters ───────────────────────────────────────
//
//   AUTH  — strict:  5 req / min / IP (brute-force guard on login & signup)
app.use("/user", authLimiter, userRouter);

//   DASHBOARD AGGREGATOR — generous: 200 req / 15 min / IP
//   Single composite endpoint; prevents false-429 on React page-load floods
app.use("/api/v1/dashboard", dashboardRouter);

//   SIGNAL / SCAN read routes — generous: 200 req / 15 min / IP
app.use("/api/signals/recommends", dashboardLimiter, recommendsRouter);
app.use("/api/signals",            dashboardLimiter, scanRouter);

//   USER DATA — watchlist & trades mutations: global limiter
app.use("/watchlist", globalLimiter, watchRouter);
app.use("/trades",    globalLimiter, tradeRouter);

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Server Bootstrap ─────────────────────────────────────────────────────────
// Boot order:  Redis first → MongoDB → HTTP server.
// Redis must be up before any request handler tries getRedisClient().
async function bootstrap() {
  try {
    console.log("[Bootstrap] 🔄 Connecting to Redis...");
    await handleRedisCaching();                // wires singleton client
    console.log("[Bootstrap] ✅ Redis ready.");

    console.log("[Bootstrap] 🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("[Bootstrap] ✅ MongoDB ready.");

    app.listen(PORT, () => {
      console.log(`[Bootstrap] 🚀 Server running → http://localhost:${PORT}`);
      console.log(`[Bootstrap] 📋 Adaptive rate limiters active:`);
      console.log(`            • /user          → auth      (5 req / 1 min)`);
      console.log(`            • /api/v1/dashboard → dashboard (200 req / 15 min)`);
      console.log(`            • /api/signals    → dashboard (200 req / 15 min)`);
      console.log(`            • /watchlist, /trades → global (300 req / 15 min)`);
    });
  } catch (err) {
    console.error("[Bootstrap] ❌ Fatal startup error:", err.message);
    process.exit(1);
  }
}

bootstrap();

