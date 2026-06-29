import { useState } from "react";

export default function AnalysisCard({ type, value, comment }) {
  // Map values dynamically to correct status styling schemes
  const [showFullComment , setFullComment] = useState(false)
  const statusStyles = {
    POSITIVE: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
    BULLISH:  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
    NEUTRAL:  { text: "text-zinc-400",    bg: "bg-zinc-800/40",    border: "border-zinc-800" },
    MODERATE: { text: "text-zinc-400",    bg: "bg-zinc-800/40",    border: "border-zinc-800" },
    NEGATIVE: { text: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/10" },
    BEARISH:  { text: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/10" },
    STRONG:  { text: "text-green-400",    bg: "bg-green-400/10",    border: "border-green-500/10" },
    MIXED:  { text: "text-amber-400",    bg: "bg-amber-500/10",    border: "border-amber-500/10" },
  };

  const key = String(value || "").toUpperCase();
  const currentStyle = statusStyles[key] || { text: "text-zinc-400", bg: "bg-neutral-800", border: "border-neutral-700" };

  return (
    <div onClick={()=>setFullComment(!showFullComment)} className="bg-neutral-950/40 border border-neutral-800/80 p-4 rounded-xl flex flex-col gap-2.5 h-full transition-all duration-200 hover:border-neutral-700/60">
      
   
      <div className="flex flex-row justify-between items-center border-b border-neutral-900 pb-2">
        <span className="text-[11px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
          {type}
        </span>
        
       
        <span className={`text-[10px] font-black font-mono tracking-wider px-2 py-0.5 border rounded-md uppercase ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
          {value || "N/A"}
        </span>
      </div>

    
      {comment && (
        <p  className={`text-xs font-normal text-zinc-400 leading-relaxed tracking-wide  ${!showFullComment ? "line-clamp-3" : ""}`}>
          {comment}
        </p>
      )}

    </div>
  );
}
