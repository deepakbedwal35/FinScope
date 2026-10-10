import pandas as pd
import numpy as np
import yfinance as yf
from datetime import date, timedelta
import time

from scanner.data.nse_symbols import get_symbols
from scanner.data.indicators import get_indicator_summary_for_backtest
from scanner.strategy.backtest import compute_score
from scanner.patterns.dow_theory import full_dow_analysis
from scanner.patterns.patterns import get_pattern_summary
from scanner.patterns.reversal_patterns import get_reversal_summary
from scanner.patterns.continuation_patterns import get_continuation_summary
from scanner.patterns.candlesticks_oscillators import get_candle_oscillator_summary

MODEL_WIN_MFE_PCT = 3.0

STRENGTH_MAP = {"STRONG": 80, "MEDIUM": 55, "WEAK": 30, None: 0}


def extract_direction_confidence(d: dict, prefix: str, best_key: str = "best") -> dict:
    """
    Pulls only direction + confidence from a pattern summary dict's
    best/latest entry. Falls back to a strength->confidence proxy
    for modules (like candles) that don't carry a numeric confidence.
    """
    best = d.get(best_key) if isinstance(d, dict) else None

    if not best or not isinstance(best, dict):
        return {f"{prefix}_direction": "NONE", f"{prefix}_confidence": 0}

    direction = best.get("direction", "NONE")

    if "confidence" in best:
        confidence = best.get("confidence", 0)
    else:
        confidence = STRENGTH_MAP.get(best.get("strength"), 0)

    return {f"{prefix}_direction": direction, f"{prefix}_confidence": confidence}


def fetch(symbol: str, period: str = "2y") -> pd.DataFrame | None:
    bare = symbol.replace(".NS", "").replace(".BO", "")
    if symbol.endswith(".NS"):
        candidates = [symbol, bare + ".BO"]
    elif symbol.endswith(".BO"):
        candidates = [symbol, bare + ".NS"]
    else:
        candidates = [bare + ".NS", bare + ".BO", symbol]
    periods = [period, "1y"] if period == "2y" else [period]
    required_cols = ["Open", "High", "Low", "Close", "Volume"]

    for sym in candidates:
        for per in periods:
            try:
                df = yf.Ticker(sym).history(period=per, auto_adjust=True)
                if df is None or df.empty:
                    continue
                if not all(c in df.columns for c in required_cols):
                    continue
                df = df.dropna(subset=required_cols)
                df = df[(df["Close"] > 0) & (df["Volume"] > 0)]
                df = df[df["High"] >= df["Low"]]
                if len(df) < 60:
                    continue
                df.index = pd.to_datetime(df.index)
                df = df.sort_index()
                df = df[~df.index.duplicated(keep="last")]
                df = df[required_cols].copy()
                return df
            except Exception as e:
                print(f"  ✗ {sym} / {per}: {e}")
                continue
    return None


def fetch_sector(symbol: str) -> str:
    bare = symbol.replace(".NS", "").replace(".BO", "")
    for sym in [bare + ".NS", bare + ".BO"]:
        try:
            info = yf.Ticker(sym).info
            sector = info.get("sector")
            if sector:
                return sector
        except Exception:
            continue
    return "UNKNOWN"


def get_nifty_close(years_back=4):
    nifty = fetch("^NSEI", period=f"{years_back+1}y")
    if nifty is not None and nifty.index.tz is not None:
        nifty.index = nifty.index.tz_localize(None)
    return nifty["Close"] if nifty is not None else None


def nifty_return_over_window(nifty_close, entry_date, held_days):
    if nifty_close is None:
        return 0.0
    try:
        start_price = nifty_close.loc[:entry_date].iloc[-1]
        pos = nifty_close.index.searchsorted(entry_date) + held_days
        pos = min(pos, len(nifty_close) - 1)
        end_price = nifty_close.iloc[pos]
        return round((end_price - start_price) / start_price * 100, 2)
    except Exception:
        return 0.0


