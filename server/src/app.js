// server/src/app.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");

const errorHandler = require("./middleware/errorHandler");

// Adaptive rate-limit profiles
const { authLimiter, dashboardLimiter, globalLimiter } = require("./middleware/rateLimiter");

const app = express();

// ── Route Imports ───────────────────────────────────────────────────────────
const scanRouter       = require("./routes/signals");
const userRouter       = require("./routes/user");
const watchRouter      = require("./routes/watchlist");
const tradeRouter      = require("./routes/trades");
const recommendsRouter = require("./routes/recommendations");
const dashboardRouter  = require("./routes/dashboard");

// ── CORS ─────────────────────────────────────────────────────────────────────
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
app.set("trust proxy", 1);

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
app.use("/user", authLimiter, userRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/signals/recommends", dashboardLimiter, recommendsRouter);
app.use("/api/signals",            dashboardLimiter, scanRouter);
app.use("/watchlist", globalLimiter, watchRouter);
app.use("/trades",    globalLimiter, tradeRouter);

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
