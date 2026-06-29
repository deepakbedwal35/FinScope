"""
indicators.py
=============
Feature Engineering:
  - RSI   (Relative Strength Index)
  - MACD  (Moving Average Convergence/Divergence)
  - Bollinger Bands
  - Moving Averages (SMA 20/50/200, EMA 9/21)
  - ATR   (Average True Range) for volatility / stop loss sizing
  - Volume MA + Volume Ratio
  - Distance from Mean (price vs MA200)
"""

import pandas as pd
import numpy as np
import ta



# ─────────────────────────────────────────────────────────────────────────────
# 1. MOVING AVERAGES
# ─────────────────────────────────────────────────────────────────────────────



def add_moving_averages(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add SMA and EMA columns.
    SMA 20/50/200 → trend identification (Chapter 9 logic)
    EMA 9/21     → faster signals for entry timing
    """
    df["SMA_20"]  = df["Close"].rolling(20).mean()
    df["SMA_50"]  = df["Close"].rolling(50).mean()
    df["SMA_200"] = df["Close"].rolling(200).mean()
    df["EMA_9"]   = df["Close"].ewm(span=9,  adjust=False).mean()
    df["EMA_21"]  = df["Close"].ewm(span=21, adjust=False).mean()
    return df


def distance_from_mean(df: pd.DataFrame) -> pd.Series:
    """
    Volatility Tuning: How far is the current price from its 200-day MA?
    Expressed as a percentage.
    > +10%  → overextended (risky entry)
    < -10%  → deep discount (potential mean reversion)
    """
    return ((df["Close"] - df["SMA_200"]) / df["SMA_200"] * 100).round(2)


# ─────────────────────────────────────────────────────────────────────────────
# 2. RSI — Relative Strength Index (Chapter 10)
# ─────────────────────────────────────────────────────────────────────────────

def add_rsi(df: pd.DataFrame, window: int = 14) -> pd.DataFrame:
    """
    RSI measures momentum. Range 0–100.
    > 70  → Overbought (potential sell)
    < 30  → Oversold   (potential buy)
    50    → Trend neutral level

    Divergence logic also added:
      Bullish divergence: price makes lower low but RSI makes higher low → reversal up
      Bearish divergence: price makes higher high but RSI makes lower high → reversal down
    """
    rsi_ind      = ta.momentum.RSIIndicator(df["Close"], window=window)
    df["RSI"]    = rsi_ind.rsi()

    # RSI signal interpretation
    df["RSI_signal"] = "NEUTRAL"
    df.loc[df["RSI"] > 70, "RSI_signal"] = "OVERBOUGHT"
    df.loc[df["RSI"] < 30, "RSI_signal"] = "OVERSOLD"
    df.loc[(df["RSI"] >= 50) & (df["RSI"] <= 70), "RSI_signal"] = "BULLISH"
    df.loc[(df["RSI"] >= 30) & (df["RSI"] < 50),  "RSI_signal"] = "BEARISH"

    return df


def check_rsi_divergence(df: pd.DataFrame, lookback: int = 20) -> str:
    """
    Check last `lookback` bars for RSI divergence.
    Returns: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'NONE'
    """
    recent = df.tail(lookback).copy()
    if recent["RSI"].isna().all():
        return "NONE"

    prices = recent["Close"].values
    rsis   = recent["RSI"].values

    # Find local lows and highs
    price_low_idx  = np.argmin(prices)
    price_high_idx = np.argmax(prices)

    if price_low_idx > 0:
        prev_price_low = prices[:price_low_idx].min()
        curr_price_low = prices[price_low_idx]
        prev_rsi_low   = rsis[:price_low_idx].min()
        curr_rsi_low   = rsis[price_low_idx]
        # Price: lower low, RSI: higher low → Bullish divergence
        if curr_price_low < prev_price_low and curr_rsi_low > prev_rsi_low:
            return "BULLISH_DIVERGENCE"

    if price_high_idx > 0:
        prev_price_high = prices[:price_high_idx].max()
        curr_price_high = prices[price_high_idx]
        prev_rsi_high   = rsis[:price_high_idx].max()
        curr_rsi_high   = rsis[price_high_idx]
        # Price: higher high, RSI: lower high → Bearish divergence
        if curr_price_high > prev_price_high and curr_rsi_high < prev_rsi_high:
            return "BEARISH_DIVERGENCE"

    return "NONE"


# ─────────────────────────────────────────────────────────────────────────────
# 3. MACD — Moving Average Convergence/Divergence (Chapter 10)
# ─────────────────────────────────────────────────────────────────────────────

def add_macd(df: pd.DataFrame,
             fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
    """
    MACD = EMA(12) - EMA(26)
    Signal Line = EMA(9) of MACD
    Histogram   = MACD - Signal

    Key signals:
      MACD crosses above signal line → BUY
      MACD crosses below signal line → SELL
      Histogram expanding upward     → strengthening uptrend
      Zero line crossover            → trend change confirmation
    """
    macd_ind           = ta.trend.MACD(df["Close"], window_fast=fast,
                                        window_slow=slow, window_sign=signal)
    df["MACD"]         = macd_ind.macd()
    df["MACD_signal"]  = macd_ind.macd_signal()
    df["MACD_hist"]    = macd_ind.macd_diff()

    # MACD crossover detection
    df["MACD_cross"] = "NONE"
    for i in range(1, len(df)):
        prev_diff = df["MACD"].iloc[i-1] - df["MACD_signal"].iloc[i-1]
        curr_diff = df["MACD"].iloc[i]   - df["MACD_signal"].iloc[i]
        if pd.isna(prev_diff) or pd.isna(curr_diff):
            continue
        if prev_diff < 0 and curr_diff >= 0:
            df.iloc[i, df.columns.get_loc("MACD_cross")] = "BULLISH_CROSS"
        elif prev_diff > 0 and curr_diff <= 0:
            df.iloc[i, df.columns.get_loc("MACD_cross")] = "BEARISH_CROSS"

    return df


def get_macd_signal(df: pd.DataFrame) -> dict:
    """
    Return latest MACD reading as a dict for UI display.
    """
    latest = df.iloc[-1]
    macd_val    = latest.get("MACD", None)
    signal_val  = latest.get("MACD_signal", None)
    hist_val    = latest.get("MACD_hist", None)
    cross       = latest.get("MACD_cross", "NONE")

    if pd.isna(macd_val):
        return {"signal": "N/A", "color": "#aaaaaa", "description": "Not enough data"}

    above_zero = macd_val > 0
    above_sig  = macd_val > signal_val if not pd.isna(signal_val) else False

    if above_zero and above_sig:
        sig, color = "BULLISH", "#3dd68c"
        desc = "MACD above zero + signal — upward momentum"
    elif above_zero and not above_sig:
        sig, color = "WEAKENING", "#f5a623"
        desc = "MACD above zero but below signal — momentum slowing"
    elif not above_zero and not above_sig:
        sig, color = "BEARISH", "#f75f5f"
        desc = "MACD below zero and signal — downward momentum"
    else:
        sig, color = "RECOVERING", "#7c6af7"
        desc = "MACD below zero but above signal — possible recovery"

    if cross == "BULLISH_CROSS":
        sig, color = "BUY SIGNAL", "#3dd68c"
        desc = "🚀 Fresh MACD bullish crossover — strong buy signal"
    elif cross == "BEARISH_CROSS":
        sig, color = "SELL SIGNAL", "#f75f5f"
        desc = "⚠️ Fresh MACD bearish crossover — exit / sell signal"

    return {
        "signal":      sig,
        "color":       color,
        "description": desc,
        "macd":        float(round(macd_val, 3)) if not pd.isna(macd_val) else None,
        "signal_line": float(round(signal_val, 3)) if not pd.isna(signal_val) else None,
        "histogram":   float(round(hist_val, 3)) if not pd.isna(hist_val) else None,
        "cross":       cross,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. BOLLINGER BANDS (Chapter 9)
# ─────────────────────────────────────────────────────────────────────────────

def add_bollinger_bands(df: pd.DataFrame,
                         window: int = 20, std: float = 2.0) -> pd.DataFrame:
    """
    Bollinger Bands = SMA(20) ± 2 * StdDev
    Band width tells you volatility — narrow bands = squeeze = breakout coming

    Key signals:
      Price touches upper band  → overbought short term
      Price touches lower band  → oversold short term
      Squeeze (narrow bands)    → explosive move coming
      %B > 1 → price above upper band (breakout confirmation)
      %B < 0 → price below lower band (breakdown / oversold)
    """
    bb = ta.volatility.BollingerBands(df["Close"], window=window, window_dev=std)
    df["BB_upper"]  = bb.bollinger_hband()
    df["BB_lower"]  = bb.bollinger_lband()
    df["BB_mid"]    = bb.bollinger_mavg()
    df["BB_width"]  = (df["BB_upper"] - df["BB_lower"]) / df["BB_mid"] * 100  # % width
    df["BB_pct"]    = bb.bollinger_pband()   # %B: 0=lower band, 1=upper band

    # Squeeze detector: BB width < 20th percentile of last 120 bars
    width_series = df["BB_width"].rolling(120).quantile(0.20)
    df["BB_squeeze"] = df["BB_width"] < width_series

    return df


def get_bb_signal(df: pd.DataFrame) -> dict:
    """
    Return Bollinger Band signal for the latest bar.
    """
    latest = df.iloc[-1]
    price  = latest["Close"]
    upper  = latest.get("BB_upper")
    lower  = latest.get("BB_lower")
    mid    = latest.get("BB_mid")
    pct_b  = latest.get("BB_pct")
    squeeze = latest.get("BB_squeeze", False)

    if pd.isna(upper):
        return {"signal": "N/A", "color": "#aaaaaa", "description": "Not enough data"}

    band_pos = round(pct_b * 100, 1) if not pd.isna(pct_b) else None

    if squeeze:
        sig, color = "SQUEEZE", "#e06cf5"
        desc = f"⚡ Bollinger Squeeze — explosive move imminent! Band width very narrow."
    elif pct_b > 1.0:
        sig, color = "BREAKOUT", "#3dd68c"
        desc = f"Price above upper band — confirmed breakout / overbought"
    elif pct_b >= 0.8:
        sig, color = "OVERBOUGHT", "#f5a623"
        desc = f"Price near upper band ({band_pos}%B) — momentum strong but stretched"
    elif pct_b < 0.0:
        sig, color = "BREAKDOWN", "#f75f5f"
        desc = f"Price below lower band — bearish breakdown / oversold"
    elif pct_b <= 0.2:
        sig, color = "OVERSOLD", "#7c6af7"
        desc = f"Price near lower band ({band_pos}%B) — potential bounce"
    else:
        sig, color = "NEUTRAL", "#aaaaaa"
        desc = f"Price inside bands ({band_pos}%B) — no extreme reading"

    return {
        "signal":      sig,
        "color":       color,
        "description": desc,
        "upper":       float(round(upper, 2)),
        "lower":       float(round(lower, 2)),
        "mid":         float(round(mid, 2)),
        "pct_b":       band_pos,
        "squeeze":     bool(squeeze),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. ATR — Average True Range (Volatility / Stop Loss)
# ─────────────────────────────────────────────────────────────────────────────

def add_atr(df: pd.DataFrame, window: int = 14) -> pd.DataFrame:
    df["ATR"] = ta.volatility.AverageTrueRange(
        df["High"], df["Low"], df["Close"], window=window
    ).average_true_range()
    df["ATR_pct"] = (df["ATR"] / df["Close"] * 100).round(2)   # ATR as % of price
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 6. VOLUME ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────

def add_volume_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df["Vol_MA20"]  = df["Volume"].rolling(20).mean()
    df["Vol_ratio"] = (df["Volume"] / df["Vol_MA20"]).round(2)

    # On-Balance Volume (OBV) — cumulative volume direction
    df["OBV"] = ta.volume.OnBalanceVolumeIndicator(
        df["Close"], df["Volume"]
    ).on_balance_volume()

    return df


# ─────────────────────────────────────────────────────────────────────────────
# 7. MASTER — ADD ALL INDICATORS AT ONCE
# ─────────────────────────────────────────────────────────────────────────────

def add_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Single call to add every indicator.
    Use this in the main scanner to avoid calling each function separately.
    """
    df = add_moving_averages(df)
    df = add_rsi(df)
    df = add_macd(df)
    df = add_bollinger_bands(df)
    df = add_atr(df)
    df = add_volume_indicators(df)
    df["Dist_from_200MA"] = distance_from_mean(df)
    return df

# helper to convert numpy types to native Python types for JSON serialization




def get_indicator_summary(df: pd.DataFrame) -> dict:
    """
    Return a clean summary of all latest indicator values for the UI.
    """
    df = add_all_indicators(df)
    latest = df.iloc[-1]

    rsi_val = latest.get("RSI")
    summary =  {
        "rsi": {
            "value":   float(round(rsi_val, 1)) if not pd.isna(rsi_val) else None,
            "signal":  latest.get("RSI_signal", "N/A"),
            "divergence": check_rsi_divergence(df),
        },
        "macd":    (get_macd_signal(df)),
        "bb":      (get_bb_signal(df)),
        "ma": {
            "sma_20":  float(round(latest.get("SMA_20"),  2)) if not pd.isna(latest.get("SMA_20"))  else None,
            "sma_50":  float(round(latest.get("SMA_50"),  2)) if not pd.isna(latest.get("SMA_50"))  else None,
            "sma_200": float(round(latest.get("SMA_200"), 2)) if not pd.isna(latest.get("SMA_200")) else None,
            "dist_200ma": float(round(latest.get("Dist_from_200MA"), 2)) if not pd.isna(latest.get("Dist_from_200MA")) else None,
        },
        "atr": {
            "value":   float(round(latest.get("ATR"), 2)) if not pd.isna(latest.get("ATR")) else None,
            "pct":     float(round(latest.get("ATR_pct"), 2)) if not pd.isna(latest.get("ATR_pct")) else None,
        },
        "volume": {
            "ratio":   float(round(latest.get("Vol_ratio"), 2)) if not pd.isna(latest.get("Vol_ratio")) else None,
        },
        
    } 

    return summary , df

def get_indicator_summary_for_backtest(df: pd.DataFrame) -> tuple[dict, pd.DataFrame]:
    """
    Builds indicator df once, returns both summary dict and full indicator_df.
    indicator_df is returned so the backtest loop can reuse it without recomputation.
    """
    indicator_df = add_all_indicators(df)
    latest = indicator_df.iloc[-1]

    rsi_val = latest.get("RSI")
    summary = {
        "rsi": {
            "value":      float(round(rsi_val, 1)) if not pd.isna(rsi_val) else None,
            "signal":     latest.get("RSI_signal", "N/A"),
            "divergence": check_rsi_divergence(indicator_df),
        },
        "macd":   get_macd_signal(indicator_df),
        "bb":     get_bb_signal(indicator_df),
        "ma": {
            "sma_20":     float(round(latest.get("SMA_20"),  2)) if not pd.isna(latest.get("SMA_20"))  else None,
            "sma_50":     float(round(latest.get("SMA_50"),  2)) if not pd.isna(latest.get("SMA_50"))  else None,
            "sma_200":    float(round(latest.get("SMA_200"), 2)) if not pd.isna(latest.get("SMA_200")) else None,
            "dist_200ma": float(round(latest.get("Dist_from_200MA"), 2)) if not pd.isna(latest.get("Dist_from_200MA")) else None,
        },
        "atr": {
            "value": float(round(latest.get("ATR"), 2)) if not pd.isna(latest.get("ATR")) else None,
            "pct":   float(round(latest.get("ATR_pct"), 2)) if not pd.isna(latest.get("ATR_pct")) else None,
        },
        "volume": {
            "ratio": float(round(latest.get("Vol_ratio"), 2)) if not pd.isna(latest.get("Vol_ratio")) else None,
        },
    }
    return summary, indicator_df