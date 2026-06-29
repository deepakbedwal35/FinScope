import {useState , useEffect} from "react";
import {toast} from "react-hot-toast";
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
export default function MtfBlock({tf}){
    const [isExpand , setExpand] = useState(false);
    return(
        <div className={`py-2 ml-6 flex flex-col mr-6  my-1  bg-amber-950/40 text-center rounded-lg text-lg font-medium ${tf?.direction ? "bg-green-900/20 text-green-400":"bg-red-950/20 text-red-400"}`}>
            <div className="text-sm text-gray-400">{tf?.label}</div>
            <div className="text-2xl py-5">{tf?.direction}</div>
            <div className="text-sm pb-1 text-gray-200"><span className="text-gray-500">Strength : </span>{tf?.strength}</div>
            <div className="text-sm py-1"><span className="text-gray-500">Score : </span>{tf?.score}</div>
            


        </div>
    )

}


// "mtf": {
//     "short": {
//       "label": "Short Term (1–4 Weeks)",
//       "direction": "BEARISH",
//       "strength": "MODERATE",
//       "score": -2,
//       "signals": [
//         "RSI 35 weak ❌"
//       ],
//       "entry_note": "Avoid long entries in this timeframe",
//       "color": "#f75f5f",
//       "emoji": "🔴⬇️",
//       "summary": "BEARISH (MODERATE) — Score -2 | RSI 35 weak ❌",
//       "cmp": 416.5,
//       "ma20": 441.63,
//       "ma50": 435.4,
//       "ma200": 435.4,
//       "rsi": 34.55
//     },
//     "medium": {
//       "label": "Medium Term (1–3 Months)",
//       "direction": "BEARISH",
//       "strength": "MODERATE",
//       "score": -1,
//       "signals": [
//         "MA50 > MA200 (Golden)",
//         "RSI 35 weak ❌",
//         "MACD < Signal"
//       ],
//       "entry_note": "Avoid long entries in this timeframe",
//       "color": "#f75f5f",
//       "emoji": "🔴⬇️",
//       "summary": "BEARISH (MODERATE) — Score -1 | MA50 > MA200 (Golden) · RSI 35 weak ❌ · MACD < Signal",
//       "cmp": 416.5,
//       "ma20": 441.63,
//       "ma50": 438.04,
//       "ma200": 430.97,
//       "rsi": 35.42
//     },
//     "long": {
//       "label": "Long Term (6+ Months)",
//       "direction": "BULLISH",
//       "strength": "MODERATE",
//       "score": 7,
//       "signals": [
//         "Above MA50",
//         "Above MA200 ✅",
//         "MA50 > MA200 (Golden)",
//         "MACD < Signal",
//         "MACD above zero"
//       ],
//       "entry_note": "Good entry near MA20 ≈ ₹431.2",
//       "color": "#7c6af7",
//       "emoji": "🟣⬆️",
//       "summary": "BULLISH (MODERATE) — Score 7 | Above MA50 · Above MA200 ✅ · MA50 > MA200 (Golden)",
//       "cmp": 416.5,
//       "ma20": 431.2,
//       "ma50": 412.16,
//       "ma200": 410.99,
//       "rsi": 47.58
//     },
//     "alignment": "MOSTLY BEARISH",
//     "align_color": "#f75f5f",
//     "align_emoji": "🔴🔴🟡",
//     "align_desc": "2 of 3 timeframes bearish. Not a good environment for longs.",
//     "confidence": "AVOID",
//     "best_tf": null
//   }