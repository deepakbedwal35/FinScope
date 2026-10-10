// server/src/routes/demo.js
// Public rate-limited demo endpoints serving static fixtures.
// Does NOT touch scanner, Redis, or MongoDB.

const express = require("express");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const demoLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many demo requests, please try again shortly." },
});

router.use(demoLimiter);

function readDemoFixture(filename) {
  // Check client/src/demo/ or server/src/data/
  const clientPath = path.resolve(__dirname, `../../../client/src/demo/${filename}`);
  const serverPath = path.resolve(__dirname, `../data/${filename}`);
  const target = fs.existsSync(clientPath) ? clientPath : serverPath;
  return JSON.parse(fs.readFileSync(target, "utf-8"));
}

router.get("/scan", (req, res) => {
  try {
    const data = readDemoFixture("demoScan.json");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load scan demo fixture" });
  }
});

router.get("/backtest", (req, res) => {
  try {
    const data = readDemoFixture("demoBacktest.json");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load backtest demo fixture" });
  }
});

router.get("/stock", (req, res) => {
  try {
    const data = readDemoFixture("demoStock.json");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load stock demo fixture" });
  }
});

router.get("/recommendations", (req, res) => {
  try {
    const data = readDemoFixture("demoRecommendations.json");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load recommendations demo fixture" });
  }
});

module.exports = router;

