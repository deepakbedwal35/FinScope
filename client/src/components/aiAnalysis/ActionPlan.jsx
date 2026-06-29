export default function ActionPlan({ actionPlan, score, confidence }) {
  if (!actionPlan) return null;

  return (
    <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-5 flex flex-col gap-4">
      
   
      <div className="flex flex-row justify-between items-center border-b border-neutral-900 pb-3">
        <div className="flex flex-col gap-0.5">
          <div className="text-base font-bold tracking-wider uppercase text-zinc-300">Execution Strategy</div>
          <div className="text-xs text-zinc-500 font-mono">SIZING PROFILE: <span className="text-indigo-400 uppercase font-bold">{actionPlan.position_sizing}</span></div>
        </div>
        
       
        <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800/60">
          <span className="text-xs font-mono text-neutral-500 tracking-wider">SYSTEM SCORE:</span>
          <span className={`text-xl font-black font-mono ${
            score > 75 ? "text-emerald-400" : score > 50 ? "text-green-400" : score > 40 ? "text-yellow-400" : "text-rose-400"
          }`}>
            {score}
          </span>
        </div>
      </div>

    
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
     
        <div className="flex flex-col justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center gap-1">
          <div className="text-[10px] font-bold tracking-widest font-mono text-zinc-500 uppercase">Target Entry</div>
          <div className="text-xl font-extrabold font-mono text-zinc-200">
            ₹{actionPlan.entry_price ? actionPlan.entry_price.toFixed(2) : "0.00"}
          </div>
          <div className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/10 uppercase mx-auto">
            {actionPlan.entry_strategy || "IMMEDIATE"}
          </div>
        </div>

       
        <div className="flex flex-col justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center gap-1">
          <div className="text-[10px] font-bold tracking-widest font-mono text-zinc-500 uppercase">Protective Stop</div>
          <div className="text-xl font-extrabold font-mono text-rose-400">
            ₹{actionPlan.sl_price ? actionPlan.sl_price.toFixed(2) : "0.00"}
          </div>
          <div className="text-[10px] font-bold font-mono text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/10 uppercase mx-auto">
            HARD STOP
          </div>
        </div>

       
        <div className="flex flex-col justify-center p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center gap-1.5">
          <div className="text-[10px] font-bold tracking-widest font-mono text-zinc-500 uppercase">Take Profit Objectives</div>
          <div className="flex items-center justify-center gap-3 text-sm font-bold font-mono text-zinc-300">
            <div className="bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
              T1: <span className="text-emerald-400">₹{actionPlan.t1_price?.toFixed(2)}</span>
            </div>
            <div className="bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
              T2: <span className="text-emerald-400">₹{actionPlan.t2_price?.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-zinc-400 font-normal leading-relaxed">
        <div className="bg-neutral-900/30 p-3 rounded-lg border border-neutral-900">
          <span className="font-bold text-zinc-500 font-mono block mb-0.5 uppercase tracking-wide">Stop Loss Reason:</span>
          {actionPlan?.sl_reasoning}
        </div>
        <div className="bg-neutral-900/30 p-3 rounded-lg border border-neutral-900">
          <span className="font-bold text-zinc-500 font-mono block mb-0.5 uppercase tracking-wide">Exit Parameters:</span>
          {actionPlan?.exit_strategy}
        </div>
      </div>

    </div>
  );
}
