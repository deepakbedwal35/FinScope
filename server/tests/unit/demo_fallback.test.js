// server/tests/unit/demo_fallback.test.js
//
// Tests for demo full scan fallback and MongoDB safety guarantees:
// - Verifies demo loader correctly marks fixture data with isDemo: true.
// - Verifies addRecommendations aborts DB persistence when isDemo is true (Mongo safety).
// - Verifies addRecommendations persists only when data is real (isDemo is false).

const { loadDemoFullScan, DEMO_DATE } = require("../../src/utils/demoLoader");
const Recommendations = require("../../src/models/Recommendations");
const scanner = require("../../src/services/scannerService");
const { addRecommendations } = require("../../src/controller/recommendations");

jest.mock("../../src/models/Recommendations");
jest.mock("../../src/services/scannerService");

describe("Demo Fallback & Safety Guarantees", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loadDemoFullScan attaches isDemo: true and demoAsOf date", () => {
    // Arrange & Act: Load fixture
    const data = loadDemoFullScan();

    // Assert: Check demo metadata and stock results
    // Catch bug: Missing isDemo flag or corrupted fixture loading
    expect(data.isDemo).toBe(true);
    expect(data.demoAsOf).toBe(DEMO_DATE);
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.results[0]).toHaveProperty("symbol");
    expect(data.results[0]).toHaveProperty("price");
  });

  test("addRecommendations never writes to MongoDB when scanner returns demo data", async () => {
    // Arrange: Scanner returns demo data with isDemo: true
    scanner.finRecommends.mockResolvedValue({
      success: true,
      isDemo: true,
      demoAsOf: DEMO_DATE,
      recommendations: [
        { symbol: "DEMO_STOCK", entry: { entry: 100, sl: 90, t1: 110, t2: 120, confidence: 80 } },
      ],
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Act: Call addRecommendations
    await addRecommendations(req, res);

    // Assert: Responded with count 0, isDemo: true, and Mongo findOneAndUpdate was NEVER called
    // Catch bug: Demo picks polluting user recommendations in MongoDB
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: 0,
        isDemo: true,
      })
    );
    expect(Recommendations.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("addRecommendations writes to MongoDB when scanner returns real data", async () => {
    // Arrange: Scanner returns real recommendations with isDemo: false
    scanner.finRecommends.mockResolvedValue({
      success: true,
      isDemo: false,
      recommendations: [
        { symbol: "TCS", entry: { entry: 3800, sl: 3600, t1: 4000, t2: 4100, confidence: 90 } },
      ],
    });

    // Mock findOneAndUpdate returning null (meaning freshly inserted)
    Recommendations.findOneAndUpdate.mockResolvedValue(null);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Act: Call addRecommendations
    await addRecommendations(req, res);

    // Assert: Mongo findOneAndUpdate WAS called and count is 1
    // Catch bug: Breaking real scan persistence while implementing demo safety
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, count: 1 });
    expect(Recommendations.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(Recommendations.findOneAndUpdate).toHaveBeenCalledWith(
      { symbol: "TCS" },
      expect.any(Object),
      { upsert: true, new: false }
    );
  });
});

