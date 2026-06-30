// server/src/services/scannerService.js

const axios = require("axios");

// Check if the Node server is live on Render or running locally
const isProduction = process.env.NODE_ENV === "production";

// Use your live FastAPI link in production, fallback to local host for offline development
const BASE_URL = isProduction 
  ? "https://finscope-scanner.onrender.com" 
  : "http://127.0.0.1:8000";

// Create an isolated axios instance for your Python microservice requests
const pythonApi = axios.create({
  baseURL: BASE_URL,
});

module.exports = { pythonApi, BASE_URL };


// ✅ Get all signals
async function getSignals() {
  const res = await axios.get(`${BASE_URL}/scan`);
  return res.data;
}

//  Get one stock
async function getSignalForStock(symbol) {
  const res = await axios.get(`${BASE_URL}/analyze/${symbol}`);
  return res.data;
}

async function getFundamentals(symbol){
  const res = await axios.get(`${BASE_URL}/fundamentals/${symbol}`);
  return res.data;

}

// async function getFundamentals(symbol){
//   const res = {
//   "company_info": {
//     "name": "Coal India Limited",
//     "sector": "Energy",
//     "industry": "Thermal Coal",
//     "employees": 220272,
//     "website": "https://www.coalindia.in",
//     "description": "Coal India Limited, together with its subsidiaries, produces and sells coal and coal products in India. The company offers coking coal for steel making and metallurgical industries, as well as for hard coke manufacturing; semi coking coal for blend-able coal in steel making, merchant coke manufacturing, and other metallurgical industries; and non-coking coal for thermal grade coal for cement, fert...",
//     "exchange": "NSI",
//     "currency": "INR"
//   },
//   "key_ratios": {
//     "market_cap": "₹2.88L Cr",
//     "market_cap_raw": 2877994303488,
//     "pe_ratio": 9.64,
//     "forward_pe": 8.28,
//     "pb_ratio": 2.73,
//     "ps_ratio": 2.22,
//     "roe": 0,
//     "roa": 0,
//     "profit_margin": 23,
//     "operating_margin": 23.1,
//     "debt_to_equity": 12.98,
//     "current_ratio": null,
//     "quick_ratio": null,
//     "beta": -0.04,
//     "52w_high": 476,
//     "52w_low": 368.65,
//     "dividend_yield": 486,
//     "payout_ratio": 54.7,
//     "eps_ttm": 48.46,
//     "book_value": 171.08,
//     "revenue_ttm": "₹1.30L Cr",
//     "net_income_ttm": "₹299 Cr",
//     "free_cash_flow": "—",
//     "enterprise_value": "₹2.57L Cr"
//   },
//   "quarterly": [
//     {
//       "period": "2025-12",
//       "revenue": 308181700000,
//       "revenue_str": "₹308 Cr",
//       "profit": 71574500000,
//       "profit_str": "₹72 Cr",
//       "ebitda": 97933400000,
//       "ebitda_str": "₹98 Cr",
//       "margin_pct": 23.2,
//       "rev_chg": null,
//       "prof_chg": null,
//       "profit_color": "#3dd68c",
//       "rev_chg_color": "#aaaaaa",
//       "prof_chg_color": "#aaaaaa",
//       "rev_arrow": "—",
//       "prof_arrow": "—",
//       "is_profit": true
//     },
//     {
//       "period": "2025-06",
//       "revenue": 318804300000,
//       "revenue_str": "₹319 Cr",
//       "profit": 87433800000,
//       "profit_str": "₹87 Cr",
//       "ebitda": 119742600000,
//       "ebitda_str": "₹120 Cr",
//       "margin_pct": 27.4,
//       "rev_chg": 3.4,
//       "prof_chg": 22.2,
//       "profit_color": "#3dd68c",
//       "rev_chg_color": "#3dd68c",
//       "prof_chg_color": "#3dd68c",
//       "rev_arrow": "▲ +3.4%",
//       "prof_arrow": "▲ +22.2%",
//       "is_profit": true
//     },
//     {
//       "period": "2025-03",
//       "revenue": 314684600000,
//       "revenue_str": "₹315 Cr",
//       "profit": 96040200000,
//       "profit_str": "₹96 Cr",
//       "ebitda": 128891500000,
//       "ebitda_str": "₹129 Cr",
//       "margin_pct": 30.5,
//       "rev_chg": -1.3,
//       "prof_chg": 9.8,
//       "profit_color": "#3dd68c",
//       "rev_chg_color": "#f75f5f",
//       "prof_chg_color": "#3dd68c",
//       "rev_arrow": "▼ -1.3%",
//       "prof_arrow": "▲ +9.8%",
//       "is_profit": true
//     },
//     {
//       "period": "2024-12",
//       "revenue": 323589800000,
//       "revenue_str": "₹324 Cr",
//       "profit": 85055700000,
//       "profit_str": "₹85 Cr",
//       "ebitda": 120179600000,
//       "ebitda_str": "₹120 Cr",
//       "margin_pct": 26.3,
//       "rev_chg": 2.8,
//       "prof_chg": -11.4,
//       "profit_color": "#3dd68c",
//       "rev_chg_color": "#3dd68c",
//       "prof_chg_color": "#f75f5f",
//       "rev_arrow": "▲ +2.8%",
//       "prof_arrow": "▼ -11.4%",
//       "is_profit": true
//     }
//   ],
//   "annual": [
//     {
//       "year": "2025",
//       "revenue": 1242688700000,
//       "revenue_str": "₹1.24L Cr",
//       "profit": 353581600000,
//       "profit_str": "₹354 Cr",
//       "ebitda": 567853800000,
//       "ebitda_str": "₹568 Cr",
//       "margin_pct": 28.5,
//       "rev_growth": null,
//       "prof_growth": null,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#aaaaaa",
//       "pro_g_color": "#aaaaaa",
//       "rev_arrow": "—",
//       "prof_arrow": "—",
//       "is_profit": true
//     },
//     {
//       "year": "2024",
//       "revenue": 1270744100000,
//       "revenue_str": "₹1.27L Cr",
//       "profit": 374022900000,
//       "profit_str": "₹374 Cr",
//       "ebitda": 562920200000,
//       "ebitda_str": "₹563 Cr",
//       "margin_pct": 29.4,
//       "rev_growth": 2.3,
//       "prof_growth": 5.8,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#3dd68c",
//       "pro_g_color": "#3dd68c",
//       "rev_arrow": "▲ +2.3%",
//       "prof_arrow": "▲ +5.8%",
//       "is_profit": true
//     },
//     {
//       "year": "2023",
//       "revenue": 1274290300000,
//       "revenue_str": "₹1.27L Cr",
//       "profit": 317632300000,
//       "profit_str": "₹318 Cr",
//       "ebitda": 506874400000,
//       "ebitda_str": "₹507 Cr",
//       "margin_pct": 24.9,
//       "rev_growth": 0.3,
//       "prof_growth": -15.1,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#3dd68c",
//       "pro_g_color": "#f75f5f",
//       "rev_arrow": "▲ +0.3%",
//       "prof_arrow": "▼ -15.1%",
//       "is_profit": true
//     },
//     {
//       "year": "2022",
//       "revenue": 1005625700000,
//       "revenue_str": "₹1.01L Cr",
//       "profit": 173581000000,
//       "profit_str": "₹174 Cr",
//       "ebitda": 285864400000,
//       "ebitda_str": "₹286 Cr",
//       "margin_pct": 17.3,
//       "rev_growth": -21.1,
//       "prof_growth": -45.4,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#f75f5f",
//       "pro_g_color": "#f75f5f",
//       "rev_arrow": "▼ -21.1%",
//       "prof_arrow": "▼ -45.4%",
//       "is_profit": true
//     }
//   ],
//   "dividends": [
//     {
//       "date": "18 Feb 2026",
//       "amount": 5.5,
//       "amount_str": "₹5.5/share",
//       "year": "2026"
//     },
//     {
//       "date": "04 Nov 2025",
//       "amount": 10.25,
//       "amount_str": "₹10.25/share",
//       "year": "2025"
//     },
//     {
//       "date": "21 Aug 2025",
//       "amount": 5.15,
//       "amount_str": "₹5.15/share",
//       "year": "2025"
//     },
//     {
//       "date": "06 Aug 2025",
//       "amount": 5.5,
//       "amount_str": "₹5.5/share",
//       "year": "2025"
//     },
//     {
//       "date": "31 Jan 2025",
//       "amount": 5.6,
//       "amount_str": "₹5.6/share",
//       "year": "2025"
//     },
//     {
//       "date": "05 Nov 2024",
//       "amount": 15.75,
//       "amount_str": "₹15.75/share",
//       "year": "2024"
//     },
//     {
//       "date": "16 Aug 2024",
//       "amount": 5,
//       "amount_str": "₹5.0/share",
//       "year": "2024"
//     },
//     {
//       "date": "20 Feb 2024",
//       "amount": 5.25,
//       "amount_str": "₹5.25/share",
//       "year": "2024"
//     }
//   ],
//   "error": null
// }
//   return res;

// }

