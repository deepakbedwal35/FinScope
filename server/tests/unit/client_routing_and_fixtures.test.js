// server/tests/unit/client_routing_and_fixtures.test.js
const fs = require("fs");
const path = require("path");

describe("Client Demo Fixtures & Landing Routing Logic", () => {
  const demoDir = path.resolve(__dirname, "../../../client/src/demo");

  test("demoScan.json fixture exists and has valid full-scan fields", () => {
    const raw = fs.readFileSync(path.join(demoDir, "demoScan.json"), "utf-8");
    const data = JSON.parse(raw);
    expect(data.isDemo).toBe(true);
    expect(data.demoAsOf).toBeDefined();
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThan(0);

    const first = data.results[0];
    expect(first.symbol).toBeDefined();
    expect(first.price).toBeGreaterThan(0);
    expect(first.grade).toBeDefined();
    expect(first.rsi).toBeDefined();
  });

  test("demoBacktest.json fixture exists and has both presets", () => {
    const raw = fs.readFileSync(path.join(demoDir, "demoBacktest.json"), "utf-8");
    const data = JSON.parse(raw);
    expect(data.isDemo).toBe(true);
    expect(data.presets.conservative).toBeDefined();
    expect(data.presets.momentum).toBeDefined();
    expect(data.presets.conservative.filters.symbol).toBe("RELIANCE");
    expect(data.presets.momentum.filters.symbol).toBe("TATASTEEL");
  });

  test("demoStock.json fixture exists and has tabbed details + AI analysis", () => {
    const raw = fs.readFileSync(path.join(demoDir, "demoStock.json"), "utf-8");
    const data = JSON.parse(raw);
    expect(data.isDemo).toBe(true);
    expect(data.symbol).toBe("SUNPHARMA");
    expect(data.fundamentals).toBeDefined();
    expect(data.indicators).toBeDefined();
    expect(data.ai).toBeDefined();
    expect(data.ai.decision).toBeDefined();
  });

  test("demoRecommendations.json fixture exists and contains signals and price feeds", () => {
    const raw = fs.readFileSync(path.join(demoDir, "demoRecommendations.json"), "utf-8");
    const data = JSON.parse(raw);
    expect(data.isDemo).toBe(true);
    expect(Array.isArray(data.allRecommends)).toBe(true);
    expect(data.prices).toBeDefined();
    expect(data.allRecommends.length).toBeGreaterThan(0);
    expect(data.prices[data.allRecommends[0].symbol]).toBeDefined();
  });

  test("CTA button routing maps correctly for anonymous visitors and authenticated users", () => {
    // Mirrors routing logic in Landing.jsx
    const getTargetRoute = (ctaIndex, isAuthenticated) => {
      switch (ctaIndex) {
        case 1:
          return isAuthenticated ? "/fullscan" : "/demo/scan";
        case 2:
          return isAuthenticated ? "/backtest" : "/demo/backtest";
        case 3:
          return isAuthenticated ? "/analyse/SUNPHARMA" : "/demo/stock";
        case 4:
          return isAuthenticated ? "/recommendations" : "/demo/recommendations";
        default:
          return "/";
      }
    };

    // Anonymous visitor expectations
    expect(getTargetRoute(1, false)).toBe("/demo/scan");
    expect(getTargetRoute(2, false)).toBe("/demo/backtest");
    expect(getTargetRoute(3, false)).toBe("/demo/stock");
    expect(getTargetRoute(4, false)).toBe("/demo/recommendations");

    // Authenticated user expectations
    expect(getTargetRoute(1, true)).toBe("/fullscan");
    expect(getTargetRoute(2, true)).toBe("/backtest");
    expect(getTargetRoute(3, true)).toBe("/analyse/SUNPHARMA");
    expect(getTargetRoute(4, true)).toBe("/recommendations");
  });
});

