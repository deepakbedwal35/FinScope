// server/tests/unit/demo_routes.test.js
const request = require("supertest");
const app = require("../../src/app");

describe("Public Demo Routes API (/api/demo/*)", () => {
  test("GET /api/demo/scan returns snapshot data with isDemo: true and no auth required", async () => {
    const res = await request(app).get("/api/demo/scan");
    expect(res.status).toBe(200);
    expect(res.body.isDemo).toBe(true);
    expect(res.body.demoAsOf).toBe("2026-10-09");
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0]).toHaveProperty("symbol");
    expect(res.body.results[0]).toHaveProperty("price");
  });

  test("GET /api/demo/backtest returns presets with isDemo: true and no auth required", async () => {
    const res = await request(app).get("/api/demo/backtest");
    expect(res.status).toBe(200);
    expect(res.body.isDemo).toBe(true);
    expect(res.body.presets).toBeDefined();
    expect(res.body.presets.conservative).toBeDefined();
    expect(res.body.presets.momentum).toBeDefined();
    expect(res.body.presets.conservative.filters.symbol).toBe("RELIANCE");
    expect(res.body.presets.conservative.metrics.win_rate).toBe(68.2);
  });

  test("GET /api/demo/stock returns SUNPHARMA fixture with isDemo: true and no auth required", async () => {
    const res = await request(app).get("/api/demo/stock");
    expect(res.status).toBe(200);
    expect(res.body.isDemo).toBe(true);
    expect(res.body.symbol).toBe("SUNPHARMA");
    expect(res.body.indicators).toBeDefined();
    expect(res.body.ai).toBeDefined();
    expect(res.body.ai.decision).toBeDefined();
  });

  test("GET /api/demo/recommendations returns recommendations and prices with isDemo: true", async () => {
    const res = await request(app).get("/api/demo/recommendations");
    expect(res.status).toBe(200);
    expect(res.body.isDemo).toBe(true);
    expect(Array.isArray(res.body.allRecommends)).toBe(true);
    expect(res.body.prices).toBeDefined();
    expect(res.body.prices.GLAND).toBeDefined();
    expect(res.body.prices.AUROPHARMA).toBeDefined();
  });
});