// async function getSignalForStock(symbol) {
//   const res = [
//   {
//     "symbol": "COALINDIA",
//     "price": 469.95001220703125,
//     "change": 3.86,
//     "w52h": 476,
//     "dist_52w": -1.27,
//     "vol_ratio": 1.31,
//     "rsi": 64.2,
//     "score": 18,
//     "strength": "STRONG",
//     "grade": "B",
//     "grade_color": "#7c6af7",
//     "sl": 452,
//     "t1": 493.89,
//     "t2": 511.85,
//     "dow": {
//       "primary": {
//         "trend": "UPTREND",
//         "description": "Primary Uptrend (Bullish Tide) — Trade LONG only",
//         "color": "#3dd68c",
//         "emoji": "🌊⬆️",
//         "swing_highs": [
//           {
//             "Date": "2024-06-03",
//             "price": 463.69805006590485,
//             "type": "high"
//           },
//           {
//             "Date": "2024-08-26",
//             "price": 482.67918705695047,
//             "type": "high"
//           },
//           {
//             "Date": "2025-02-01",
//             "price": 373.21139858875705,
//             "type": "high"
//           },
//           {
//             "Date": "2025-03-24",
//             "price": 384.7501512099048,
//             "type": "high"
//           },
//           {
//             "Date": "2025-05-20",
//             "price": 389.8421727498297,
//             "type": "high"
//           },
//           {
//             "Date": "2025-09-17",
//             "price": 386.72104392948097,
//             "type": "high"
//           },
//           {
//             "Date": "2025-11-17",
//             "price": 384.1220958605136,
//             "type": "high"
//           },
//           {
//             "Date": "2026-01-29",
//             "price": 455.5280865896013,
//             "type": "high"
//           },
//           {
//             "Date": "2026-03-13",
//             "price": 476,
//             "type": "high"
//           }
//         ],
//         "swing_lows": [
//           {
//             "Date": "2024-06-04",
//             "price": 361.18149482751323,
//             "type": "low"
//           },
//           {
//             "Date": "2025-01-13",
//             "price": 332.61188247629167,
//             "type": "low"
//           },
//           {
//             "Date": "2025-02-17",
//             "price": 326.3088933314474,
//             "type": "low"
//           },
//           {
//             "Date": "2025-04-07",
//             "price": 332.6154836894661,
//             "type": "low"
//           },
//           {
//             "Date": "2025-08-04",
//             "price": 345.88277906519255,
//             "type": "low"
//           },
//           {
//             "Date": "2025-10-30",
//             "price": 364.4757899723975,
//             "type": "low"
//           },
//           {
//             "Date": "2026-02-16",
//             "price": 401.29506441538587,
//             "type": "low"
//           }
//         ]
//       },
//       "secondary": {
//         "trend": "SIDEWAYS",
//         "description": "Secondary Consolidation",
//         "color": "#f5a623",
//         "emoji": "🌊➡️",
//         "swing_highs": [
//           {
//             "Date": "2025-11-17",
//             "price": 384.1220958605136,
//             "type": "high"
//           },
//           {
//             "Date": "2026-01-29",
//             "price": 455.5280865896013,
//             "type": "high"
//           },
//           {
//             "Date": "2026-03-13",
//             "price": 476,
//             "type": "high"
//           }
//         ],
//         "swing_lows": [
//           {
//             "Date": "2025-10-30",
//             "price": 364.4757899723975,
//             "type": "low"
//           },
//           {
//             "Date": "2025-11-25",
//             "price": 364.7778130762515,
//             "type": "low"
//           },
//           {
//             "Date": "2026-01-21",
//             "price": 406.1804449530734,
//             "type": "low"
//           },
//           {
//             "Date": "2026-02-16",
//             "price": 401.29506441538587,
//             "type": "low"
//           },
//           {
//             "Date": "2026-04-10",
//             "price": 427.5,
//             "type": "low"
//           }
//         ],
//         "retracement_pct": 89.4,
//         "retracement_label": "⚠️ Retracement 89.4% (outside classic zone)"
//       },
//       "minor": {
//         "trend": "SIDEWAYS",
//         "description": "Minor Sideways (Ripple — no clear short-term direction)",
//         "color": "#aaaaaa",
//         "emoji": "〰️➡️",
//         "swing_highs": [
//           {
//             "Date": "2026-03-20",
//             "price": 472.3999938964844,
//             "type": "high"
//           },
//           {
//             "Date": "2026-04-01",
//             "price": 464.8500061035156,
//             "type": "high"
//           },
//           {
//             "Date": "2026-04-08",
//             "price": 464,
//             "type": "high"
//           }
//         ],
//         "swing_lows": [
//           {
//             "Date": "2026-03-18",
//             "price": 449.20001220703125,
//             "type": "low"
//           },
//           {
//             "Date": "2026-03-25",
//             "price": 438.79998779296875,
//             "type": "low"
//           },
//           {
//             "Date": "2026-04-02",
//             "price": 440.5,
//             "type": "low"
//           },
//           {
//             "Date": "2026-04-10",
//             "price": 427.5,
//             "type": "low"
//           },
//           {
//             "Date": "2026-04-17",
//             "price": 430.5,
//             "type": "low"
//           }
//         ]
//       },
//       "signal": "NEUTRAL",
//       "signal_color": "#aaaaaa",
//       "signal_desc": "Mixed signals — observe and wait"
//     },
//     "indicators": {
//       "rsi": {
//         "value": 64.2,
//         "signal": "BULLISH",
//         "divergence": "NONE"
//       },
//       "macd": {
//         "signal": "BULLISH",
//         "color": "#3dd68c",
//         "description": "MACD above zero + signal — upward momentum",
//         "macd": 2.992,
//         "signal_line": 1.109,
//         "histogram": 1.883,
//         "cross": "NONE"
//       },
//       "bb": {
//         "signal": "BREAKOUT",
//         "color": "#3dd68c",
//         "description": "Price above upper band — confirmed breakout / overbought",
//         "upper": 467.19,
//         "lower": 428.29,
//         "mid": 447.74,
//         "pct_b": 107.1,
//         "squeeze": false
//       },
//       "ma": {
//         "sma_20": 447.74,
//         "sma_50": 441.95,
//         "sma_200": 395.68,
//         "dist_200ma": 18.77
//       },
//       "atr": {
//         "value": 11.97,
//         "pct": 2.55
//       },
//       "volume": {
//         "ratio": 1.31
//       }
//     },
//     "patterns": {
//       "found": false,
//       "patterns": [],
//       "best": null,
//       "signal": "NO PATTERN",
//       "color": "#aaaaaa"
//     },
//     "reversal": {
//       "patterns": [
//         {
//           "type": "INVERSE_HEAD_AND_SHOULDERS",
//           "emoji": "🙃",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 85,
//           "description": "Inverse H&S: LS=₹365.2 | Head=₹364.5 | RS=₹364.8\nNeckline ≈ ₹388.0 | ⚡ CONFIRMED BREAK!",
//           "trade_note": "Buy on close above neckline ₹388.0. Target: ₹411.5",
//           "neckline": 387.97,
//           "price_target": 411.47,
//           "ls_price": 365.24,
//           "head_price": 364.48,
//           "rs_price": 364.78,
//           "vol_ok": false,
//           "bars_formed": 28
//         },
//         {
//           "type": "DOUBLE_BOTTOM",
//           "emoji": "Ⓦ",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 85,
//           "description": "Double Bottom (W): Trough1=₹364.5 | Trough2=₹364.8 | Peak=₹384.1\n⚡ CONFIRMED — price above peak!",
//           "trade_note": "Buy above ₹384.1. Target: ₹403.6",
//           "neckline": 384.12,
//           "price_target": 403.62,
//           "trough1": 364.48,
//           "trough2": 364.78,
//           "vol_ok": true,
//           "bars_formed": 17
//         },
//         {
//           "type": "TRIPLE_BOTTOM",
//           "emoji": "🏔️🏔️🏔️",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 70,
//           "description": "Triple Bottom at ≈₹364.8 | Resistance ₹384.1 | ⚡ BREAKOUT!",
//           "trade_note": "Buy above ₹384.1. Target ₹403.4",
//           "neckline": 384.12,
//           "price_target": 403.41,
//           "vol_ok": true,
//           "bars_formed": 28
//         },
//         {
//           "type": "TRIPLE_TOP",
//           "emoji": "⛰️⛰️⛰️",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 45,
//           "description": "Triple Top at ≈₹384.8 | Support ₹364.5 | Watching",
//           "trade_note": "Sell below ₹364.5. Target ₹344.1",
//           "neckline": 364.48,
//           "price_target": 344.11,
//           "vol_ok": true,
//           "bars_formed": 40
//         }
//       ],
//       "gaps": [
//         {
//           "type": "COMMON_GAP",
//           "emoji": "⬜",
//           "direction": "DOWN",
//           "gap_size": 2.63,
//           "vol_ratio": 1,
//           "gap_filled": true,
//           "is_recent": false,
//           "significance": "LOW",
//           "description": "Common Gap (DOWN) — already filled. No trend significance.",
//           "color": "#6b6b80",
//           "bar_index": 3,
//           "date": "3"
//         }
//       ],
//       "recent_gaps": [],
//       "found": true,
//       "best": {
//         "type": "INVERSE_HEAD_AND_SHOULDERS",
//         "emoji": "🙃",
//         "direction": "BULLISH",
//         "confirmed": true,
//         "confidence": 85,
//         "description": "Inverse H&S: LS=₹365.2 | Head=₹364.5 | RS=₹364.8\nNeckline ≈ ₹388.0 | ⚡ CONFIRMED BREAK!",
//         "trade_note": "Buy on close above neckline ₹388.0. Target: ₹411.5",
//         "neckline": 387.97,
//         "price_target": 411.47,
//         "ls_price": 365.24,
//         "head_price": 364.48,
//         "rs_price": 364.78,
//         "vol_ok": false,
//         "bars_formed": 28
//       }
//     },
//     "cont": {
//       "patterns": [
//         {
//           "type": "CUP_AND_HANDLE",
//           "emoji": "☕",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 95,
//           "description": "Cup & Handle: Rim ≈₹389.8 | Bottom ≈₹348.0 | Depth 10.7%\n⚡ BREAKOUT above rim!",
//           "trade_note": "Buy on close above ₹389.8. Target ₹431.7. SL: below handle low.",
//           "neckline": 389.84,
//           "price_target": 431.65,
//           "cup_depth": 10.72,
//           "vol_ok": false,
//           "bars_formed": 84
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 85,
//           "description": "Bull Flag: Pole +10.9% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹459.9 (pole height projected).",
//           "pole_move": 10.9,
//           "pole_bars": 25,
//           "vol_ok": true,
//           "price_target": 459.88,
//           "bars_formed": 21,
//           "neckline": 418.82
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 85,
//           "description": "Bull Flag: Pole +15.2% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹477.6 (pole height projected).",
//           "pole_move": 15.16,
//           "pole_bars": 25,
//           "vol_ok": true,
//           "price_target": 477.6,
//           "bars_formed": 21,
//           "neckline": 419.92
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 85,
//           "description": "Bull Flag: Pole +18.0% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹491.8 (pole height projected).",
//           "pole_move": 17.99,
//           "pole_bars": 25,
//           "vol_ok": true,
//           "price_target": 491.81,
//           "bars_formed": 21,
//           "neckline": 423.22
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 75,
//           "description": "Bull Flag: Pole +8.3% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹453.4 (pole height projected).",
//           "pole_move": 8.33,
//           "pole_bars": 25,
//           "vol_ok": true,
//           "price_target": 453.36,
//           "bars_formed": 21,
//           "neckline": 421.83
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 75,
//           "description": "Bull Flag: Pole +7.7% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹449.6 (pole height projected).",
//           "pole_move": 7.7,
//           "pole_bars": 25,
//           "vol_ok": true,
//           "price_target": 449.57,
//           "bars_formed": 21,
//           "neckline": 420.36
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 75,
//           "description": "Bull Flag: Pole +8.7% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹451.5 (pole height projected).",
//           "pole_move": 8.75,
//           "pole_bars": 25,
//           "vol_ok": true,
//           "price_target": 451.49,
//           "bars_formed": 21,
//           "neckline": 418.28
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 75,
//           "description": "Bull Flag: Pole +9.8% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹455.5 (pole height projected).",
//           "pole_move": 9.76,
//           "pole_bars": 25,
//           "vol_ok": true,
//           "price_target": 455.5,
//           "bars_formed": 21,
//           "neckline": 418.39
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 65,
//           "description": "Bull Flag: Pole +12.7% in 22 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹474.3 (pole height projected).",
//           "pole_move": 12.74,
//           "pole_bars": 22,
//           "vol_ok": false,
//           "price_target": 474.29,
//           "bars_formed": 21,
//           "neckline": 426.07
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 65,
//           "description": "Bull Flag: Pole +12.4% in 23 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹472.0 (pole height projected).",
//           "pole_move": 12.43,
//           "pole_bars": 23,
//           "vol_ok": false,
//           "price_target": 472.03,
//           "bars_formed": 21,
//           "neckline": 425
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 65,
//           "description": "Bull Flag: Pole +12.2% in 24 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹469.6 (pole height projected).",
//           "pole_move": 12.21,
//           "pole_bars": 24,
//           "vol_ok": false,
//           "price_target": 469.61,
//           "bars_formed": 21,
//           "neckline": 423.42
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 65,
//           "description": "Bear Flag: Pole -5.0% in 6 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹409.5 (pole height projected).",
//           "pole_move": -5.04,
//           "pole_bars": 6,
//           "vol_ok": true,
//           "price_target": 409.49,
//           "bars_formed": 21,
//           "neckline": 432.15
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 65,
//           "description": "Bear Flag: Pole -5.3% in 7 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹411.0 (pole height projected).",
//           "pole_move": -5.28,
//           "pole_bars": 7,
//           "vol_ok": true,
//           "price_target": 410.99,
//           "bars_formed": 21,
//           "neckline": 434.72
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 65,
//           "description": "Bull Flag: Pole +13.2% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹495.7 (pole height projected).",
//           "pole_move": 13.17,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 495.75,
//           "bars_formed": 21,
//           "neckline": 441.28
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 65,
//           "description": "Bull Flag: Pole +12.8% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹496.6 (pole height projected).",
//           "pole_move": 12.79,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 496.61,
//           "bars_formed": 21,
//           "neckline": 444.97
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 65,
//           "description": "Bear Flag: Pole -7.3% in 20 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹423.3 (pole height projected).",
//           "pole_move": -7.3,
//           "pole_bars": 20,
//           "vol_ok": true,
//           "price_target": 423.29,
//           "bars_formed": 10,
//           "neckline": 457.59
//         },
//         {
//           "type": "BEAR_PENNANT",
//           "emoji": "📐🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 65,
//           "description": "Bear Pennant: Pole -7.9% in 21 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹421.4 (pole height projected).",
//           "pole_move": -7.95,
//           "pole_bars": 21,
//           "vol_ok": true,
//           "price_target": 421.41,
//           "bars_formed": 9,
//           "neckline": 458.76
//         },
//         {
//           "type": "BEAR_PENNANT",
//           "emoji": "📐🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 65,
//           "description": "Bear Pennant: Pole -6.7% in 22 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹428.0 (pole height projected).",
//           "pole_move": -6.67,
//           "pole_bars": 22,
//           "vol_ok": true,
//           "price_target": 428.01,
//           "bars_formed": 8,
//           "neckline": 459.36
//         },
//         {
//           "type": "BEAR_PENNANT",
//           "emoji": "📐🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 65,
//           "description": "Bear Pennant: Pole -6.0% in 23 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹430.6 (pole height projected).",
//           "pole_move": -6.03,
//           "pole_bars": 23,
//           "vol_ok": true,
//           "price_target": 430.65,
//           "bars_formed": 7,
//           "neckline": 459
//         },
//         {
//           "type": "BEAR_PENNANT",
//           "emoji": "📐🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 65,
//           "description": "Bear Pennant: Pole -5.7% in 24 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹431.0 (pole height projected).",
//           "pole_move": -5.73,
//           "pole_bars": 24,
//           "vol_ok": true,
//           "price_target": 430.98,
//           "bars_formed": 6,
//           "neckline": 457.93
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +6.1% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹484.4 (pole height projected).",
//           "pole_move": 6.12,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 484.38,
//           "bars_formed": 21,
//           "neckline": 458.81
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +5.4% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹475.8 (pole height projected).",
//           "pole_move": 5.42,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 475.81,
//           "bars_formed": 21,
//           "neckline": 452.86
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +9.5% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹488.8 (pole height projected).",
//           "pole_move": 9.52,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 488.75,
//           "bars_formed": 21,
//           "neckline": 447.88
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +9.6% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹485.7 (pole height projected).",
//           "pole_move": 9.57,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 485.71,
//           "bars_formed": 21,
//           "neckline": 444.92
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +7.8% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹476.5 (pole height projected).",
//           "pole_move": 7.76,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 476.47,
//           "bars_formed": 21,
//           "neckline": 443.32
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +8.5% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹478.5 (pole height projected).",
//           "pole_move": 8.49,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 478.52,
//           "bars_formed": 21,
//           "neckline": 442.34
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +7.0% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹471.3 (pole height projected).",
//           "pole_move": 7.02,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 471.34,
//           "bars_formed": 21,
//           "neckline": 441.47
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +8.7% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹477.5 (pole height projected).",
//           "pole_move": 8.73,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 477.54,
//           "bars_formed": 21,
//           "neckline": 441.07
//         },
//         {
//           "type": "BULL_FLAG",
//           "emoji": "🚩🟢",
//           "direction": "BULLISH",
//           "confirmed": true,
//           "confidence": 55,
//           "description": "Bull Flag: Pole +6.0% in 25 bars. ⚡ Breakout confirmed!",
//           "trade_note": "Enter on breakout. Target: ₹473.0 (pole height projected).",
//           "pole_move": 6.02,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 472.97,
//           "bars_formed": 21,
//           "neckline": 447.85
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 50,
//           "description": "Bear Flag: Pole -7.7% in 18 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹419.7 (pole height projected).",
//           "pole_move": -7.66,
//           "pole_bars": 18,
//           "vol_ok": true,
//           "price_target": 419.75,
//           "bars_formed": 12,
//           "neckline": 455.75
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 50,
//           "description": "Bear Flag: Pole -7.4% in 19 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹421.3 (pole height projected).",
//           "pole_move": -7.45,
//           "pole_bars": 19,
//           "vol_ok": true,
//           "price_target": 421.32,
//           "bars_formed": 11,
//           "neckline": 456.32
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 45,
//           "description": "Bear Flag: Pole -5.6% in 11 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹425.9 (pole height projected).",
//           "pole_move": -5.61,
//           "pole_bars": 11,
//           "vol_ok": false,
//           "price_target": 425.95,
//           "bars_formed": 21,
//           "neckline": 450.52
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 45,
//           "description": "Bear Flag: Pole -5.3% in 25 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹432.3 (pole height projected).",
//           "pole_move": -5.26,
//           "pole_bars": 25,
//           "vol_ok": false,
//           "price_target": 432.29,
//           "bars_formed": 21,
//           "neckline": 454.7
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 45,
//           "description": "Bear Flag: Pole -5.1% in 14 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹435.9 (pole height projected).",
//           "pole_move": -5.07,
//           "pole_bars": 14,
//           "vol_ok": false,
//           "price_target": 435.94,
//           "bars_formed": 21,
//           "neckline": 458.14
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 45,
//           "description": "Bear Flag: Pole -5.0% in 16 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹439.1 (pole height projected).",
//           "pole_move": -5.04,
//           "pole_bars": 16,
//           "vol_ok": false,
//           "price_target": 439.14,
//           "bars_formed": 21,
//           "neckline": 461.25
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 45,
//           "description": "Bear Flag: Pole -5.2% in 22 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹427.7 (pole height projected).",
//           "pole_move": -5.24,
//           "pole_bars": 22,
//           "vol_ok": false,
//           "price_target": 427.71,
//           "bars_formed": 21,
//           "neckline": 451.26
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 30,
//           "description": "Bear Flag: Pole -5.4% in 8 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹415.1 (pole height projected).",
//           "pole_move": -5.44,
//           "pole_bars": 8,
//           "vol_ok": false,
//           "price_target": 415.12,
//           "bars_formed": 21,
//           "neckline": 439.6
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 30,
//           "description": "Bear Flag: Pole -7.1% in 9 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹411.9 (pole height projected).",
//           "pole_move": -7.13,
//           "pole_bars": 9,
//           "vol_ok": false,
//           "price_target": 411.95,
//           "bars_formed": 21,
//           "neckline": 444.02
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 30,
//           "description": "Bear Flag: Pole -7.3% in 12 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹424.9 (pole height projected).",
//           "pole_move": -7.3,
//           "pole_bars": 12,
//           "vol_ok": false,
//           "price_target": 424.92,
//           "bars_formed": 21,
//           "neckline": 457.73
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 30,
//           "description": "Bear Flag: Pole -7.1% in 14 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹427.6 (pole height projected).",
//           "pole_move": -7.07,
//           "pole_bars": 14,
//           "vol_ok": false,
//           "price_target": 427.63,
//           "bars_formed": 21,
//           "neckline": 459.43
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 30,
//           "description": "Bear Flag: Pole -5.8% in 16 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹435.3 (pole height projected).",
//           "pole_move": -5.84,
//           "pole_bars": 16,
//           "vol_ok": false,
//           "price_target": 435.3,
//           "bars_formed": 21,
//           "neckline": 461.55
//         },
//         {
//           "type": "BEAR_FLAG",
//           "emoji": "🚩🔴",
//           "direction": "BEARISH",
//           "confirmed": false,
//           "confidence": 30,
//           "description": "Bear Flag: Pole -5.3% in 17 bars. Consolidating — watch for breakout.",
//           "trade_note": "Enter on breakout. Target: ₹435.4 (pole height projected).",
//           "pole_move": -5.29,
//           "pole_bars": 17,
//           "vol_ok": false,
//           "price_target": 435.37,
//           "bars_formed": 21,
//           "neckline": 459.17
//         }
//       ],
//       "found": true,
//       "best": {
//         "type": "CUP_AND_HANDLE",
//         "emoji": "☕",
//         "direction": "BULLISH",
//         "confirmed": true,
//         "confidence": 95,
//         "description": "Cup & Handle: Rim ≈₹389.8 | Bottom ≈₹348.0 | Depth 10.7%\n⚡ BREAKOUT above rim!",
//         "trade_note": "Buy on close above ₹389.8. Target ₹431.7. SL: below handle low.",
//         "neckline": 389.84,
//         "price_target": 431.65,
//         "cup_depth": 10.72,
//         "vol_ok": false,
//         "bars_formed": 84
//       },
//       "sr": {
//         "resistance": [
//           {
//             "price": 476,
//             "touches": 1,
//             "strength": "WEAK",
//             "dist_pct": 1.3
//           }
//         ],
//         "support": [
//           {
//             "price": 455.53,
//             "touches": 1,
//             "strength": "WEAK",
//             "dist_pct": -3.1
//           },
//           {
//             "price": 427.5,
//             "touches": 1,
//             "strength": "WEAK",
//             "dist_pct": -9
//           },
//           {
//             "price": 403.74,
//             "touches": 2,
//             "strength": "MODERATE",
//             "dist_pct": -14.1
//           },
//           {
//             "price": 386.09,
//             "touches": 4,
//             "strength": "STRONG",
//             "dist_pct": -17.8
//           },
//           {
//             "price": 382.6,
//             "touches": 1,
//             "strength": "WEAK",
//             "dist_pct": -18.6
//           }
//         ],
//         "nearest_resistance": {
//           "price": 476,
//           "touches": 1,
//           "strength": "WEAK",
//           "dist_pct": 1.3
//         },
//         "nearest_support": {
//           "price": 455.53,
//           "touches": 1,
//           "strength": "WEAK",
//           "dist_pct": -3.1
//         },
//         "current_price": 469.95
//       },
//       "trendlines": {
//         "uptrend_line": {
//           "slope": -1.2556,
//           "value_now": 413.69,
//           "touches": 9,
//           "broken": false,
//           "ascending": false
//         },
//         "downtrend_line": {
//           "slope": 0.6824,
//           "value_now": 495.11,
//           "touches": 2,
//           "broken": false,
//           "descending": false
//         },
//         "uptrend_broken": false,
//         "downtrend_broken": false,
//         "signal": "NEUTRAL",
//         "description": "Insufficient data for trendline analysis"
//       },
//       "ma_crosses": {
//         "golden_cross": false,
//         "death_cross": false,
//         "golden_cross_date": null,
//         "death_cross_date": null,
//         "ma50_above_ma200": true,
//         "ma20_above_ma50": true,
//         "signal": "BULLISH ALIGNMENT",
//         "color": "#7c6af7",
//         "description": "SMA50 above SMA200 — long-term bullish trend in place.",
//         "medium_term_cross": "NEUTRAL"
//       }
//     }
//   },
//   [
//     {
//       "index": "Open",
//       "2026-04-28": 456.20001220703125
//     },
//     {
//       "index": "High",
//       "2026-04-28": 473.8999938964844
//     },
//     {
//       "index": "Low",
//       "2026-04-28": 456.20001220703125
//     },
//     {
//       "index": "Close",
//       "2026-04-28": 469.95001220703125
//     },
//     {
//       "index": "Volume",
//       "2026-04-28": 17228560
//     },
//     {
//       "index": "SMA_20",
//       "2026-04-28": 447.73999938964846
//     },
//     {
//       "index": "SMA_50",
//       "2026-04-28": 441.9542224121094
//     },
//     {
//       "index": "SMA_200",
//       "2026-04-28": 395.67795013427735
//     },
//     {
//       "index": "EMA_9",
//       "2026-04-28": 452.0688819928916
//     },
//     {
//       "index": "EMA_21",
//       "2026-04-28": 448.54425689896647
//     },
//     {
//       "index": "RSI",
//       "2026-04-28": 64.18088342175747
//     },
//     {
//       "index": "RSI_signal",
//       "2026-04-28": "BULLISH"
//     },
//     {
//       "index": "MACD",
//       "2026-04-28": 2.991939148145434
//     },
//     {
//       "index": "MACD_signal",
//       "2026-04-28": 1.109017414064836
//     },
//     {
//       "index": "MACD_hist",
//       "2026-04-28": 1.8829217340805982
//     },
//     {
//       "index": "MACD_cross",
//       "2026-04-28": "NONE"
//     },
//     {
//       "index": "BB_upper",
//       "2026-04-28": 467.1893104201425
//     },
//     {
//       "index": "BB_lower",
//       "2026-04-28": 428.29068835915444
//     },
//     {
//       "index": "BB_mid",
//       "2026-04-28": 447.73999938964846
//     },
//     {
//       "index": "BB_width",
//       "2026-04-28": 8.687770159917356
//     },
//     {
//       "index": "BB_pct",
//       "2026-04-28": 1.0709717116087132
//     },
//     {
//       "index": "BB_squeeze",
//       "2026-04-28": false
//     },
//     {
//       "index": "ATR",
//       "2026-04-28": 11.970761894559457
//     },
//     {
//       "index": "ATR_pct",
//       "2026-04-28": 2.55
//     },
//     {
//       "index": "Vol_MA20",
//       "2026-04-28": 13138562.2
//     },
//     {
//       "index": "Vol_ratio",
//       "2026-04-28": 1.31
//     },
//     {
//       "index": "OBV",
//       "2026-04-28": 429618271
//     },
//     {
//       "index": "Dist_from_200MA",
//       "2026-04-28": 18.77
//     }
//   ]
// ];
//   return res;
// }


