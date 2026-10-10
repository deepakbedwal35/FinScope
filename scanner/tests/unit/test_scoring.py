# scanner/tests/unit/test_scoring.py
from scanner.strategy.backtest import compute_score


def _create_mock_market_data(rsi=60.0, rsi_div="NONE", primary_trend="UPTREND",
                             pat_found=False, golden_cross=False,
                             reversal_found=False, macd_sig="BULLISH"):
    """Helper to assemble a clean inputs payload for compute_score."""
    ind = {
        "rsi": {"value": rsi, "divergence": rsi_div},
        "macd": {"signal": macd_sig},
        "bb": {"signal": "NEUTRAL"},
    }
    dow = {
        "primary": {"trend": primary_trend},
        "secondary": {"trend": "SIDEWAYS"},
        "minor": {"trend": "SIDEWAYS"},
    }
    pat = {
        "found": pat_found,
        "best": {"direction": "BULLISH"} if pat_found else None,
    }
    cont = {
        "ma_crosses": {"golden_cross": golden_cross, "ma50_above_ma200": False},
        "best": None,
        "trendlines": {"signal": "NONE"},
    }
    candles = {
        "bullish": [],
        "stochastic": {"signal": "NEUTRAL"},
    }
    reversal = {
        "best": {"direction": "BULLISH", "confirmed": True} if reversal_found else None
    }
    return ind, dow, pat, cont, candles, reversal


def test_compute_score_strong_bullish_stock_receives_grade_a():
    # Checks that a confluence of multiple bullish signals produces a high score (>=20) and Grade A/A+,
    # catching bugs where high-conviction setups are misclassified with low grades.

    # Arrange: Setup with 52W high proximity, volume surge, golden cross, RSI in sweet spot, Dow uptrend
    ind, dow, pat, cont, candles, reversal = _create_mock_market_data(
        rsi=62.0, primary_trend="UPTREND", pat_found=True, golden_cross=True, reversal_found=True
    )
    dow["secondary"]["trend"] = "DOWNTREND" # pullback in primary uptrend (+1)
    dow["minor"]["trend"] = "UPTREND"       # minor reversal up (+1)
    dist_52w = -0.5                          # near 52W high (+4)
    vol_ratio = 3.5                          # high volume (+3)

    # Act
    score, strength, grade, gc = compute_score(
        ind, dow, pat, cont, candles, reversal, dist_52w, vol_ratio
    )

    # Assert
    assert score >= 20
    assert strength == "STRONG"
    assert grade in ("A", "A+")
    assert gc in ("#3dd68c", "#00ff88")


def test_compute_score_weak_signals_receives_grade_d_or_f():
    # Checks that stocks with no bullish confirmation and distant 52W prices receive Grade D (5-9 pts) or F (<5 pts),
    # catching bugs where weak or failing setups receive false buy signals.

    # Case A: Minimal signals (score < 5) -> Grade F
    ind, dow, pat, cont, candles, reversal = _create_mock_market_data(
        rsi=32.0, primary_trend="DOWNTREND", macd_sig="BEARISH"
    )
    score_f, strength_f, grade_f, gc_f = compute_score(
        ind, dow, pat, cont, candles, reversal, dist_52w=-35.0, vol_ratio=0.5
    )
    assert score_f < 5
    assert strength_f == "WEAK"
    assert grade_f == "F"
    assert gc_f == "#ff3333"

    # Case B: Slight positive signals (5 <= score < 10) -> Grade D
    ind_d, dow_d, pat_d, cont_d, candles_d, reversal_d = _create_mock_market_data(
        rsi=52.0, primary_trend="UPTREND", macd_sig="BEARISH"
    )
    # primary UPTREND (+2) + dist_52w >= -10.0 (+2) + vol_ratio >= 1.5 (+1) + RSI 52 (+1) = 6 pts
    score_d, strength_d, grade_d, gc_d = compute_score(
        ind_d, dow_d, pat_d, cont_d, candles_d, reversal_d, dist_52w=-8.0, vol_ratio=1.6
    )
    assert 5 <= score_d < 10
    assert grade_d == "D"
    assert gc_d == "#f75f5f"


def test_compute_score_rsi_boundary_conditions():
    # Checks that RSI scores precisely according to defined boundaries:
    # 55-72 (+2 pts), 50-54 (+1 pt), <50 or >72 (+0 pts),
    # catching off-by-one or inverted inequality errors in indicator scoring.

    # Case A: RSI exactly 55 (start of 2-point momentum bracket)
    ind, dow, pat, cont, candles, reversal = _create_mock_market_data(rsi=55.0)
    score_55, _, _, _ = compute_score(ind, dow, pat, cont, candles, reversal, dist_52w=-25.0, vol_ratio=1.0)

    # Case B: RSI exactly 50 (start of 1-point bracket)
    ind, dow, pat, cont, candles, reversal = _create_mock_market_data(rsi=50.0)
    score_50, _, _, _ = compute_score(ind, dow, pat, cont, candles, reversal, dist_52w=-25.0, vol_ratio=1.0)

    # Case C: RSI exactly 73 (outside 55-72 bracket)
    ind, dow, pat, cont, candles, reversal = _create_mock_market_data(rsi=73.0)
    score_73, _, _, _ = compute_score(ind, dow, pat, cont, candles, reversal, dist_52w=-25.0, vol_ratio=1.0)

    # Assert
    # Base non-RSI score from dow primary UPTREND (+2) + macd BULLISH (+2) = 4
    assert score_55 == 6  # 4 base + 2 for RSI 55
    assert score_50 == 5  # 4 base + 1 for RSI 50
    assert score_73 == 4  # 4 base + 0 for RSI 73


def test_compute_score_tolerates_none_rsi_without_crashing():
    # Checks that compute_score tolerates None for RSI without raising TypeError,
    # catching runtime crashes on newly listed IPO stocks where RSI cannot yet be computed.

    # Arrange: RSI is None
    ind, dow, pat, cont, candles, reversal = _create_mock_market_data(rsi=None)
    ind["rsi"]["value"] = None

    # Act
    score, strength, grade, _ = compute_score(
        ind, dow, pat, cont, candles, reversal, dist_52w=-25.0, vol_ratio=1.0
    )

    # Assert: Should evaluate cleanly without raising TypeError
    assert isinstance(score, int)
    assert grade in ("A+", "A", "B", "C", "D", "F")
