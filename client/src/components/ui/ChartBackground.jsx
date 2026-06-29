export default function ChartBg(){

    return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
    
    {/* Subtle grid */}
    <div className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(rgba(16,185,129,0.05) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(16,185,129,0.05) 1px, transparent 1px)`,
        backgroundSize: "40px 40px"
      }}
    />

    {/* Glowing orb */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

    {/* Content on top */}
    <div className="relative z-10 text-center px-10">
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-emerald-400 font-bold text-3xl">Fin</span>
        <span className="text-white font-bold text-3xl">Scope</span>
      </div>
      <p className="text-slate-400 text-lg leading-relaxed">
        Scan. Analyze. Trade smarter.
      </p>

      {/* Fake sparkline chart */}
      <svg viewBox="0 0 300 80" className="mt-10 w-72 opacity-40">
        <polyline
          points="0,60 40,45 80,50 120,20 160,35 200,15 240,25 300,10"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Gradient fill under line */}
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon
          points="0,60 40,45 80,50 120,20 160,35 200,15 240,25 300,10 300,80 0,80"
          fill="url(#chartFill)"
        />
      </svg>

      {/* Stats row */}
      <div className="flex gap-8 mt-8 justify-center">
        {[
          { label: "Stocks Tracked", value: "1000+" },
          { label: "Signals Daily",  value: "50+"   },
          { label: "Accuracy",       value: "78%"   },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-emerald-400 font-bold text-xl">{value}</div>
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
    )
}