async function getSectorAnalysis(symbol){
  
   const res = await axios.get(`${BASE_URL}/sector/analysis`);
   return res.data;

}

async function getTopStocks( filters ){
  const res = await axios.get(`${BASE_URL}/cache/fullscan` ,{
    params : {
      filters : JSON.stringify(filters)
    }
  })
  return res.data
}



// async function getTopStocks(){
//   const res = {

//   "total_scanned": 50,
//   "total-found": 5,
//   "scanned_at": "29 Apr 2026  04:12 PM",
//   "sector_rotation": {
//     "sectors": {
//       "Metal": {
//         "ret_20d": 17.47,
//         "ret_6m": 28.13,
//         "rel_20d": 11.52,
//         "rel_6m": 34.75,
//         "score": 25.46,
//         "rank": 1,
//         "total": 10,
//         "status": "HOT 🔥",
//         "color": "#3dd68c"
//       },
//       "Energy": {
//         "ret_20d": 16.32,
//         "ret_6m": 14.92,
//         "rel_20d": 10.37,
//         "rel_6m": 21.54,
//         "score": 17.07,
//         "rank": 2,
//         "total": 10,
//         "status": "HOT 🔥",
//         "color": "#3dd68c"
//       },
//       "PSU / Defence": {
//         "ret_20d": 4.59,
//         "ret_6m": 9.86,
//         "rel_20d": -1.37,
//         "rel_6m": 16.48,
//         "score": 9.34,
//         "rank": 3,
//         "total": 10,
//         "status": "HOT 🔥",
//         "color": "#3dd68c"
//       },
//       "Pharma": {
//         "ret_20d": 3.08,
//         "ret_6m": 3.31,
//         "rel_20d": -2.87,
//         "rel_6m": 9.93,
//         "score": 4.81,
//         "rank": 4,
//         "total": 10,
//         "status": "WARM",
//         "color": "#f5a623"
//       },
//       "Media": {
//         "ret_20d": 13.09,
//         "ret_6m": -5.05,
//         "rel_20d": 7.14,
//         "rel_6m": 1.57,
//         "score": 3.79,
//         "rank": 5,
//         "total": 10,
//         "status": "WARM",
//         "color": "#f5a623"
//       },
//       "Auto": {
//         "ret_20d": 7.12,
//         "ret_6m": -4.2,
//         "rel_20d": 1.17,
//         "rel_6m": 2.42,
//         "score": 1.92,
//         "rank": 6,
//         "total": 10,
//         "status": "WARM",
//         "color": "#f5a623"
//       },
//       "Infra / Realty": {
//         "ret_20d": 20.21,
//         "ret_6m": -14.06,
//         "rel_20d": 14.26,
//         "rel_6m": -7.44,
//         "score": 1.24,
//         "rank": 7,
//         "total": 10,
//         "status": "WARM",
//         "color": "#f5a623"
//       },
//       "Banking & Finance": {
//         "ret_20d": 5.99,
//         "ret_6m": -4.6,
//         "rel_20d": 0.03,
//         "rel_6m": 2.01,
//         "score": 1.22,
//         "rank": 8,
//         "total": 10,
//         "status": "WARM",
//         "color": "#f5a623"
//       },
//       "FMCG / Consumer": {
//         "ret_20d": 11.51,
//         "ret_6m": -8.55,
//         "rel_20d": 5.56,
//         "rel_6m": -1.93,
//         "score": 1.07,
//         "rank": 9,
//         "total": 10,
//         "status": "WARM",
//         "color": "#f5a623"
//       },
//       "IT / Tech": {
//         "ret_20d": -1,
//         "ret_6m": -18.94,
//         "rel_20d": -6.95,
//         "rel_6m": -12.32,
//         "score": -10.17,
//         "rank": 10,
//         "total": 10,
//         "status": "COLD ❄️",
//         "color": "#f75f5f"
//       }
//     },
//     "nifty_20d": 5.95,
//     "nifty_6m": -6.62,
//     "top4": [
//       "Metal",
//       "Energy",
//       "PSU / Defence",
//       "Pharma"
//     ],
//     "bottom4": [
//       "Infra / Realty",
//       "Banking & Finance",
//       "FMCG / Consumer",
//       "IT / Tech"
//     ],
//     "timestamp": "29 Apr 2026 16:12"
//   }
// }
//   return res;
// }

async function get_ai_analysis(symbol){
  const res = await axios.get(`${BASE_URL}/ai/${symbol}`);
  return res.data;

}

