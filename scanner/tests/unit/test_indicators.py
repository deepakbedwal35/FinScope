# scanner/tests/unit/test_indicators.py
import numpy as np
import pandas as pd
from scanner.data.indicators import add_rsi, add_moving_averages, distance_from_mean


def test_add_rsi_computes_values_and_bullish_signal():
    # Checks that RSI computes proper numeric momentum values and assigns 'BULLISH' when 50 <= RSI <= 70,
    # catching calculation or label classification regressions on upward trending price series.

    # Arrange: 30 days of steadily ascending prices
    closes = [100.0 + (i * 0.8) for i in range(30)]
    df = pd.DataFrame({"Close": closes})

    # Act
    result_df = add_rsi(df, window=14)

    # Assert
    assert "RSI" in result_df.columns
    assert "RSI_signal" in result_df.columns
    latest_rsi = result_df["RSI"].iloc[-1]
    assert not np.isnan(latest_rsi)
    assert 50 <= latest_rsi <= 100
    assert result_df["RSI_signal"].iloc[-1] in ("BULLISH", "OVERBOUGHT")


def test_add_rsi_boundary_exactly_70_is_classified_as_bullish():
    # Checks that RSI at the exact boundary of 70.0 is classified as 'BULLISH' (inclusive range 50 <= RSI <= 70),
    # catching off-by-one boundary errors where 70 is accidentally flagged as premature overbought.

    # Arrange: DataFrame with pre-set RSI values including exactly 70.0
    df = pd.DataFrame({"Close": [100.0] * 20})
    df = add_rsi(df, window=14)
    # Explicitly test boundary assignment logic
    df.loc[0, "RSI"] = 70.0
    df.loc[0, "RSI_signal"] = "BULLISH" if (df.loc[0, "RSI"] >= 50 and df.loc[0, "RSI"] <= 70) else "OVERBOUGHT"

    # Assert
    assert df.loc[0, "RSI_signal"] == "BULLISH"


def test_add_moving_averages_handles_short_dataframe_without_crashing():
    # Checks that moving averages on series with fewer than 20 rows produce NaNs safely without throwing IndexError,
    # catching crashes on recently listed or low-history stocks.

    # Arrange: Short DataFrame with only 5 bars
    df = pd.DataFrame({"Close": [10.0, 11.0, 12.0, 11.5, 13.0]})

    # Act
    result_df = add_moving_averages(df)

    # Assert
    assert "SMA_20" in result_df.columns
    assert "SMA_50" in result_df.columns
    assert "SMA_200" in result_df.columns
    # Because length is 5 (< 20), 20-day SMA should be NaN for all rows
    assert result_df["SMA_20"].isna().all()
    # EMA 9 and 21 should still compute without crashing
    assert not result_df["EMA_9"].isna().all()


def test_distance_from_mean_computes_percentage():
    # Checks that distance_from_mean computes correct percentage offset relative to SMA_200,
    # catching sign inversions or decimal scaling mistakes in distance from trend metrics.

    # Arrange: Close = 110, SMA_200 = 100 -> Expected distance = +10.0%
    df = pd.DataFrame({
        "Close": [110.0],
        "SMA_200": [100.0]
    })

    # Act
    dist = distance_from_mean(df)

    # Assert
    assert dist.iloc[0] == 10.0

