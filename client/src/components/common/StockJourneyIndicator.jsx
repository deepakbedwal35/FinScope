import React from "react";
import { Link } from "react-router-dom";
import { Brain, History, ShieldAlert } from "lucide-react";

/**
 * 3-stage user journey indicator for the Stock Details deep dive:
 * 1. Understand (Overview, AI Analysis, Fundamentals, Patterns)
 * 2. Validate (Backtest)
 * 3. Manage risk (Trade Setup)
 */
export default function StockJourneyIndicator({ activeTab, onSelectTab }) {
  const isUnderstand = ["Overview", "AI Analysis", "Fundamentals", "Patterns"].includes(activeTab);
  const isValidate = activeTab === "Backtest";
  const isManageRisk = activeTab === "Trade Setup";

  return (
    <div className="mx-4 mb-3 p-2.5 bg-neutral-900/90 border border-neutral-700/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* STEP 1: UNDERSTAND */}
        <button
          onClick={() => onSelectTab("Overview")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
            isUnderstand
              ? "bg-purple-950/70 border border-purple-500/50 text-purple-300 font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>01 / UNDERSTAND</span>
        </button>

        <span className="text-zinc-600">→</span>

        {/* STEP 2: VALIDATE */}
        <button
          onClick={() => onSelectTab("Backtest")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
            isValidate
              ? "bg-purple-950/70 border border-purple-500/50 text-purple-300 font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>02 / VALIDATE</span>
        </button>

        <span className="text-zinc-600">→</span>

        {/* STEP 3: MANAGE RISK */}
        <button
          onClick={() => onSelectTab("Trade Setup")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
            isManageRisk
              ? "bg-purple-950/70 border border-purple-500/50 text-purple-300 font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>03 / MANAGE RISK</span>
        </button>
      </div>

      <div className="text-[11px] text-zinc-400 hidden md:block">
        Journey: Technical signals → Historical validation → Trade execution plan
      </div>
    </div>
  );
}