// async function get_ai_analysis(symbol){
//   const res = {
//   "symbol": "BEL",
//   "company_name": "Bharat Electronics",
//   "timestamp": "01 May 2026 11:17",
//   "news": {
//     "news_items": [
//       {
//         "title": "Nomura Sees Rs 6 Lakh Cr Order Windfall by FY27",
//         "detail": "Nomura has forecasted a significant order windfall of Rs 6 lakh crore for Bharat Electronics by FY27, driven by the Indian government's defense modernization plans. However, the brokerage firm has maintained a 'Neutral' rating on the stock. This development is crucial as it indicates a potential surge in orders for the company, which could positively impact its revenue and profitability.",
//         "category": "Analyst",
//         "sentiment": "NEUTRAL",
//         "impact": 8,
//         "date_approx": "Q4 FY26",
//         "source_hint": "Financialexpress.com"
//       },
//       {
//         "title": "Bharat Electronics Surges to 52-Week High",
//         "detail": "Bharat Electronics' stock price has surged to a 52-week high of Rs 473.45, representing an 84.8% increase. This upward movement can be attributed to the company's strong order book and the government's focus on defense sector growth.",
//         "category": "Macro",
//         "sentiment": "POSITIVE",
//         "impact": 7,
//         "date_approx": "Q4 FY26",
//         "source_hint": "PSU Connect"
//       },
//       {
//         "title": "Bharat Electronics Schedules Conference Call for Q3FY26 Results",
//         "detail": "Bharat Electronics has scheduled a conference call to discuss its Q3FY26 financial results. The call will provide insights into the company's performance during the quarter and its outlook for the future.",
//         "category": "Earnings",
//         "sentiment": "NEUTRAL",
//         "impact": 5,
//         "date_approx": "Q3 FY26",
//         "source_hint": "Scanx.trade"
//       },
//       {
//         "title": "Defence Sector Stocks Gain Momentum",
//         "detail": "The defense sector has been gaining momentum, with stocks like Ideaforge Technology and Paras Defence surging. Bharat Electronics, however, fell 1.37% on April 22. The sector's growth is driven by the government's increased focus on defense modernization.",
//         "category": "Sector",
//         "sentiment": "POSITIVE",
//         "impact": 4,
//         "date_approx": "Q4 FY26",
//         "source_hint": "Dailyhunt"
//       }
//     ],
//     "overall_news_sentiment": "POSITIVE",
//     "overall_news_score": 6,
//     "key_upcoming_events": [
//       "Q4 FY26 results expected"
//     ],
//     "analyst_consensus": "MIXED",
//     "recent_price_drivers": [
//       "Defense sector growth",
//       "Order windfall forecast"
//     ],
//     "news_summary": "Bharat Electronics has been in the news recently due to its surging stock price, which has reached a 52-week high. The company is expected to benefit from the Indian government's defense modernization plans, with Nomura forecasting a significant order windfall by FY27. However, the brokerage firm has maintained a 'Neutral' rating on the stock. The defense sector as a whole has been gaining momentum, driven by the government's increased focus on defense growth.",
//     "positive": [
//       {
//         "title": "Bharat Electronics Surges to 52-Week High",
//         "detail": "Bharat Electronics' stock price has surged to a 52-week high of Rs 473.45, representing an 84.8% increase. This upward movement can be attributed to the company's strong order book and the government's focus on defense sector growth.",
//         "category": "Macro",
//         "sentiment": "POSITIVE",
//         "impact": 7,
//         "date_approx": "Q4 FY26",
//         "source_hint": "PSU Connect"
//       },
//       {
//         "title": "Defence Sector Stocks Gain Momentum",
//         "detail": "The defense sector has been gaining momentum, with stocks like Ideaforge Technology and Paras Defence surging. Bharat Electronics, however, fell 1.37% on April 22. The sector's growth is driven by the government's increased focus on defense modernization.",
//         "category": "Sector",
//         "sentiment": "POSITIVE",
//         "impact": 4,
//         "date_approx": "Q4 FY26",
//         "source_hint": "Dailyhunt"
//       }
//     ],
//     "negative": [],
//     "neutral": [
//       {
//         "title": "Nomura Sees Rs 6 Lakh Cr Order Windfall by FY27",
//         "detail": "Nomura has forecasted a significant order windfall of Rs 6 lakh crore for Bharat Electronics by FY27, driven by the Indian government's defense modernization plans. However, the brokerage firm has maintained a 'Neutral' rating on the stock. This development is crucial as it indicates a potential surge in orders for the company, which could positively impact its revenue and profitability.",
//         "category": "Analyst",
//         "sentiment": "NEUTRAL",
//         "impact": 8,
//         "date_approx": "Q4 FY26",
//         "source_hint": "Financialexpress.com"
//       },
//       {
//         "title": "Bharat Electronics Schedules Conference Call for Q3FY26 Results",
//         "detail": "Bharat Electronics has scheduled a conference call to discuss its Q3FY26 financial results. The call will provide insights into the company's performance during the quarter and its outlook for the future.",
//         "category": "Earnings",
//         "sentiment": "NEUTRAL",
//         "impact": 5,
//         "date_approx": "Q3 FY26",
//         "source_hint": "Scanx.trade"
//       }
//     ],
//     "source": "groq"
//   },
//   "decision": {
//     "verdict": "BUY_ON_DIP",
//     "confidence": 60,
//     "timeframe": "2-4 weeks",
//     "one_liner": "Bharat Electronics is a buy on dips candidate due to its strong fundamentals and positive news flow, despite weak technical indicators.",
//     "reasoning": "The company's fundamentals are strong, with a high profit margin and low debt-to-equity ratio. The news flow is also positive, with the company expected to benefit from the Indian government's defense modernization plans. However, the technical indicators are weak, with a low composite score and a weakening MACD. The stock is also trading above its upper Bollinger Band, which could lead to a correction. Therefore, it is recommended to buy the stock on dips, with a stop loss at ₹423.65.",
//     "reasoning2": "The risk factors are moderate, with no high-severity risks. The MACD momentum is weakening, and the price is above the upper Bollinger Band, which could lead to a correction. However, the overall risk level is moderate, and the stock has a strong fundamental view. The comparable stocks in the defense sector are also performing well, which could support the stock's price.",
//     "reasoning3": "The bull case for the stock is strong, with the company expected to benefit from the Indian government's defense modernization plans. The bear case is weak, with no significant risks or negative news flow. The fundamental view is strong, with a high profit margin and low debt-to-equity ratio. The technical view is neutral, with a low composite score and a weakening MACD. The news view is positive, with the company expected to benefit from the Indian government's defense modernization plans.",
//     "action_plan": {
//       "entry_strategy": "Buy on dips",
//       "entry_price": 431.3,
//       "sl_price": 423.65,
//       "sl_reasoning": "The stop loss is set at ₹423.65, which is below the recent low and provides a reasonable risk-reward ratio.",
//       "t1_price": 455.37,
//       "t2_price": 481.21,
//       "position_sizing": "Half position",
//       "exit_strategy": "Trail the stop loss and take profits at the target prices"
//     },
//     "bull_case": [
//       "Strong fundamentals",
//       "Positive news flow",
//       "Defense sector momentum"
//     ],
//     "bear_case": [
//       "Weak technical indicators",
//       "MACD momentum weakening",
//       "Price above upper Bollinger Band"
//     ],
//     "fundamental_view": "STRONG",
//     "fundamental_comment": "The company's fundamentals are strong, with a high profit margin and low debt-to-equity ratio. The revenue growth is negative, but the profit growth is also negative, which could be a concern.",
//     "technical_view": "NEUTRAL",
//     "technical_comment": "The technical indicators are weak, with a low composite score and a weakening MACD. The stock is also trading above its upper Bollinger Band, which could lead to a correction.",
//     "news_view": "POSITIVE",
//     "news_comment": "The news flow is positive, with the company expected to benefit from the Indian government's defense modernization plans. The defense sector is also gaining momentum, which could support the stock's price.",
//     "key_triggers": [
//       "Defense modernization plans",
//       "Order windfall by FY27"
//     ],
//     "comparable_stocks": [
//       "Hindustan Aeronautics",
//       "Mazagon Dock Shipbuilders"
//     ],
//     "sector_view": "The defense sector is gaining momentum, driven by the Indian government's increased focus on defense growth.",
//     "red_flags": [
//       "MACD momentum weakening"
//     ],
//     "overall_score": 65,
//     "source": "groq",
//     "timestamp": "01 May 2026"
//   }
// }
//   return res;

// }



// run backtest
async function runBacktest(filters){
  const res = await axios.get(`${BASE_URL}/backtest` ,{
    params:{
      filters : JSON.stringify(filters)
    }
  });
  return res.data
}


