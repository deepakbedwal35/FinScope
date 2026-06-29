import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

const ENTRY_TYPE_STYLE = {
  IMMEDIATE: { label: "Immediate", color: "#3dd68c", bg: "rgba(61,214,140,0.1)" },
  LIMIT:     { label: "Limit",     color: "#7c6af7", bg: "rgba(124,106,247,0.1)" },
  WAIT:      { label: "Wait",      color: "#f5a623", bg: "rgba(245,166,35,0.1)" },
  BREAKOUT:  { label: "Breakout",  color: "#e06cf5", bg: "rgba(224,108,245,0.1)" },
};

export default function EntryCard({ signal }) {
  const [expanded, setExpanded] = useState(false);

  const {
    name,  entry, sl, t1, t2, t3,
    rr_t1, rr_t2, entry_type, condition,
    confidence, reasoning, risk_pct, r1_pct, r2_pct,
    rr_ok, bars_ago, decay_note,
  } = signal;

  const typeStyle = ENTRY_TYPE_STYLE[entry_type] || ENTRY_TYPE_STYLE.LIMIT;

  return (
    <div className="bg-neutral-800/50 mt-2 rounded-xl mb-2 overflow-hidden border border-neutral-700">
      {/* ── Collapsed header — always visible ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-800/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* <span className="text-lg shrink-0">{emoji}</span> */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-white truncate">{name}</span>
              {!rr_ok && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 shrink-0">
                  R:R unfavorable
                </span>
              )}
              {bars_ago > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-700 text-gray-400 shrink-0">
                  {bars_ago}d old
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 truncate mt-0.5">{condition}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span
            className="text-[11px] font-medium px-2 py-1 rounded-full"
            style={{ color: typeStyle.color, background: typeStyle.bg }}
          >
            {typeStyle.label}
          </span>
          <div className="text-right">
            <div className="text-sm font-medium text-white">{confidence}%</div>
          </div>
          <IconChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-neutral-700">
          <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
            <MiniStat label="Entry" value={`₹${entry}`} />
            <MiniStat label="Stop loss" value={`₹${sl}`} color="#f75f5f" />
            <MiniStat label="Target 1" value={`₹${t1}`} color="#3dd68c" />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <MiniStat label="R:R T1" value={rr_t1} />
            <MiniStat label="R:R T2" value={rr_t2} />
            <MiniStat label="Target 2" value={`₹${t2}`} color="#3dd68c" />
          </div>

          <div className="bg-neutral-900 rounded-lg p-3 text-xs text-gray-300 leading-relaxed">
            {reasoning}
          </div>

          {decay_note && (
            <div className="text-xs text-amber-400 mt-2">{decay_note}</div>
          )}

          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span>Risk: <span className="text-red-400">{risk_pct}%</span></span>
            <span>R1: <span className="text-green-400">{r1_pct}%</span></span>
            <span>R2: <span className="text-green-400">{r2_pct}%</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="bg-neutral-900 rounded-lg p-2">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="text-sm font-medium" style={{ color: color || "white" }}>
        {value}
      </div>
    </div>
  );
}