# scanner/tests/unit/test_risk_engine.py
import pandas as pd
from scanner.strategy.entry_engine import compute_stop_loss, compute_targets


def test_compute_stop_loss_within_acceptable_risk_range():
    # Checks that computed stop loss is positioned between 1% and 8% below entry price,
    # catching calculation errors where stop loss is inverted (above entry) or dangerously wide.

    # Arrange: 20-bar DataFrame with normal ATR and swing lows
    df = pd.DataFrame({
        "Close": [100.0] * 20,
        "Low": [96.0] * 20,
        "High": [104.0] * 20,
        "ATR": [2.0] * 20,
    })
    entry_price = 100.0

    # Act
    sl_result = compute_stop_loss(df, entry=entry_price)

    # Assert
    sl_price = sl_result["sl"]
    assert sl_price < entry_price
    # Must be within 1% to 8% below entry
    assert entry_price * 0.92 <= sl_price <= entry_price * 0.99
    assert "method" in sl_result


def test_compute_targets_preserves_reward_to_risk_hierarchy():
    # Checks that Target 1 < Target 2 < Target 3 and all targets exceed entry price,
    # catching logic bugs where targets are inverted or generate negative reward ratios.

    # Arrange: Entry at 100, Stop Loss at 95 (Risk = 5)
    df = pd.DataFrame({
        "Close": [100.0] * 20,
        "ATR": [2.0] * 20,
    })
    entry = 100.0
    sl = 95.0

    # Act
    targets = compute_targets(df, entry=entry, sl=sl)

    # Assert
    assert targets["t1"] > entry
    assert targets["t2"] > targets["t1"]
    assert targets["t3"] > targets["t2"]
    assert targets["risk"] == 5.0