async function getRisks(symbol){
  const res = await axios.get(`${BASE_URL}/risks/${symbol}`);
  return res.data;
  
}
//  async function getRisks(symbol){
//   const res ={
//   "risk_data": {
//     "risks": {
//       "risks": [
//         {
//           "severity": "HIGH",
//           "category": "Technical",
//           "emoji": "📉",
//           "title": "RSI Bearish Divergence",
//           "description": "Price making higher highs but RSI making lower highs. Murphy: 'Bearish divergence warns of potential reversal.' This is one of the most reliable warning signals.",
//           "action": "Avoid new long entries. If in trade, raise stop loss to breakeven.",
//           "color": "#f75f5f"
//         },
//         {
//           "severity": "MEDIUM",
//           "category": "Technical",
//           "emoji": "📊",
//           "title": "Price Above Upper Bollinger Band (%B=11220.0%)",
//           "description": "Price is 11120.0% above the upper BB. Bandy: 'Price far above upper band = high volatility risk.' Mean reversion likely.",
//           "action": "Avoid chasing here. Wait for %B to come back below 1.0.",
//           "color": "#f5a623"
//         },
//         {
//           "severity": "MEDIUM",
//           "category": "Technical",
//           "emoji": "🔄",
//           "title": "Stochastic Overbought (%K=82)",
//           "description": "Stochastic %K at 82 — above 80 overbought zone. Murphy Ch.10: '%K above 80 = watch for bearish crossover.'",
//           "action": "Wait for %K to cross below %D in overbought zone as exit signal.",
//           "color": "#f5a623"
//         },
//         {
//           "severity": "MEDIUM",
//           "category": "Pattern",
//           "emoji": "🔻",
//           "title": "DOUBLE TOP Pattern Detected",
//           "description": "Double Top (M): Peak1=₹84.2 | Peak2=₹83.8 | Valley=₹76.4\nWatch for break below ₹76.4 Confidence: 65%. Murphy Ch.5: 'Reversal patterns signal end of trend.'",
//           "action": "Watching — tighten SL to ₹76.45 Target: ₹68.89",
//           "color": "#f5a623"
//         },
//         {
//           "severity": "MEDIUM",
//           "category": "Pattern",
//           "emoji": "🔻",
//           "title": "DOUBLE TOP Pattern Detected",
//           "description": "Double Top (M): Peak1=₹83.8 | Peak2=₹83.6 | Valley=₹78.1\nWatch for break below ₹78.1 Confidence: 65%. Murphy Ch.5: 'Reversal patterns signal end of trend.'",
//           "action": "Watching — tighten SL to ₹78.1 Target: ₹72.5",
//           "color": "#f5a623"
//         },
//         {
//           "severity": "MEDIUM",
//           "category": "Pattern",
//           "emoji": "🔻",
//           "title": "DOUBLE TOP Pattern Detected",
//           "description": "Double Top (M): Peak1=₹76.3 | Peak2=₹74.9 | Valley=₹70.1\nWatch for break below ₹70.1 Confidence: 50%. Murphy Ch.5: 'Reversal patterns signal end of trend.'",
//           "action": "Watching — tighten SL to ₹70.11 Target: ₹64.63",
//           "color": "#f5a623"
//         }
//       ],
//       "total": 6,
//       "high_count": 1,
//       "medium_count": 5,
//       "overall": "HIGH",
//       "overall_color": "#f75f5f",
//       "overall_desc": "At least one critical risk present — trade with caution"
//     },
//     "mtf": {
//       "short": {
//         "label": "Short Term (1–4 Weeks)",
//         "direction": "BULLISH",
//         "strength": "STRONG",
//         "score": 10,
//         "signals": [
//           "Above MA20",
//           "Above MA50",
//           "Above MA200 ✅",
//           "RSI 63 bullish",
//           "Near period high"
//         ],
//         "entry_note": "Wait for pullback to MA20/MA50 for better entry",
//         "color": "#3dd68c",
//         "emoji": "🟢⬆️",
//         "summary": "BULLISH (STRONG) — Score 10 | Above MA20 · Above MA50 · Above MA200 ✅",
//         "cmp": 95.31,
//         "ma20": 89.93,
//         "ma50": 89.79,
//         "ma200": 89.79,
//         "rsi": 62.53
//       },
//       "medium": {
//         "label": "Medium Term (1–3 Months)",
//         "direction": "BULLISH",
//         "strength": "STRONG",
//         "score": 15,
//         "signals": [
//           "Above MA20",
//           "Above MA50",
//           "Above MA200 ✅",
//           "MA50 > MA200 (Golden)",
//           "RSI 63 bullish",
//           "MACD > Signal ✅",
//           "MACD above zero",
//           "Near period high"
//         ],
//         "entry_note": "Wait for pullback to MA20/MA50 for better entry",
//         "color": "#3dd68c",
//         "emoji": "🟢⬆️",
//         "summary": "BULLISH (STRONG) — Score 15 | Above MA20 · Above MA50 · Above MA200 ✅",
//         "cmp": 95.31,
//         "ma20": 89.93,
//         "ma50": 86.3,
//         "ma200": 83.39,
//         "rsi": 63.11
//       },
//       "long": {
//         "label": "Long Term (6+ Months)",
//         "direction": "BULLISH",
//         "strength": "STRONG",
//         "score": 15,
//         "signals": [
//           "Above MA20",
//           "Above MA50",
//           "Above MA200 ✅",
//           "MA50 > MA200 (Golden)",
//           "RSI 68 bullish",
//           "MACD > Signal ✅",
//           "MACD above zero",
//           "Near period high"
//         ],
//         "entry_note": "Wait for pullback to MA20/MA50 for better entry",
//         "color": "#3dd68c",
//         "emoji": "🟢⬆️",
//         "summary": "BULLISH (STRONG) — Score 15 | Above MA20 · Above MA50 · Above MA200 ✅",
//         "cmp": 95.31,
//         "ma20": 83.76,
//         "ma50": 76.88,
//         "ma200": 76.47,
//         "rsi": 68.29
//       },
//       "alignment": "FULLY ALIGNED BULLISH",
//       "align_color": "#3dd68c",
//       "align_emoji": "🟢🟢🟢",
//       "align_desc": "All 3 timeframes bullish — highest confidence setup. Covel: 'Trade in the direction all timeframes agree.'",
//       "confidence": "HIGH",
//       "best_tf": "Short Term"
//     }
//   },
//   "entry_analysis": {
//     "found": true,
//     "entry": 95.42,
//     "sl": 94.87,
//     "t1": 120.97,
//     "t2": 140.21,
//     "t3": 159.46,
//     "entry_type": "IMMEDIATE",
//     "rr_t1": 46.89,
//     "rr_t2": 82.19,
//     "rr_t3": 117.51,
//     "risk_pct": -0.57,
//     "r1_pct": 26.78,
//     "r2_pct": 46.95,
//     "confidence": 79,
//     "n_signals": 6,
//     "grade": "A",
//     "grade_color": "#3dd68c",
//     "grade_desc": "Strong setup with solid multi-indicator confluence",
//     "position": {
//       "quantity": 1818,
//       "entry": 95.42,
//       "sl": 94.87,
//       "trade_value": 173464.49,
//       "capital_pct": 173.5,
//       "risk_amount": 1000,
//       "actual_loss": 999.9,
//       "actual_loss_pct": 1,
//       "risk_per_share": 0.55,
//       "adjusted_risk_pct": 1,
//       "original_risk_pct": 1,
//       "regime_adj": 0,
//       "capital": 100000,
//       "steps": [
//         "Step 1 — Risk Amount: ₹100,000 × 1.0% = ₹1,000",
//         "Step 2 — Risk per Share: ₹95.41501048218029 (entry) − ₹94.87 (SL) = ₹0.55",
//         "Step 3 — Quantity: ₹1,000 ÷ ₹0.55 = 1818 shares",
//         "Step 4 — Trade Value: 1818 × ₹95.41501048218029 = ₹173,464 (173.5% of capital)",
//         "Step 5 — Actual Max Loss: 1818 × ₹0.55 = ₹1,000 (1.0% of capital)"
//       ],
//       "note": "Buy 1818 shares @ ₹95.42 = ₹173,464 (173.5% of capital). Max loss if SL hits: ₹1,000 (1.0% of capital)."
//     },
//     "regime": {
//       "vol_ratio": 1,
//       "vol_note": "ATR 1.0x avg — Normal volatility. Full size OK.",
//       "vol_color": "#3dd68c",
//       "vol_penalty": 0,
//       "participation": 3.71,
//       "part_note": "Volume 3.7x avg — Strong institutional participation ✅",
//       "part_color": "#3dd68c",
//       "part_bonus": 5,
//       "trend_note": "MA200 flat 0.0% — Sideways. Lower confidence.",
//       "trend_color": "#f5a623",
//       "trend_bonus": -5,
//       "total_adjustment": 0,
//       "regime_ok": false,
//       "summary": "❌ Unfavourable regime — skip (Halls-Moore)"
//     },
//     "entries": [
//       {
//         "name": "Dow Theory",
//         "emoji": "🌊",
//         "entry": 93.4,
//         "sl": 90.54,
//         "sl_method": "ATR x1.5 (Bandy)",
//         "t1": 99.13,
//         "t2": 103.43,
//         "t3": 107.72,
//         "rr_t1": 2,
//         "rr_t2": 3.5,
//         "entry_type": "LIMIT",
//         "condition": "Limit buy near MA20 ≈ ₹93.4",
//         "confidence": 65,
//         "reasoning": "Primary uptrend. Murphy: 'Buy pullbacks in the direction of the primary trend.' Limit at MA20 ₹93.4.",
//         "risk_pct": -3.07,
//         "r1_pct": 6.13,
//         "r2_pct": 10.73,
//         "rr_ok": true,
//         "bars_ago": 0,
//         "decay_note": "",
//         "adj_conf": 65
//       },
//       {
//         "name": "MACD Signal",
//         "emoji": "📉📈",
//         "entry": 95.31,
//         "sl": 92.45,
//         "sl_method": "ATR x1.5 (Bandy)",
//         "t1": 101.03,
//         "t2": 105.32,
//         "t3": 109.61,
//         "rr_t1": 2,
//         "rr_t2": 3.5,
//         "entry_type": "IMMEDIATE",
//         "condition": "Buy at CMP — fresh MACD bullish crossover",
//         "confidence": 84,
//         "reasoning": "MACD Bullish Crossover. Murphy Ch.10: 'MACD crossover is widely used.' MACD:1.384",
//         "risk_pct": -3,
//         "r1_pct": 6,
//         "r2_pct": 10.5,
//         "rr_ok": true,
//         "bars_ago": 0,
//         "decay_note": "",
//         "adj_conf": 84
//       },
//       {
//         "name": "Bollinger Bands",
//         "emoji": "🎯",
//         "entry": 95.31,
//         "sl": 89.75,
//         "sl_method": "Mid-band SL (Murphy)",
//         "t1": 106.43,
//         "t2": 114.77,
//         "t3": 123.11,
//         "rr_t1": 2,
//         "rr_t2": 3.5,
//         "entry_type": "IMMEDIATE",
//         "condition": "Buy at CMP — above BB upper ₹94.25",
//         "confidence": 76,
//         "reasoning": "Price broke above upper BB ₹94.25. Murphy: 'Walking upper band = strong uptrend.' SL at mid-band ₹89.93.",
//         "risk_pct": -3,
//         "r1_pct": 11.67,
//         "r2_pct": 20.42,
//         "rr_ok": true,
//         "bars_ago": 0,
//         "decay_note": "",
//         "adj_conf": 76
//       },
//       {
//         "name": "INVERSE HEAD AND SHOULDERS",
//         "emoji": "📊",
//         "entry": 95.31,
//         "sl": 62.14,
//         "sl_method": "Below INVERSE HEAD AND SHOULDERS neckline",
//         "t1": 161.65,
//         "t2": 211.4,
//         "t3": 261.16,
//         "rr_t1": 2,
//         "rr_t2": 3.5,
//         "entry_type": "IMMEDIATE",
//         "condition": "Buy at CMP — INVERSE HEAD AND SHOULDERS confirmed",
//         "confidence": 85,
//         "reasoning": "INVERSE HEAD AND SHOULDERS breakout CONFIRMED. Murphy Ch.6: 'Enter on confirmed close above boundary.' SL back below neckline ₹63.41.",
//         "risk_pct": -3,
//         "r1_pct": 69.6,
//         "r2_pct": 121.8,
//         "rr_ok": true,
//         "bars_ago": 0,
//         "decay_note": "",
//         "adj_conf": 85
//       },
//       {
//         "name": "CUP AND HANDLE",
//         "emoji": "🔄",
//         "entry": 95.31,
//         "sl": 82.48,
//         "sl_method": "Below CUP AND HANDLE neckline",
//         "t1": 120.97,
//         "t2": 140.21,
//         "t3": 159.46,
//         "rr_t1": 2,
//         "rr_t2": 3.5,
//         "entry_type": "IMMEDIATE",
//         "condition": "Buy at CMP — CUP AND HANDLE confirmed",
//         "confidence": 95,
//         "reasoning": "CUP AND HANDLE confirmed above neckline ₹84.16. Murphy Ch.5: 'Volume should expand on neckline breakout.' Target: ₹{_r(tgt)}.",
//         "risk_pct": -3,
//         "r1_pct": 26.92,
//         "r2_pct": 47.11,
//         "rr_ok": true,
//         "bars_ago": 0,
//         "decay_note": "",
//         "adj_conf": 95
//       },
//       {
//         "name": "52W + Turtle",
//         "emoji": "🐢🚀",
//         "entry": 97.73,
//         "sl": 94.87,
//         "sl_method": "ATR x1.5 (Bandy)",
//         "t1": 103.45,
//         "t2": 107.74,
//         "t3": 112.03,
//         "rr_t1": 2,
//         "rr_t2": 3.5,
//         "entry_type": "BREAKOUT",
//         "condition": "Buy stop ₹97.73 above 52W high ₹97.24",
//         "confidence": 72,
//         "reasoning": "Approaching 52W high ₹97.24 — 2.0% away. Covel: 'Don't anticipate breakouts — wait for confirmation.'",
//         "risk_pct": -2.93,
//         "r1_pct": 5.85,
//         "r2_pct": 10.24,
//         "rr_ok": true,
//         "bars_ago": 0,
//         "decay_note": "",
//         "adj_conf": 72
//       }
//     ],
//     "skipped": [],
//     "quote": [
//       "Quantitative Technical Analysis — Howard Bandy",
//       "Risk of ruin is the most important number in trading. Keep it near zero."
//     ]
//   },
//   "fundamentals": {
//     "symbol": "NMDC",
//     "info": {
//       "name": "NMDC Limited",
//       "sector": "Basic Materials",
//       "industry": "Steel",
//       "employees": null,
//       "website": "https://www.nmdc.co.in",
//       "description": "NMDC Limited, together with its subsidiaries, explores for and produces iron ore in India and internationally. It operates through Iron Ore, and All Other Segments (Pellets, Other Minerals & Services). The company also explores for lithium, copper, rock phosphate, limestone, beach sand, coking and non-coking coal, magnesite, diamond, tungsten, nickel, gold, base metals, and rare earth metals. In a...",
//       "exchange": "NSI",
//       "currency": "INR"
//     },
//     "quarterly": [],
//     "annual": [
//       {
//         "year": "2026",
//         "revenue": 320708900000,
//         "revenue_str": "₹321 Cr",
//         "profit": 74504200000,
//         "profit_str": "₹75 Cr",
//         "ebitda": 107479000000,
//         "ebitda_str": "₹107 Cr",
//         "margin_pct": 23.2,
//         "rev_growth": null,
//         "prof_growth": null,
//         "profit_color": "#3dd68c",
//         "rev_g_color": "#aaaaaa",
//         "pro_g_color": "#aaaaaa",
//         "rev_arrow": "—",
//         "prof_arrow": "—",
//         "is_profit": true
//       },
//       {
//         "year": "2025",
//         "revenue": 239055200000,
//         "revenue_str": "₹239 Cr",
//         "profit": 65419800000,
//         "profit_str": "₹65 Cr",
//         "ebitda": 97419900000,
//         "ebitda_str": "₹97 Cr",
//         "margin_pct": 27.4,
//         "rev_growth": -25.5,
//         "prof_growth": -12.2,
//         "profit_color": "#3dd68c",
//         "rev_g_color": "#f75f5f",
//         "pro_g_color": "#f75f5f",
//         "rev_arrow": "▼ -25.5%",
//         "prof_arrow": "▼ -12.2%",
//         "is_profit": true
//       },
//       {
//         "year": "2024",
//         "revenue": 213012300000,
//         "revenue_str": "₹213 Cr",
//         "profit": 55750600000,
//         "profit_str": "₹56 Cr",
//         "ebitda": 83903200000,
//         "ebitda_str": "₹84 Cr",
//         "margin_pct": 26.2,
//         "rev_growth": -10.9,
//         "prof_growth": -14.8,
//         "profit_color": "#3dd68c",
//         "rev_g_color": "#f75f5f",
//         "pro_g_color": "#f75f5f",
//         "rev_arrow": "▼ -10.9%",
//         "prof_arrow": "▼ -14.8%",
//         "is_profit": true
//       },
//       {
//         "year": "2023",
//         "revenue": 176611000000,
//         "revenue_str": "₹177 Cr",
//         "profit": 56014600000,
//         "profit_str": "₹56 Cr",
//         "ebitda": 80589100000,
//         "ebitda_str": "₹81 Cr",
//         "margin_pct": 31.7,
//         "rev_growth": -17.1,
//         "prof_growth": 0.5,
//         "profit_color": "#3dd68c",
//         "rev_g_color": "#f75f5f",
//         "pro_g_color": "#3dd68c",
//         "rev_arrow": "▼ -17.1%",
//         "prof_arrow": "▲ +0.5%",
//         "is_profit": true
//       }
//     ],
//     "dividends": [
//       {
//         "date": "13 Feb 2026",
//         "amount": 2.5,
//         "amount_str": "₹2.5/share",
//         "year": "2026"
//       },
//       {
//         "date": "14 Aug 2025",
//         "amount": 1,
//         "amount_str": "₹1.0/share",
//         "year": "2025"
//       },
//       {
//         "date": "21 Mar 2025",
//         "amount": 2.3,
//         "amount_str": "₹2.3/share",
//         "year": "2025"
//       },
//       {
//         "date": "17 Sep 2024",
//         "amount": 0.5,
//         "amount_str": "₹0.5/share",
//         "year": "2024"
//       },
//       {
//         "date": "27 Feb 2024",
//         "amount": 1.92,
//         "amount_str": "₹1.92/share",
//         "year": "2024"
//       },
//       {
//         "date": "31 Aug 2023",
//         "amount": 0.95,
//         "amount_str": "₹0.95/share",
//         "year": "2023"
//       },
//       {
//         "date": "24 Feb 2023",
//         "amount": 1.25,
//         "amount_str": "₹1.25/share",
//         "year": "2023"
//       },
//       {
//         "date": "17 Feb 2022",
//         "amount": 1.91,
//         "amount_str": "₹1.91/share",
//         "year": "2022"
//       }
//     ],
//     "ratios": {
//       "market_cap": "₹838 Cr",
//       "pe_ratio": 11.25,
//       "forward_pe": 9.46,
//       "pb_ratio": 2.46,
//       "ps_ratio": 2.61,
//       "roe": 23.4,
//       "roa": 12.3,
//       "profit_margin": 23.2,
//       "operating_margin": 22,
//       "debt_to_equity": 18.8,
//       "current_ratio": 2.43,
//       "quick_ratio": 1.7,
//       "beta": 0.68,
//       "52w_high": 97.24,
//       "52w_low": 66.8,
//       "dividend_yield": null,
//       "payout_ratio": 41.3,
//       "eps_ttm": 8.47,
//       "book_value": 38.81,
//       "revenue_ttm": "₹321 Cr",
//       "net_income_ttm": "₹75 Cr",
//       "free_cash_flow": "₹-14 Cr",
//       "enterprise_value": "₹787 Cr",
//       "market_cap_raw": 837948080128
//     },
//     "error": null
//   },
//   "news_sentiment": {
//     "overall_sentiment": "POSITIVE",
//     "overall_score": 4.7,
//     "overall_summary": "Analysed 17 articles for NMDC (NMDC). 11 positive, 1 negative, 5 neutral. News flow is predominantly bullish with AI score +4.7/10.",
//     "key_themes": [
//       "Analyst",
//       "Management"
//     ],
//     "risk_factors": [
//       "Trade Spotlight: How should you trade IRCTC, MCX, NBCC, NMDC..."
//     ],
//     "catalysts": [
//       "Reduce Wipro; target of Rs 410: ICICI Securities",
//       "Buy HDFC Life Insurance Company; target of Rs 739: ICICI Sec...",
//       "NMDC shares gain 5% to hit 52-week high as iron ore producti..."
//     ],
//     "recommendation": "STRONG_BUY",
//     "positive": [
//       {
//         "title": "Reduce Wipro; target of Rs 410: ICICI Securities",
//         "summary": "ICICI Securities is bullish on Wipro has recommended buy rating on the stock with a target price of Rs 410 in its research report dated April 21, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/reduce-wipro-targetrs-410-icici-securities_17531461.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.662,
//         "vader_compound": 0.637,
//         "boost": 0.7,
//         "impact": 10,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "Buy HDFC Life Insurance Company; target of Rs 739: ICICI Securities",
//         "summary": "ICICI Securities is bullish on HDFC Life Insurance Company has recommended buy rating on the stock with a target price of Rs 739 in its research report dated April 21, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/buy-hdfc-life-insurance-company-targetrs-739-icici-securities_17531391.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.662,
//         "vader_compound": 0.637,
//         "boost": 0.7,
//         "impact": 10,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "NMDC shares gain 5% to hit 52-week high as iron ore production soars 20% YoY to 5.31 MT in May; key details - Upstox",
//         "summary": "NMDC shares gain 5% to hit 52-week high as iron ore production soars 20% YoY to 5.31 MT in May; key details&nbsp;&nbsp;Upstox",
//         "link": "https://news.google.com/rss/articles/CBMi9wFBVV95cUxNNjZMblRyazQtcUtoMW9UdGlnS3Vqa0p0MjV3R3ViR2FSZXluUV9Pb01kZmFJbV9DZkVJRkxFbkM4S2pCcm5TLXpJZWFWV3VldG5Ec0dISGRyQWlyODNkYU1YcVVOSUJWaWpBdWVZUEtvNUxaTThhWHlKQmJOaDNWUkZlc2VFcFFxUFdwbko1MVNNcFo5ZVhSb0lhMkFNcVpaWjdKUEZkNE9fU1p0anY5SjVPRzg2ZC0wWDNVT0NOU0hjQ0thdnc5MjVGWEtoblBBNlpMZGpRb1FTdS1EZmhUMHZFcDVlSlhMQWN4RHF4Zy1CSXZ0YlI0?oc=5",
//         "date": "Tue, 02 Jun 2026",
//         "source": "Upstox",
//         "sentiment": "POSITIVE",
//         "compound": 0.688,
//         "vader_compound": 0.881,
//         "boost": 0.4,
//         "impact": 8,
//         "category": "Management",
//         "reason": "Positive signals: 52-week high."
//       },
//       {
//         "title": "Buy HDFC Bank; target of Rs 1,850: ICICI Securities",
//         "summary": "ICICI Securities is bullish on HDFC Bank has recommended buy rating on the stock with a target price of Rs 1,850 in its research report dated April 21, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/buy-hdfc-bank-targetrs-1850-icici-securities_17531671.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.542,
//         "vader_compound": 0.637,
//         "boost": 0.4,
//         "impact": 7,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "Buy Tejas Networks; target of Rs 1100: Emkay Global Financial",
//         "summary": "Emkay Global Financial is bullish on Tejas Networks has recommended buy rating on the stock with a target price of Rs 1100 in its research report dated April 23, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/buy-tejas-networks-targetrs-1100-emkay-global-financial_17531621.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.401,
//         "vader_compound": 0.202,
//         "boost": 0.7,
//         "impact": 7,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "Buy Bajaj Finance; target of Rs 9000: Emkay Global Financial",
//         "summary": "Emkay Global Financial is bullish on Bajaj Finance has recommended buy rating on the stock with a target price of Rs 9000 in its research report dated April 23, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/buy-bajaj-finance-targetrs-9000-emkay-global-financial_17531641.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.401,
//         "vader_compound": 0.202,
//         "boost": 0.7,
//         "impact": 7,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "NMDC Shares Up 2.71% on Q2FY26 Profit Surge of 40.8% YoY to ₹1,699 Cr - HDFC Sky",
//         "summary": "NMDC Shares Up 2.71% on Q2FY26 Profit Surge of 40.8% YoY to ₹1,699 Cr&nbsp;&nbsp;HDFC Sky",
//         "link": "https://news.google.com/rss/articles/CBMipgFBVV95cUxNZ2VQeVZ4NXY5MFFPZ1RMa0ZrdDEyWWNuLWtlbzhSWW5WR2xxa3BzSlBKNWhOT1V1Q0NRT2M5RFNGQ0JoV0dlNFJCWU9YcmxFenN4UzdEUnZEZ0t2SnJPeWQxT2JIUzZBUTRrWEFiLXhzd2xSS2hzSVZ6NFpNMWNCRHBKX01RUC1ydlBCb2dfbDVFM3lLdHJwenN6cUU2ME51SVZsanln?oc=5",
//         "date": "Wed, 29 Oct 2025",
//         "source": "HDFC Sky",
//         "sentiment": "POSITIVE",
//         "compound": 0.509,
//         "vader_compound": 0.848,
//         "boost": 0,
//         "impact": 5,
//         "category": "Earnings",
//         "reason": "Positive tone detected in headline language."
//       },
//       {
//         "title": "NMDC Limited's (NSE:NMDC) Business And Shares Still Trailing The Market - simplywall.st",
//         "summary": "NMDC Limited's (NSE:NMDC) Business And Shares Still Trailing The Market&nbsp;&nbsp;simplywall.st",
//         "link": "https://news.google.com/rss/articles/CBMixwFBVV95cUxPZl80SWRJVVRJZkpSblhSS1hLWkhsUWk0b0w5Q1VCbU9mN09ySERIOEZzMG5DMG9EZWR0a2E0eHVrUmdULW9MUFRyNUFsbUIxa0NudkpmUUNsbXRDNWpnY2pqNnJ2MjBiY2EwVzRUOEh4TlEweHVsZnNoRGNCdkswd1VhU3RjWXJ3V0JOa1JjM3NpakdpREpVSnFXbXp0UjFPX0dReWE2VFZSd1FqQkF5aVU2UnhMaUNEWE1OUU95My1rRHE0SWNF0gHMAUFVX3lxTE5jUGI3cVgza0kzMWRaUFVTY0VQbTVjcjNBakJFTUItMjZBRlQ3U1oxMmwxRGJEakZEd3FJZTRiRFVOUWFuN0h3M1MtUEFLT2Rta09RNzF3bmZGSGxGZ3Q1Um56b3ZLLXhwUzZrcE5lcVFaVkJvUTNSMzlld1NyaUFVWkZaQ1hKYXUtSTFsdXh0OWFoTUMxV2xBZThaSGxIZVM5cUM0VnBoYlpoeU0yaWFENTh1YnZfelE1VzRWZDZXYmNhQ2picHJHa3U1MA?oc=5",
//         "date": "Sat, 31 Jan 2026",
//         "source": "simplywall.st",
//         "sentiment": "POSITIVE",
//         "compound": 0.316,
//         "vader_compound": 0.527,
//         "boost": 0,
//         "impact": 3,
//         "category": "Management",
//         "reason": "Positive tone detected in headline language."
//       },
//       {
//         "title": "NMDC Limited Announces Revised Iron Ore Prices Effective January 9, 2026 - scanx.trade",
//         "summary": "NMDC Limited Announces Revised Iron Ore Prices Effective January 9, 2026&nbsp;&nbsp;scanx.trade",
//         "link": "https://news.google.com/rss/articles/CBMiwwFBVV95cUxNbjdnTENWcU1JYWVsS0p6ZFJoaWRLZ0xKZUltNGR2aFZFOEVkZXNDZ1NrYXVVekhhNUE3aTVCZVRvcHd6RndnVVlXTEttalBVMmJseWpvazZGWXFxQlF2NVBHTklDUzFUV1Axd2JBbGRGaGg0NUpaNWEzTFlnTzVkRjl4Ty1VVWVEWHNSMVpFVjQycTVQZ21lbzluU3JBYzJHLTNQLVplLTRQdFVnNV94NlllNGNfdDJSR2xmMWtRX2NBX2s?oc=5",
//         "date": "Fri, 09 Jan 2026",
//         "source": "scanx.trade",
//         "sentiment": "POSITIVE",
//         "compound": 0.316,
//         "vader_compound": 0.527,
//         "boost": 0,
//         "impact": 3,
//         "category": "Management",
//         "reason": "Positive tone detected in headline language."
//       },
//       {
//         "title": "Reduce Persistent Systems; target of Rs 3700: Emkay Global Financial",
//         "summary": "Emkay Global Financial recommended reduce rating on Persistent Systems with a target price of Rs 3700 in its research report dated April 22, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/reduce-persistent-systems-targetrs-3700-emkay-global-financial_17531581.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.121,
//         "vader_compound": 0.202,
//         "boost": 0,
//         "impact": 1,
//         "category": "Analyst",
//         "reason": "Positive tone detected in headline language."
//       },
//       {
//         "title": "Reduce Aditya Birla Fashion and Retail; target of Rs 230: Emkay Global Financial",
//         "summary": "Emkay Global Financial recommended reduce rating on Aditya Birla Fashion and Retail with a target price of Rs 230 in its research report dated April 23, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/reduce-aditya-birla-fashionretail-targetrs-230-emkay-global-financial_17531571.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.121,
//         "vader_compound": 0.202,
//         "boost": 0,
//         "impact": 1,
//         "category": "Analyst",
//         "reason": "Positive tone detected in headline language."
//       }
//     ],
//     "negative": [
//       {
//         "title": "Trade Spotlight: How should you trade IRCTC, MCX, NBCC, NMDC, Engineers India, Karur Vysya Bank, and others on December 29? - TradingView",
//         "summary": "Trade Spotlight: How should you trade IRCTC, MCX, NBCC, NMDC, Engineers India, Karur Vysya Bank, and others on December 29?&nbsp;&nbsp;TradingView",
//         "link": "https://news.google.com/rss/articles/CBMiigJBVV95cUxQaGthcS1UMzdqRjJOVlpFSXZVQ0hIdDd2bUotS3cwOFdjVEhLQVRwbnFfV0FNREFjcEdpU3NMWEhrM2N4cGNSalRXY0taM2pJY3NLSUFhSTZpellvdnUtNHRaakw1QWtrY3V5M3ZLYWlVRkV1VzhMcWFFWmt4SWx5MF9LcDRJbGwxZFhqeTk2NE1oMXd5TG9JTlZReFJLaEtyZkQ3TS11RFRSd2lGZ09DSWpIeWhkUDJfZ2J5b3g3SmIyZ3NVWDkyckg1Q2l1R3liTExqQ2ExX0tRc251TkFTMG1IV09EdlpNMFVwMWFVNHd4dWpJLTRiMkxYbTFYVTd3T1RtZGNmdUpzZw?oc=5",
//         "date": "Sun, 28 Dec 2025",
//         "source": "TradingView",
//         "sentiment": "NEGATIVE",
//         "compound": -0.12,
//         "vader_compound": 0,
//         "boost": -0.3,
//         "impact": 2,
//         "category": "Management",
//         "reason": "Negative signals: ban."
//       }
//     ],
//     "neutral": [
//       {
//         "title": "NMDC, HCC among 5 stocks to buy below ₹100 for up to 23% upside: Angel One - Business Standard",
//         "summary": "NMDC, HCC among 5 stocks to buy below ₹100 for up to 23% upside: Angel One&nbsp;&nbsp;Business Standard",
//         "link": "https://news.google.com/rss/articles/CBMi0wFBVV95cUxPcnkyaXhpWjUyckl3aXRoYXh5Y3VfZzE3ZjQ5dmVCMDByVFF6RERGMDRvVzV5cnBrWUdyOU9ha3VMa0lKTF92OUJZc2ZnUjhicGRHYnhyaGVDTG80ZmZyR0Q0Q18tTUxKdFVmVWVCTDZQRWZBVVpjRnRKU255RnpNOHQ3eFRJa0hNeHNyd283YWRGQWZhVlhTME5vaGt3Z3NRNHhFcjlYbWFvaGt0M3pYRVNVSGh3ckVTQUNQbGVWTXNiXzhkcHRQaUw1ejRTOFJfZkVR0gHYAUFVX3lxTE8zMFRvWXZkbE5rWUttRDctd2N5akV6ZXZ4bGEyT1dyaWZnM29ILWdhZzQ0QmhuQU95aW5wa2RwM2pSOXB3aWVzNkh6Zng4cF94Uk1ramx2LWtZZ2xiY0xRVmQ4NFlxQ0FMN0xvOF9PT29jdnFEYnNSWnp3eXhSSGVjU0lTMEJZdEdLNEx1UDBKTEMtZTNVZGwyd1BrUnBLM29CV2U5UF9QUWhlek9KYjVLeUdiV19kOXB4RUlBNjc1dWNFM0RTTXhiSkFHLVdNSkdxN09SYTgycw?oc=5",
//         "date": "Wed, 06 May 2026",
//         "source": "Business Standard",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "Trade Spotlight: How should you trade Indus Towers, NMDC, Max Healthcare, BSE, KEI Industries, and others... - Moneycontrol.com",
//         "summary": "Trade Spotlight: How should you trade Indus Towers, NMDC, Max Healthcare, BSE, KEI Industries, and others...&nbsp;&nbsp;Moneycontrol.com",
//         "link": "https://news.google.com/rss/articles/CBMihAJBVV95cUxObHpOOTM0ek1vVnowRlpSVWlSRHkwYzVkUC1iWEo5ZzNEcVNTa3JyendYSmZOX01HREF2aGlKa3JNM2ZXa21INzktMWYxVlJ3VXF3T29QTmhDektpSWtqT3NmUW1WdVhSa01OOEk1MEZKSUhXZnpwZU1OVjN0YndNbk8xM3k3elVWU1NQd1hfekNnZ05OVnJOeG16eC1KMXdNVHBIdFY5Tkw1clNVcEZJeEJidEpHZXl2aVZFTkdQNXgyalBxcFdlVHBwYk9VY2dRTm0taktMbVFVZEo5UndrOW9YWVgzenBzZkdBanlUdjNDQlc3cW91cjgyb3ZRWnc0cDFVedIBigJBVV95cUxOZVJnY3ZaazFjd3lTdGJMMEFpUU5mTXBnTHFyWm1DbUlYSW1Cc19QV0FVMHRDMWlPemxzVnVQaFdHQXBneHhJMzZqYzlUZVFJREtqWnF1RUF1RGlaSzhmNHdHLUJLRlRkTlNkb3paMUYwM1d6bkNubjExQzRMYUU4X1ZsM1RFTXJfclZLYXdwaGViajBNM1FZZnhwQzJzZWRXSHM3ZGVBcWhZV1MxdDVyYV9PeFduM0RZWHNXbkFMM3lsSlBhQ2tBaE90SDYzUlN6eUE0aVNXMU8tejFMbk5UclYtaTJzVDd3ZG9PaDJlS2kyellXSFRSZmZ3S2ZuMlRvYXlpUmNhalNtUQ?oc=5",
//         "date": "Fri, 15 May 2026",
//         "source": "Moneycontrol.com",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "Tata Steel, Jindal Steel, JSW Steel, SAIL, NMDC: Target prices for 5 stocks - Business Today",
//         "summary": "Tata Steel, Jindal Steel, JSW Steel, SAIL, NMDC: Target prices for 5 stocks&nbsp;&nbsp;Business Today",
//         "link": "https://news.google.com/rss/articles/CBMi1AFBVV95cUxOY2Nyem1FZ214QnNMQjhRT0hGdTJSOGlJNmdTUmtJZ2p1Qldyb25oTjVGblM4ZkhIQm95TzhnN1A2Y3JTODlneGU2STlwSjNpMDhaN3ZFZzNNSjQ1NktzZ2JZM2NSeHphMW9VNi1EQXFaRV91ZHFZaGhBbm96TXp2WThmellpSk5vWlFaM2pCV0hoTzNfTXpLRWoxMV9pQUlSRlpQUzhEcV9EekNiWWhxUEJuNmdKcnc3SjhWZUJtYU9NZEppa0ZucWlKNF9jMmJ3VFhvS9IB2gFBVV95cUxQMzNtSHN5R1p6VGc5SFgxN1VfNGtVZklXaWUxbXJkRENZSmxVcEFLaEcwbkR4ZUU5N3gzTDMtYXNQeDY5M0ZOMjJNMTN3LVliWG5NTFlvT1FING9VQ1ZCTm9BeWVPaHplQkNOWFhGTTVFckY3dGJULVNaV2xVU200d25iczE4cUZWcUtBYWMwenk2anRfYmw0NVJrMTFWWEc3a2NtWlVGVGR0TllRdmdfbzZZYWhiOHVTbS1rM0p2ZmROcEpxV0R1RkZhYThqWlo3S25EMkpTbVMydw?oc=5",
//         "date": "Fri, 24 Apr 2026",
//         "source": "Business Today",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "NMDC Historical Data - Equitypandit",
//         "summary": "NMDC Historical Data&nbsp;&nbsp;Equitypandit",
//         "link": "https://news.google.com/rss/articles/CBMiXkFVX3lxTFBNMTB6V2hISG1UWXBvSGFweXNVS3VmVHFtS1FYWVBaZmM0RWNLZVhpN0FhWFhGNVRaeWE1X0xJa25lQkxnTng0NnV0Sncxc0Z3ZlFqRmhUb1NnMVpTS0E?oc=5",
//         "date": "Wed, 10 Sep 2025",
//         "source": "Equitypandit",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "NMDC Limited's (NSE:NMDC) largest shareholders are state or government with 61% ownership, institutions own 20% - simplywall.st",
//         "summary": "NMDC Limited's (NSE:NMDC) largest shareholders are state or government with 61% ownership, institutions own 20%&nbsp;&nbsp;simplywall.st",
//         "link": "https://news.google.com/rss/articles/CBMiygFBVV95cUxQbldOZVVRZ25OVjRqRmNhb3NkRURMWXAyVEYyTU16bUlzUDdQVDdqRmQtLTZXbFVfeFRQNzBycWk5aTJJSEdNanNwdWFpNVJYc1BiaGdWbjgxdHJBcE9EM2ZtZEVEVXdocnB6Sk1pdVBIVnRFbUttSWh1cXV2a3BRaEZUQlJ2QmxxUlZLd1B3RkJEaFc3cHRMZkpqZk8zelYxYldJRHZzZnJCOVdHMTFZcTNaaUVqSjJyYzc2dUpBZl9JS3hDU1k1TUNR0gHPAUFVX3lxTFBhWHE4YU43VTVPZ2hSZm9CNHJUUTkwQURoWkVCMkNrODRrU1M0anRMX2FZMzI2LXNTbHFpM2FUa2ZHTkRtX1NUQV92OGg2X2hSVDNtWGhNSzZMTS1lUlNWWUdIa3ptb2NPeUg4VGF3cURtOWtrdFdfa0xnZGF4ak1rMVMteHJKcUZmd0xTN2dXenhUOTM3SkNEVjZBQnZIU1E4OTUyNHh6bWRtS0tuZEp0blA4ZmxJVjh4VVhSVURDOE1UcGRSTDFpNlZ3Y3pmUQ?oc=5",
//         "date": "Tue, 13 Jan 2026",
//         "source": "simplywall.st",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       }
//     ],
//     "total_articles": 17,
//     "articles": [
//       {
//         "title": "Reduce Wipro; target of Rs 410: ICICI Securities",
//         "summary": "ICICI Securities is bullish on Wipro has recommended buy rating on the stock with a target price of Rs 410 in its research report dated April 21, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/reduce-wipro-targetrs-410-icici-securities_17531461.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.662,
//         "vader_compound": 0.637,
//         "boost": 0.7,
//         "impact": 10,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "Buy HDFC Life Insurance Company; target of Rs 739: ICICI Securities",
//         "summary": "ICICI Securities is bullish on HDFC Life Insurance Company has recommended buy rating on the stock with a target price of Rs 739 in its research report dated April 21, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/buy-hdfc-life-insurance-company-targetrs-739-icici-securities_17531391.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.662,
//         "vader_compound": 0.637,
//         "boost": 0.7,
//         "impact": 10,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "NMDC shares gain 5% to hit 52-week high as iron ore production soars 20% YoY to 5.31 MT in May; key details - Upstox",
//         "summary": "NMDC shares gain 5% to hit 52-week high as iron ore production soars 20% YoY to 5.31 MT in May; key details&nbsp;&nbsp;Upstox",
//         "link": "https://news.google.com/rss/articles/CBMi9wFBVV95cUxNNjZMblRyazQtcUtoMW9UdGlnS3Vqa0p0MjV3R3ViR2FSZXluUV9Pb01kZmFJbV9DZkVJRkxFbkM4S2pCcm5TLXpJZWFWV3VldG5Ec0dISGRyQWlyODNkYU1YcVVOSUJWaWpBdWVZUEtvNUxaTThhWHlKQmJOaDNWUkZlc2VFcFFxUFdwbko1MVNNcFo5ZVhSb0lhMkFNcVpaWjdKUEZkNE9fU1p0anY5SjVPRzg2ZC0wWDNVT0NOU0hjQ0thdnc5MjVGWEtoblBBNlpMZGpRb1FTdS1EZmhUMHZFcDVlSlhMQWN4RHF4Zy1CSXZ0YlI0?oc=5",
//         "date": "Tue, 02 Jun 2026",
//         "source": "Upstox",
//         "sentiment": "POSITIVE",
//         "compound": 0.688,
//         "vader_compound": 0.881,
//         "boost": 0.4,
//         "impact": 8,
//         "category": "Management",
//         "reason": "Positive signals: 52-week high."
//       },
//       {
//         "title": "Buy HDFC Bank; target of Rs 1,850: ICICI Securities",
//         "summary": "ICICI Securities is bullish on HDFC Bank has recommended buy rating on the stock with a target price of Rs 1,850 in its research report dated April 21, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/buy-hdfc-bank-targetrs-1850-icici-securities_17531671.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.542,
//         "vader_compound": 0.637,
//         "boost": 0.4,
//         "impact": 7,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "Buy Tejas Networks; target of Rs 1100: Emkay Global Financial",
//         "summary": "Emkay Global Financial is bullish on Tejas Networks has recommended buy rating on the stock with a target price of Rs 1100 in its research report dated April 23, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/buy-tejas-networks-targetrs-1100-emkay-global-financial_17531621.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.401,
//         "vader_compound": 0.202,
//         "boost": 0.7,
//         "impact": 7,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "Buy Bajaj Finance; target of Rs 9000: Emkay Global Financial",
//         "summary": "Emkay Global Financial is bullish on Bajaj Finance has recommended buy rating on the stock with a target price of Rs 9000 in its research report dated April 23, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/buy-bajaj-finance-targetrs-9000-emkay-global-financial_17531641.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.401,
//         "vader_compound": 0.202,
//         "boost": 0.7,
//         "impact": 7,
//         "category": "Analyst",
//         "reason": "Positive signals: buy rating, bullish."
//       },
//       {
//         "title": "NMDC Shares Up 2.71% on Q2FY26 Profit Surge of 40.8% YoY to ₹1,699 Cr - HDFC Sky",
//         "summary": "NMDC Shares Up 2.71% on Q2FY26 Profit Surge of 40.8% YoY to ₹1,699 Cr&nbsp;&nbsp;HDFC Sky",
//         "link": "https://news.google.com/rss/articles/CBMipgFBVV95cUxNZ2VQeVZ4NXY5MFFPZ1RMa0ZrdDEyWWNuLWtlbzhSWW5WR2xxa3BzSlBKNWhOT1V1Q0NRT2M5RFNGQ0JoV0dlNFJCWU9YcmxFenN4UzdEUnZEZ0t2SnJPeWQxT2JIUzZBUTRrWEFiLXhzd2xSS2hzSVZ6NFpNMWNCRHBKX01RUC1ydlBCb2dfbDVFM3lLdHJwenN6cUU2ME51SVZsanln?oc=5",
//         "date": "Wed, 29 Oct 2025",
//         "source": "HDFC Sky",
//         "sentiment": "POSITIVE",
//         "compound": 0.509,
//         "vader_compound": 0.848,
//         "boost": 0,
//         "impact": 5,
//         "category": "Earnings",
//         "reason": "Positive tone detected in headline language."
//       },
//       {
//         "title": "NMDC Limited's (NSE:NMDC) Business And Shares Still Trailing The Market - simplywall.st",
//         "summary": "NMDC Limited's (NSE:NMDC) Business And Shares Still Trailing The Market&nbsp;&nbsp;simplywall.st",
//         "link": "https://news.google.com/rss/articles/CBMixwFBVV95cUxPZl80SWRJVVRJZkpSblhSS1hLWkhsUWk0b0w5Q1VCbU9mN09ySERIOEZzMG5DMG9EZWR0a2E0eHVrUmdULW9MUFRyNUFsbUIxa0NudkpmUUNsbXRDNWpnY2pqNnJ2MjBiY2EwVzRUOEh4TlEweHVsZnNoRGNCdkswd1VhU3RjWXJ3V0JOa1JjM3NpakdpREpVSnFXbXp0UjFPX0dReWE2VFZSd1FqQkF5aVU2UnhMaUNEWE1OUU95My1rRHE0SWNF0gHMAUFVX3lxTE5jUGI3cVgza0kzMWRaUFVTY0VQbTVjcjNBakJFTUItMjZBRlQ3U1oxMmwxRGJEakZEd3FJZTRiRFVOUWFuN0h3M1MtUEFLT2Rta09RNzF3bmZGSGxGZ3Q1Um56b3ZLLXhwUzZrcE5lcVFaVkJvUTNSMzlld1NyaUFVWkZaQ1hKYXUtSTFsdXh0OWFoTUMxV2xBZThaSGxIZVM5cUM0VnBoYlpoeU0yaWFENTh1YnZfelE1VzRWZDZXYmNhQ2picHJHa3U1MA?oc=5",
//         "date": "Sat, 31 Jan 2026",
//         "source": "simplywall.st",
//         "sentiment": "POSITIVE",
//         "compound": 0.316,
//         "vader_compound": 0.527,
//         "boost": 0,
//         "impact": 3,
//         "category": "Management",
//         "reason": "Positive tone detected in headline language."
//       },
//       {
//         "title": "NMDC Limited Announces Revised Iron Ore Prices Effective January 9, 2026 - scanx.trade",
//         "summary": "NMDC Limited Announces Revised Iron Ore Prices Effective January 9, 2026&nbsp;&nbsp;scanx.trade",
//         "link": "https://news.google.com/rss/articles/CBMiwwFBVV95cUxNbjdnTENWcU1JYWVsS0p6ZFJoaWRLZ0xKZUltNGR2aFZFOEVkZXNDZ1NrYXVVekhhNUE3aTVCZVRvcHd6RndnVVlXTEttalBVMmJseWpvazZGWXFxQlF2NVBHTklDUzFUV1Axd2JBbGRGaGg0NUpaNWEzTFlnTzVkRjl4Ty1VVWVEWHNSMVpFVjQycTVQZ21lbzluU3JBYzJHLTNQLVplLTRQdFVnNV94NlllNGNfdDJSR2xmMWtRX2NBX2s?oc=5",
//         "date": "Fri, 09 Jan 2026",
//         "source": "scanx.trade",
//         "sentiment": "POSITIVE",
//         "compound": 0.316,
//         "vader_compound": 0.527,
//         "boost": 0,
//         "impact": 3,
//         "category": "Management",
//         "reason": "Positive tone detected in headline language."
//       },
//       {
//         "title": "Trade Spotlight: How should you trade IRCTC, MCX, NBCC, NMDC, Engineers India, Karur Vysya Bank, and others on December 29? - TradingView",
//         "summary": "Trade Spotlight: How should you trade IRCTC, MCX, NBCC, NMDC, Engineers India, Karur Vysya Bank, and others on December 29?&nbsp;&nbsp;TradingView",
//         "link": "https://news.google.com/rss/articles/CBMiigJBVV95cUxQaGthcS1UMzdqRjJOVlpFSXZVQ0hIdDd2bUotS3cwOFdjVEhLQVRwbnFfV0FNREFjcEdpU3NMWEhrM2N4cGNSalRXY0taM2pJY3NLSUFhSTZpellvdnUtNHRaakw1QWtrY3V5M3ZLYWlVRkV1VzhMcWFFWmt4SWx5MF9LcDRJbGwxZFhqeTk2NE1oMXd5TG9JTlZReFJLaEtyZkQ3TS11RFRSd2lGZ09DSWpIeWhkUDJfZ2J5b3g3SmIyZ3NVWDkyckg1Q2l1R3liTExqQ2ExX0tRc251TkFTMG1IV09EdlpNMFVwMWFVNHd4dWpJLTRiMkxYbTFYVTd3T1RtZGNmdUpzZw?oc=5",
//         "date": "Sun, 28 Dec 2025",
//         "source": "TradingView",
//         "sentiment": "NEGATIVE",
//         "compound": -0.12,
//         "vader_compound": 0,
//         "boost": -0.3,
//         "impact": 2,
//         "category": "Management",
//         "reason": "Negative signals: ban."
//       },
//       {
//         "title": "NMDC, HCC among 5 stocks to buy below ₹100 for up to 23% upside: Angel One - Business Standard",
//         "summary": "NMDC, HCC among 5 stocks to buy below ₹100 for up to 23% upside: Angel One&nbsp;&nbsp;Business Standard",
//         "link": "https://news.google.com/rss/articles/CBMi0wFBVV95cUxPcnkyaXhpWjUyckl3aXRoYXh5Y3VfZzE3ZjQ5dmVCMDByVFF6RERGMDRvVzV5cnBrWUdyOU9ha3VMa0lKTF92OUJZc2ZnUjhicGRHYnhyaGVDTG80ZmZyR0Q0Q18tTUxKdFVmVWVCTDZQRWZBVVpjRnRKU255RnpNOHQ3eFRJa0hNeHNyd283YWRGQWZhVlhTME5vaGt3Z3NRNHhFcjlYbWFvaGt0M3pYRVNVSGh3ckVTQUNQbGVWTXNiXzhkcHRQaUw1ejRTOFJfZkVR0gHYAUFVX3lxTE8zMFRvWXZkbE5rWUttRDctd2N5akV6ZXZ4bGEyT1dyaWZnM29ILWdhZzQ0QmhuQU95aW5wa2RwM2pSOXB3aWVzNkh6Zng4cF94Uk1ramx2LWtZZ2xiY0xRVmQ4NFlxQ0FMN0xvOF9PT29jdnFEYnNSWnp3eXhSSGVjU0lTMEJZdEdLNEx1UDBKTEMtZTNVZGwyd1BrUnBLM29CV2U5UF9QUWhlek9KYjVLeUdiV19kOXB4RUlBNjc1dWNFM0RTTXhiSkFHLVdNSkdxN09SYTgycw?oc=5",
//         "date": "Wed, 06 May 2026",
//         "source": "Business Standard",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "Trade Spotlight: How should you trade Indus Towers, NMDC, Max Healthcare, BSE, KEI Industries, and others... - Moneycontrol.com",
//         "summary": "Trade Spotlight: How should you trade Indus Towers, NMDC, Max Healthcare, BSE, KEI Industries, and others...&nbsp;&nbsp;Moneycontrol.com",
//         "link": "https://news.google.com/rss/articles/CBMihAJBVV95cUxObHpOOTM0ek1vVnowRlpSVWlSRHkwYzVkUC1iWEo5ZzNEcVNTa3JyendYSmZOX01HREF2aGlKa3JNM2ZXa21INzktMWYxVlJ3VXF3T29QTmhDektpSWtqT3NmUW1WdVhSa01OOEk1MEZKSUhXZnpwZU1OVjN0YndNbk8xM3k3elVWU1NQd1hfekNnZ05OVnJOeG16eC1KMXdNVHBIdFY5Tkw1clNVcEZJeEJidEpHZXl2aVZFTkdQNXgyalBxcFdlVHBwYk9VY2dRTm0taktMbVFVZEo5UndrOW9YWVgzenBzZkdBanlUdjNDQlc3cW91cjgyb3ZRWnc0cDFVedIBigJBVV95cUxOZVJnY3ZaazFjd3lTdGJMMEFpUU5mTXBnTHFyWm1DbUlYSW1Cc19QV0FVMHRDMWlPemxzVnVQaFdHQXBneHhJMzZqYzlUZVFJREtqWnF1RUF1RGlaSzhmNHdHLUJLRlRkTlNkb3paMUYwM1d6bkNubjExQzRMYUU4X1ZsM1RFTXJfclZLYXdwaGViajBNM1FZZnhwQzJzZWRXSHM3ZGVBcWhZV1MxdDVyYV9PeFduM0RZWHNXbkFMM3lsSlBhQ2tBaE90SDYzUlN6eUE0aVNXMU8tejFMbk5UclYtaTJzVDd3ZG9PaDJlS2kyellXSFRSZmZ3S2ZuMlRvYXlpUmNhalNtUQ?oc=5",
//         "date": "Fri, 15 May 2026",
//         "source": "Moneycontrol.com",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "Tata Steel, Jindal Steel, JSW Steel, SAIL, NMDC: Target prices for 5 stocks - Business Today",
//         "summary": "Tata Steel, Jindal Steel, JSW Steel, SAIL, NMDC: Target prices for 5 stocks&nbsp;&nbsp;Business Today",
//         "link": "https://news.google.com/rss/articles/CBMi1AFBVV95cUxOY2Nyem1FZ214QnNMQjhRT0hGdTJSOGlJNmdTUmtJZ2p1Qldyb25oTjVGblM4ZkhIQm95TzhnN1A2Y3JTODlneGU2STlwSjNpMDhaN3ZFZzNNSjQ1NktzZ2JZM2NSeHphMW9VNi1EQXFaRV91ZHFZaGhBbm96TXp2WThmellpSk5vWlFaM2pCV0hoTzNfTXpLRWoxMV9pQUlSRlpQUzhEcV9EekNiWWhxUEJuNmdKcnc3SjhWZUJtYU9NZEppa0ZucWlKNF9jMmJ3VFhvS9IB2gFBVV95cUxQMzNtSHN5R1p6VGc5SFgxN1VfNGtVZklXaWUxbXJkRENZSmxVcEFLaEcwbkR4ZUU5N3gzTDMtYXNQeDY5M0ZOMjJNMTN3LVliWG5NTFlvT1FING9VQ1ZCTm9BeWVPaHplQkNOWFhGTTVFckY3dGJULVNaV2xVU200d25iczE4cUZWcUtBYWMwenk2anRfYmw0NVJrMTFWWEc3a2NtWlVGVGR0TllRdmdfbzZZYWhiOHVTbS1rM0p2ZmROcEpxV0R1RkZhYThqWlo3S25EMkpTbVMydw?oc=5",
//         "date": "Fri, 24 Apr 2026",
//         "source": "Business Today",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "NMDC Historical Data - Equitypandit",
//         "summary": "NMDC Historical Data&nbsp;&nbsp;Equitypandit",
//         "link": "https://news.google.com/rss/articles/CBMiXkFVX3lxTFBNMTB6V2hISG1UWXBvSGFweXNVS3VmVHFtS1FYWVBaZmM0RWNLZVhpN0FhWFhGNVRaeWE1X0xJa25lQkxnTng0NnV0Sncxc0Z3ZlFqRmhUb1NnMVpTS0E?oc=5",
//         "date": "Wed, 10 Sep 2025",
//         "source": "Equitypandit",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "NMDC Limited's (NSE:NMDC) largest shareholders are state or government with 61% ownership, institutions own 20% - simplywall.st",
//         "summary": "NMDC Limited's (NSE:NMDC) largest shareholders are state or government with 61% ownership, institutions own 20%&nbsp;&nbsp;simplywall.st",
//         "link": "https://news.google.com/rss/articles/CBMiygFBVV95cUxQbldOZVVRZ25OVjRqRmNhb3NkRURMWXAyVEYyTU16bUlzUDdQVDdqRmQtLTZXbFVfeFRQNzBycWk5aTJJSEdNanNwdWFpNVJYc1BiaGdWbjgxdHJBcE9EM2ZtZEVEVXdocnB6Sk1pdVBIVnRFbUttSWh1cXV2a3BRaEZUQlJ2QmxxUlZLd1B3RkJEaFc3cHRMZkpqZk8zelYxYldJRHZzZnJCOVdHMTFZcTNaaUVqSjJyYzc2dUpBZl9JS3hDU1k1TUNR0gHPAUFVX3lxTFBhWHE4YU43VTVPZ2hSZm9CNHJUUTkwQURoWkVCMkNrODRrU1M0anRMX2FZMzI2LXNTbHFpM2FUa2ZHTkRtX1NUQV92OGg2X2hSVDNtWGhNSzZMTS1lUlNWWUdIa3ptb2NPeUg4VGF3cURtOWtrdFdfa0xnZGF4ak1rMVMteHJKcUZmd0xTN2dXenhUOTM3SkNEVjZBQnZIU1E4OTUyNHh6bWRtS0tuZEp0blA4ZmxJVjh4VVhSVURDOE1UcGRSTDFpNlZ3Y3pmUQ?oc=5",
//         "date": "Tue, 13 Jan 2026",
//         "source": "simplywall.st",
//         "sentiment": "NEUTRAL",
//         "compound": 0,
//         "vader_compound": 0,
//         "boost": 0,
//         "impact": 1,
//         "category": "Management",
//         "reason": "Neutral / informational news, limited price impact expected."
//       },
//       {
//         "title": "Reduce Persistent Systems; target of Rs 3700: Emkay Global Financial",
//         "summary": "Emkay Global Financial recommended reduce rating on Persistent Systems with a target price of Rs 3700 in its research report dated April 22, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/reduce-persistent-systems-targetrs-3700-emkay-global-financial_17531581.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.121,
//         "vader_compound": 0.202,
//         "boost": 0,
//         "impact": 1,
//         "category": "Analyst",
//         "reason": "Positive tone detected in headline language."
//       },
//       {
//         "title": "Reduce Aditya Birla Fashion and Retail; target of Rs 230: Emkay Global Financial",
//         "summary": "Emkay Global Financial recommended reduce rating on Aditya Birla Fashion and Retail with a target price of Rs 230 in its research report dated April 23, 2024.",
//         "link": "https://www.moneycontrol.com/news/recommendations/reduce-aditya-birla-fashionretail-targetrs-230-emkay-global-financial_17531571.html",
//         "date": "Tue, 23 Apr 2024",
//         "source": "Moneycontrol",
//         "sentiment": "POSITIVE",
//         "compound": 0.121,
//         "vader_compound": 0.202,
//         "boost": 0,
//         "impact": 1,
//         "category": "Analyst",
//         "reason": "Positive tone detected in headline language."
//       }
//     ],
//     "vader_available": true,
//     "error": ""
//   }
// }
//   return res;
  
