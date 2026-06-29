import MtfBlock from "./MtfBlock";

export default function MultiTimeFrame({mtf}){
    return(
        <div className="pl-7 font-medium">
            <div className=" text-purple-500">Multi-Timeframe Analysis</div>
            <div className=" p-4 m-4 rounded-xl bg-green-950/40 " style={{color:mtf?.align_color}}>
                <div className="font-bold tracking-widest text-[18px]">{mtf?.alignment}</div>
                <div className="text-sm p-1 text-gray-400">{mtf?.align_desc}</div>
                <div className="flex text-sm font-medium pt-2 pl-2 gap-4">

                    <div className="text-sm font-medium "><span className="text-gray-300">Confidence : </span>{mtf?.confidence}</div>
                    {mtf?.best_tf && <div><span className="text-gray-300">Best timeframe : </span>{mtf?.best_tf}</div>}    
                </div>
            </div>
            <div className="grid grid-cols-3 ">
                <MtfBlock tf = {mtf?.short}/>
                <MtfBlock tf = {mtf?.medium}/>
                <MtfBlock tf = {mtf?.long}/>
            
               
                
                
            
    
                
            </div>
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