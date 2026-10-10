// server/src/utils/demoLoader.js
// Safe in-memory loader for the demo full scan fixture.
// Never writes to Redis or MongoDB.

const fs = require("fs");
const path = require("path");

const DEMO_DATE = "2026-10-09";
let cachedDemoData = null;

function loadDemoFullScan() {
  if (!cachedDemoData) {
    const fixturePath = path.resolve(__dirname, "../data/demoFullScan.json");
    const raw = fs.readFileSync(fixturePath, "utf-8");
    cachedDemoData = JSON.parse(raw);
  }

  // Deep clone to prevent accidental mutations
  const clone = JSON.parse(JSON.stringify(cachedDemoData));
  clone.isDemo = true;
  clone.demoAsOf = DEMO_DATE;
  return clone;
}

module.exports = {
  loadDemoFullScan,
  DEMO_DATE,
};

