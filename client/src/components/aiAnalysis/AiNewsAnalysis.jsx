import { useState } from "react";
import News from "./News"; 
import { Tooltip } from "@mui/material";
import ComparableStocks from "./ComparableStocks";

export default function AiNewsAnalysis({ aiNewsAnalysis , comparable_stocks}) {
  const [isExpand, setExpand] = useState(false);

  const sentimentUI = {
    POSITIVE: {
      text: "text-green-400",
      bg: "bg-green-950/20",
      icon: "🟢",
      label: "Positive",
      border: "border-green-500/20",
    },
    NEGATIVE: {
      text: "text-red-400",
      bg: "bg-red-950/20",
      icon: "🔴",
      label: "Negative",
      border: "border-red-500/20",
    },
    NEUTRAL: {
      text: "text-yellow-400",
      bg: "bg-yellow-950/20",
      icon: "🟡",
      label: "Neutral",
      border: "border-yellow-500/20",
    },
  };

  const sentiment = sentimentUI[aiNewsAnalysis?.overall_news_sentiment] || {
    text: "text-gray-400",
    bg: "bg-neutral-800/40",
    icon: "⚪",
    label: "Unknown",
    border: "border-neutral-700/40",
  };

  // Check if any granular news columns actually contain data
  const hasSubNews = 
    (aiNewsAnalysis?.positive?.length > 0) || 
    (aiNewsAnalysis?.negative?.length > 0) || 
    (aiNewsAnalysis?.neutral?.length > 0);

  return (
    <div className="flex flex-col gap-4 font-sans tracking-wide text-zinc-100 p-2">
      
      {/* SECTION 1: OVERALL ANALYSIS SUMMARY HERO */}
      <div className="bg-neutral-900/50 backdrop-blur-md p-5 rounded-xl border border-neutral-800/50">
        <div className="text-base font-bold tracking-wider uppercase text-neutral-400 mb-4 px-1">
          Overall News Analysis
        </div>
        
        <Tooltip 
          title={!isExpand ? "Click to expand details" : "Click to collapse details"} 
          placement="top" 
          arrow
        >
          <div 
            onClick={() => setExpand(!isExpand)} 
            className={`border cursor-pointer transition-all duration-300 hover:scale-[1.005] flex flex-col rounded-xl p-5 md:mx-6 ${sentiment.border} ${sentiment.bg}`}
          >
            <div className={`text-base font-bold tracking-wide flex items-center gap-2 mb-2 ${sentiment.text}`}>
              <span>{sentiment.icon}</span>
              <span className="uppercase tracking-widest text-sm">{sentiment.label} Sentiment</span>
            </div>
            
           
            <div className="text-zinc-300 text-sm font-normal leading-relaxed mb-4">
              {aiNewsAnalysis?.news_summary}
            </div>

            
            
            <div className="flex justify-end items-center gap-1.5 border-t border-neutral-800/40 pt-3 mt-1 text-xs font-mono">
              <span className="text-neutral-500">OVERALL NEWS SCORE:</span>
              <span className={`${sentiment.text} font-bold text-sm`}>
                {aiNewsAnalysis?.overall_news_score ? `${aiNewsAnalysis.overall_news_score}.0` : "N/A"}
              </span>
            </div>
          </div>
        </Tooltip>
      </div>

     
      {isExpand && (
        <div className="transition-all duration-500 ease-in-out">
          {!hasSubNews ? (
            <div className="text-center text-xs tracking-wider font-mono text-neutral-600 bg-neutral-900/30 rounded-xl py-8 italic border border-neutral-900">
              No detailed classification logs generated for this asset window
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-xl p-2">
                <News type="Positive" newsDetail={aiNewsAnalysis?.positive || []} />
              </div>
              <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-xl p-2">
                <News type="Negative" newsDetail={aiNewsAnalysis?.negative || []} />
              </div>
              <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-xl p-2">
                <News type="Neutral" newsDetail={aiNewsAnalysis?.neutral || []} />
              </div>
            </div>
          )}
        </div>
      )}

  
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  
        <div className="bg-neutral-900/40 border border-neutral-800/40 p-5 rounded-xl flex flex-col gap-3">
          <div className="text-sm font-bold tracking-wider uppercase text-neutral-400 border-b border-neutral-800 pb-2">
            Upcoming Events
          </div>
          {!aiNewsAnalysis?.key_upcoming_events?.length ? (
            <div className="text-xs text-neutral-600 italic py-4">No major events scheduled</div>
          ) : (
            <ol className="list-decimal list-inside space-y-2.5">
              {aiNewsAnalysis.key_upcoming_events.map((event, index) => (
                <li key={`event-${index}`} className="text-sm font-normal text-zinc-300 leading-normal pl-1">
                  {event}
                </li>
              ))}
            </ol>
          )}
        </div>

    
        <div className="bg-neutral-900/40 border border-neutral-800/40 p-5 rounded-xl flex flex-col gap-3">
          <div className="text-sm font-bold tracking-wider uppercase text-neutral-400 border-b border-neutral-800 pb-2">
            Recent Price Drivers
          </div>
          {!aiNewsAnalysis?.recent_price_drivers?.length ? (
            <div className="text-xs text-neutral-600 italic py-4">No dominant momentum drivers logged</div>
          ) : (
            <ul className="list-disc space-y-2.5 list-inside">
              {aiNewsAnalysis.recent_price_drivers.map((driver, index) => (
                <li key={`driver-${index}`} className="text-sm font-normal text-zinc-300 leading-normal pl-1">
                  {driver}
                </li>
              ))}
            </ul>
          )}
        </div>
          <div className="">
             
             <ComparableStocks comparable_stocks={comparable_stocks}/>

          </div>
        

        


      </div>
        
    </div>
  );
}