// }

// for chart
async function getChart(symbol){
  const res = await axios.get(`${BASE_URL}/chart/${symbol}`);
  return res.data;
}


async function fetchCurrPrice(symbols){
  console.log(symbols);
  const res = await axios.post(`${BASE_URL}/fetch/price` , 
      symbols
    );
  return res.data;
} 

async function searchStock(q){
  const res = await axios.get(`${BASE_URL}/search?q=${q}`);
  return res.data;
}
async function getIndicesData(){
  const res = await axios.get(`${BASE_URL}/indices/data`);
  return  res.data;
}

// async function getIndicesData(){
//   const res = {
//   "NIFTY 50": {
//     "price": 24013.1,
//     "close": 24013.1,
//     "change_percent": 0.09,
//     "open": 23991.2,
//     "high": 24047.2,
//     "low": 23901.9,
//     "w52l": 22182.55,
//     "w52h": 26373.2,
//     "dist_52w": 8.95,
//     "volume": 447900,
//     "vol_ratio": "N/A",
//     "source": "yfinance"
//   },
//   "NIFTY BANK": {
//     "price": 57685.75,
//     "close": 57685.75,
//     "change_percent": -0.12,
//     "open": 57754.95,
//     "high": 57804.9,
//     "low": 57464.55,
//     "w52l": 49954.85,
//     "w52h": 61764.85,
//     "dist_52w": 6.6,
//     "volume": 285800,
//     "vol_ratio": "N/A",
//     "source": "yfinance"
//   },
//   "NIFTY NEXT 50": {
//     "price": 72356.65,
//     "close": 72356.65,
//     "change_percent": -0.07,
//     "open": 72408.6,
//     "high": 72604.1,
//     "low": 71982.3,
//     "w52l": 35018.2,
//     "w52h": 72604.1,
//     "dist_52w": 0.34,
//     "volume": 0,
//     "vol_ratio": "N/A",
//     "source": "yfinance"
//   },
//   "INDIA VIX": {
//     "price": 12.97,
//     "close": 12.97,
//     "change_percent": 2.37,
//     "open": 12.67,
//     "high": 13.64,
//     "low": 12.07,
//     "w52l": 8.86,
//     "w52h": 28.91,
//     "dist_52w": 55.14,
//     "volume": 0,
//     "vol_ratio": "N/A",
//     "source": "yfinance"
//   }
// }
//   return  res;
// }
async function runFullScanAdmin(){
  const res = await axios.get(`${BASE_URL}/runfullscan`)
  return res.data;
}


async function getCandlesticksStock(){
  const res = await axios.get(`${BASE_URL}/candlesticks/stocks`);
  return res.data;
}

async function getReversalPatternStock(){
  const res = await axios.get(`${BASE_URL}/reversal/stocks`);
  return res.data;
}

async function getContPatternStock(){
  const res = await axios.get(`${BASE_URL}/continuation/stocks`);
  return res.data;
}

async function finRecommends(){
  const res = await axios.get(`${BASE_URL}/fin/recommends`);
  return res.data;
}

// ✅ Custom scan (POST)
async function customScan(symbols) {
  const res = await axios.post(`${BASE_URL}/scan`, {
    symbols: symbols,
    timeframe: "1h"
  });
  return res;
}

module.exports = {
  getSignals,
  fetchCurrPrice,
  getSignalForStock,
  getChart , 
  customScan,
  getFundamentals,
  getTopStocks,
  get_ai_analysis,
  runBacktest,
  getRisks,
  searchStock ,
  getSectorAnalysis,
  getIndicesData,
  getCandlesticksStock,
  getReversalPatternStock,
  getContPatternStock,
  finRecommends,
  runFullScanAdmin
  

};