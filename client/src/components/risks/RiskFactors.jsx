export default function RiskFactors({allRisks}){
     const sliderStyle = " flex flex-row  gap-4  min-w-[500px]  overflow-x-auto whitespace-nowrap scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out" 

    return (
        <div className="">
            <div className="pl-7 text-purple-500">Risk Factors</div>
            {!allRisks && <div className="text-center text-sm font-medium text-gray-400"> No Risk Present </div>}
            {allRisks && <div className={`flex    pl-8 pr-8 m-2 gap-2 ${sliderStyle}` }>
                {allRisks?.map((details , index)=>(
                    <div key={index} className={`rounded-xl min-w-[500px] flex gap-3 justify-between flex-col  m-2 border border-white/20 font-medium py-4 px-2 text-sm ${details?.severity == "HIGH" ? "bg-red-900/20 text-red-400":"bg-yellow-900/20 text-yellow-200"}` }>
                        <div className="flex  justify-between items-center ">
                            <div className="pl-4 whitespace-normal">{details?.title}</div>
                            <div className="px-2 py-1 rounded-lg text-end  mr-4 bg-red-900/50 ">{details?.severity}</div>
                        </div>
                         <div className="py-1 pb-1 px-5 font-light whitespace-normal text-gray-400"> {details?.description}</div>
                         <div className="px-5 font-light whitespace-normal text-gray-100"><span className="font-medium">Action: </span>{details?.action}</div>
                 
                    </div>
                ))}         
                 </div>}

        </div>
    )
}


//  [
//       {
//         "severity": "HIGH",
//         "category": "Trend",
//         "emoji": "📏",
//         "title": "Uptrend Line BROKEN",
//         "description": "Price closed below rising trendline (₹433.3). Possible reversal. Murphy Ch.4: 'Close below trendline = warning of trend change.'",
//         "action": "Do not enter long. Wait for price to reclaim trendline.",
//         "color": "#f75f5f"
//       },
//       {
//         "severity": "MEDIUM",
//         "category": "Technical",
//         "emoji": "📊",
//         "title": "MACD Momentum BEARISH",
//         "description": "MACD signal: BEARISH. Upward momentum is slowing. May not be best entry timing.",
//         "action": "Wait for MACD to turn bullish before entering.",
//         "color": "#f5a623"
//       },
//       {
//         "severity": "MEDIUM",
//         "category": "Pattern",
//         "emoji": "🔻",
//         "title": "DOUBLE TOP Pattern Detected",
//         "description": "Double Top (M): Peak1=₹473.5 | Peak2=₹464.4 | Valley=₹399.4\nWatch for break below ₹399.4 Confidence: 50%. Murphy Ch.5: 'Reversal patterns signal end of trend.'",
//         "action": "Watching — tighten SL to ₹399.35 Target: ₹329.78",
//         "color": "#f5a623"
//       }
//     ]