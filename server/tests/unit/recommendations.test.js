// server/tests/unit/recommendations.test.js
const { evaluateRecommendationUpdate } = require("../../src/controller/recommendations");

describe("Recommendation State Machine - evaluateRecommendationUpdate", () => {
  // Test 1: Stop loss execution
  test("test_stop_loss_hit_closes_position_and_sets_exit_price", () => {
    // Checks that a price drop at or below the stop loss triggers an immediate exit,
    // catching bugs where a losing trade remains open.

    // Arrange: Stock with entry=100, SL=95, T1=110, T2=120
    const stock = {
      _id: "rec123",
      symbol: "INFY",
      entryPrice: 100,
      stopLoss: 95,
      target1: 110,
      target2: 120,
      isOpen: true,
      target1Hit: false,
      target2Hit: false,
    };
    const currentPrice = 94.5; // Price breached below SL (95)

    // Act
    const update = evaluateRecommendationUpdate(stock, currentPrice);

    // Assert
    expect(update.stopLossHit).toBe(true);
    expect(update.isOpen).toBe(false);
    expect(update.exitPrice).toBe(95);
  });

  // Test 2: Target 1 hit
  test("test_target_1_hit_marks_target1Hit_flag", () => {
    // Checks that reaching Target 1 flags target1Hit without closing the trade yet,
    // catching bugs where early targets prematurely close the entire position.

    // Arrange: Stock price crosses Target 1 (110)
    const stock = {
      _id: "rec124",
      symbol: "TCS",
      stopLoss: 95,
      target1: 110,
      target2: 120,
      isOpen: true,
      target1Hit: false,
      target2Hit: false,
    };
    const currentPrice = 112;

    // Act
    const update = evaluateRecommendationUpdate(stock, currentPrice);

    // Assert
    expect(update.target1Hit).toBe(true);
    expect(update.isOpen).toBeUndefined(); // Still open to let runner run to T2
  });

  // Test 3: Pullback to Target 1 locks profit
  test("test_pullback_to_target1_after_hit_closes_trade_at_target1", () => {
    // Checks that if price reached T1 earlier and pulls back to or below T1, it locks in profit at T1,
    // catching bugs where a winning trade roundtrips back into a loss.

    // Arrange: Stock had previously hit T1, now pulls back to 109.5 (<= 110)
    const stock = {
      _id: "rec125",
      symbol: "RELIANCE",
      stopLoss: 95,
      target1: 110,
      target2: 120,
      isOpen: true,
      target1Hit: true, // Already hit T1 previously
      target2Hit: false,
    };
    const currentPrice = 109.5;

    // Act
    const update = evaluateRecommendationUpdate(stock, currentPrice);

    // Assert
    expect(update.isOpen).toBe(false);
    expect(update.exitPrice).toBe(110);
  });

  // Test 4: Target 2 hit closes position at target 2 price
  test("test_target_2_hit_closes_position_at_target2_price", () => {
    // Checks that hitting the maximum target (T2) exits the trade and sets numeric exitPrice,
    // catching a regression where a boolean flag was previously stored as the exitPrice.

    // Arrange: Stock reaches Target 2 (120)
    const stock = {
      _id: "rec126",
      symbol: "HDFCBANK",
      stopLoss: 95,
      target1: 110,
      target2: 120,
      isOpen: true,
      target1Hit: true,
      target2Hit: false,
    };
    const currentPrice = 121;

    // Act
    const update = evaluateRecommendationUpdate(stock, currentPrice);

    // Assert
    expect(update.target2Hit).toBe(true);
    expect(update.isOpen).toBe(false);
    expect(update.exitPrice).toBe(120); // Must be numeric 120, not boolean true
  });

  // Test 5: Normal price movement between SL and T1
  test("test_price_between_sl_and_t1_produces_no_state_change", () => {
    // Checks that routine price fluctuations between SL and T1 generate no unnecessary DB updates,
    // catching bugs where non-trigger prices cause empty or invalid database writes.

    // Arrange: Price is 102 (between SL 95 and T1 110)
    const stock = {
      _id: "rec127",
      symbol: "SBIN",
      stopLoss: 95,
      target1: 110,
      target2: 120,
      isOpen: true,
      target1Hit: false,
      target2Hit: false,
    };
    const currentPrice = 102;

    // Act
    const update = evaluateRecommendationUpdate(stock, currentPrice);

    // Assert
    expect(Object.keys(update).length).toBe(0);
  });
});

