import ActionPlan from "./ActionPlan";
import AnalysisCard from "./AnalysisCard";

export default function AiDecision({ decision }) {
  const VERDICT_CONFIG = {
    STRONG_BUY: { text: "text-emerald-400", bg: "bg-emerald-950/20", border: "border-emerald-500/20", emoji: "🚀🚀", label: "STRONG BUY" },
    BUY: { text: "text-green-400", bg: "bg-green-950/20", border: "border-green-500/20", emoji: "🚀", label: "BUY" },
    BUY_ON_DIP: { text: "text-indigo-400", bg: "bg-indigo-950/20", border: "border-indigo-500/20", emoji: "📉⬆️", label: "BUY ON DIP" },
    HOLD: { text: "text-amber-400", bg: "bg-amber-950/20", border: "border-amber-500/20", emoji: "✋", label: "HOLD" },
    AVOID: { text: "text-orange-400", bg: "bg-orange-950/20", border: "border-orange-500/20", emoji: "⚠️", label: "AVOID" },
    STRONG_AVOID: { text: "text-red-400", bg: "bg-red-950/20", border: "border-red-500/20", emoji: "🚫🚫", label: "STRONG AVOID" },
    UNKNOWN: { text: "text-zinc-400", bg: "bg-zinc-900/40", border: "border-zinc-800", emoji: "❓", label: "UNKNOWN" },
  };

  const currentVerdict = VERDICT_CONFIG[decision?.verdict] || VERDICT_CONFIG.UNKNOWN;

  return (
    <div className="p-6 bg-neutral-900/50 border border-neutral-800/20 rounded-2xl text-zinc-100 font-sans w-full  mx-auto flex flex-col gap-6">
      

      <div className="text-base font-bold tracking-wider uppercase text-neutral-400 pb-2 border-b border-neutral-800/40">
        AI Trading Engine Verdict
      </div>

     
      <div className={`p-6 rounded-2xl border backdrop-blur-sm border-white/10 bg-neutral-950 flex flex-col gap-4`}>
        
      
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className={`text-2xl font-black tracking-widest flex items-center gap-2 ${currentVerdict.text}`}>
             
              <span>{currentVerdict.label}</span>
            </div>
            <div className="text-sm font-normal text-zinc-300 max-w-2xl leading-relaxed mt-1">
              {decision?.one_liner}
            </div>
          </div>
          
        
          <div className="flex flex-row md:flex-col gap-4 md:gap-1.5 md:items-end text-xs font-mono text-zinc-500 whitespace-nowrap bg-neutral-950/30 p-3 rounded-xl border border-neutral-800/30">
            <div>TIMEFRAME: <span className="text-zinc-300 font-bold">{decision?.timeframe}</span></div>
            <div>GENERATED: <span className="text-zinc-300 font-bold">{decision?.timestamp}</span></div>
            <div>CONFIDENCE: <span className={`${currentVerdict.text} font-bold`}>{decision?.confidence}%</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
          <AnalysisCard type="FUNDAMENTAL" value={decision?.fundamental_view} comment={decision?.fundamental_comment} />
          <AnalysisCard type="TECHNICAL" value={decision?.technical_view} comment={decision?.technical_comment} />
          <AnalysisCard type="NEWS FLOW" value={decision?.news_view} comment={decision?.news_comment} />
        </div>

        
        <div className="mt-2">
          <ActionPlan actionPlan={decision?.action_plan} score={decision?.overall_score} confidence={decision?.confidence} />
        </div>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-950/30 p-4 rounded-xl border border-neutral-800/30">
        <div className="p-3 bg-neutral-900/30 rounded-lg border border-emerald-950/20">
          <div className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-2">Bull Catalysts</div>
          <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
            {decision?.bull_case?.map((item, i) => <li key={`bull-${i}`}>{item}</li>)}
          </ul>
        </div>
        <div className="p-3 bg-neutral-900/30 rounded-lg border border-rose-950/20">
          <div className="text-xs font-bold font-mono tracking-widest text-rose-400 uppercase mb-2">Bear Risk Factors</div>
          <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
            {decision?.bear_case?.map((item, i) => <li key={`bear-${i}`}>{item}</li>)}
          </ul>
        </div>
      </div>

      {/* Comprehensive Deep-Dive Analytical Reasoning Blocks */}
      <div className="bg-neutral-950/40 p-5 rounded-xl border border-neutral-800/40 flex flex-col gap-3">
        <div className="text-sm font-bold tracking-wider uppercase text-neutral-400">Detailed Structural Reasoning</div>
        <div className="text-sm text-zinc-400 leading-relaxed space-y-3 font-normal">
          <p className="pl-1 border-l-2 border-indigo-500/40 py-0.5">{decision?.reasoning}</p>
          <p className="pl-1 border-l-2 border-emerald-500/40 py-0.5">{decision?.reasoning2}</p>
          <p className="pl-1 border-l-2 border-rose-500/40 py-0.5">{decision?.reasoning3}</p>
        </div>
        
        {/* Additional Strategy Metadata Footnote Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-3 border-t border-neutral-900 text-xs text-zinc-500 font-mono">
          <div>SECTOR BIAS: <span className="text-zinc-400 font-sans normal-case">{decision?.sector_view}</span></div>
          <div className="md:text-right">RED FLAGS: <span className="text-rose-400 uppercase font-bold">{decision?.red_flags?.join(', ') || 'NONE'}</span></div>
        </div>
      </div>

    </div>
  );
}