def build_ml_dataset(
    sel_cats=[ "NIFTYNext50" , "NIFTYMidcap150" ],
    years_back=4,
    sl_atr_mult=2.0,
    t1_atr_mult=3.0,
    t2_atr_mult=6.0,
    max_hold_days=30,
    out_path="finscope_ml_training_data3.csv",
    checkpoint_every=5,
):
    symbols = get_symbols(sel_cats)
    print(f"Universe size: {len(symbols)} symbols")
    nifty_close = get_nifty_close(years_back)

    all_rows = []

    for idx, symbol in enumerate(symbols):
        print(f"[{idx+1}/{len(symbols)}] {symbol}")
        try:
            period = f"{years_back + 1}y"
            df_full = fetch(symbol, period=period)
            if df_full is None or len(df_full) < 300:
                continue

            if df_full.index.tz is not None:
                df_full.index = df_full.index.tz_localize(None)

            sector = fetch_sector(symbol)

            ind, indicator_df = get_indicator_summary_for_backtest(df_full)
            if indicator_df is None or len(indicator_df) < 300:
                continue

            closes = indicator_df["Close"].values
            highs  = indicator_df["High"].values
            lows   = indicator_df["Low"].values
            n = len(indicator_df)

            today = date.today()
            scan_start = today - timedelta(days=years_back * 365)
            ts_start = pd.Timestamp(scan_start)

            scan_indices = [
                i for i, ts in enumerate(indicator_df.index)
                if ts >= ts_start and i >= 250
            ]
            scan_indices = scan_indices[::5]

            last_trade_i = -20
            for i in scan_indices:
                if i - last_trade_i < 5:
                    continue

                df_slice = indicator_df.iloc[:i + 1]
                row = indicator_df.iloc[i]

                atr_val = row.get("ATR")
                atr_val = float(atr_val) if pd.notna(atr_val) else float(closes[i]) * 0.02

                dow      = full_dow_analysis(df_slice)
                pat      = get_pattern_summary(df_slice)
                reversal = get_reversal_summary(df_slice)
                cont     = get_continuation_summary(df_slice)
                candles  = get_candle_oscillator_summary(df_slice)

                vr_raw = row.get("Vol_ratio", 0.0)
                vr = float(vr_raw) if pd.notna(vr_raw) else 0.0
                w52 = indicator_df["High"].iloc[max(0, i-252):i].max()
                dist_52w = ((closes[i] - w52) / w52 * 100) if w52 > 0 else 0.0

                score, strength, grade, gc = compute_score(
                    ind, dow, pat, cont, candles, reversal, dist_52w, vr)

                entry = float(closes[i])
                sl_init = round(entry - sl_atr_mult * atr_val, 2)
                swing_low = float(lows[max(0, i-10):i].min()) * 0.995
                sl_init = max(sl_init, swing_low)
                sl_init = min(sl_init, entry * 0.985)
                sl_init = max(sl_init, entry * 0.92)

                risk = max(entry - sl_init, entry * 0.005)
                t1 = round(entry + t1_atr_mult * risk, 2)
                t2 = round(entry + t2_atr_mult * risk, 2)
                entry_date = indicator_df.index[i]
                end_i = min(i + max_hold_days, n - 1)

                sl = sl_init
                outcome = "TIMEOUT"
                exit_price = float(closes[end_i])
                held = end_i - i
                t1_hit = False
                max_high = entry
                min_low = entry

                for j in range(i + 1, end_i + 1):
                    lo, hi = float(lows[j]), float(highs[j])
                    days_held = j - i
                    if hi > max_high: max_high = hi
                    if lo < min_low: min_low = lo
                    if lo <= sl:
                        outcome, exit_price, held = "SL_HIT", sl, days_held
                        break
                    if hi >= t2:
                        outcome, exit_price, held, t1_hit = "T2_HIT", t2, days_held, True
                        break
                    if hi >= t1 and not t1_hit:
                        t1_hit, outcome = True, "T1_HIT"

                if outcome == "TIMEOUT" and t1_hit:
                    outcome, exit_price = "T1_HIT", t1

                mfe_pct_running = (max_high - entry) / entry * 100
                if outcome == "TIMEOUT" and mfe_pct_running >= 3.0:
                    outcome = "PARTIAL_RALLY"

                ret_pct = round((exit_price - entry) / entry * 100, 2)
                mfe_pct = round((max_high - entry) / entry * 100, 2)
                mae_pct = round((min_low - entry) / entry * 100, 2)

                trade_win = outcome in ("T1_HIT", "T2_HIT") or (outcome == "PARTIAL_RALLY" and ret_pct > 0)
                model_win = mfe_pct >= MODEL_WIN_MFE_PCT

                rel_return = ret_pct - nifty_return_over_window(nifty_close, entry_date, held)

                indicator_feats = row.drop(
                    labels=[c for c in ["Open", "High", "Low", "Close", "Volume"] if c in row.index],
                    errors="ignore"
                ).to_dict()

                # pattern / reversal / continuation / candle — direction + confidence only
                pattern_feats  = extract_direction_confidence(pat,      "pat")
                reversal_feats = extract_direction_confidence(reversal, "rev")
                cont_feats     = extract_direction_confidence(cont,     "cont")
                candle_feats   = extract_direction_confidence(candles,  "candle", best_key="latest")

                all_rows.append({
                    "date": str(entry_date)[:10],
                    "symbol": symbol.replace(".NS", "").replace(".BO", ""),
                    "sector": sector,
                    "entry": round(entry, 2),
                    "sl": sl_init,
                    "t1": t1,
                    "t2": t2,
                    "exit_price": round(exit_price, 2),
                    "outcome": outcome,
                    "return_pct": ret_pct,
                    "rel_return_pct": round(rel_return, 2),
                    "held_days": held,
                    "score": score,
                    "grade": grade,
                    "mfe_pct": mfe_pct,
                    "mae_pct": mae_pct,
                    "model_win": model_win,
                    "trade_win": trade_win,
                    "dow_signal": dow.get("signal"),
                    "strength": strength,
                    **indicator_feats,
                    **pattern_feats,
                    **reversal_feats,
                    **cont_feats,
                    **candle_feats,
                })
                last_trade_i = i

            time.sleep(0.3)

            if (idx + 1) % checkpoint_every == 0:
                pd.DataFrame(all_rows).to_csv(out_path, index=False)
                print(f"  checkpoint saved: {len(all_rows)} rows so far")

        except Exception as e:
            print(f"  ✗ {symbol}: {e}")
            continue

    df_out = pd.DataFrame(all_rows).sort_values("date")
    df_out.to_csv(out_path, index=False)
    print(f"Done. Saved {len(df_out)} rows to {out_path}")
    return df_out


if __name__ == "__main__":
    build_ml_dataset()