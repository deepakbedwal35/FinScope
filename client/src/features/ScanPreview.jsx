import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Lock, ArrowRight } from "lucide-react";

/**
 * ScanPreview
 *
 * A fully static, no-backend-call preview of what a real scan result
 * looks like. This is NOT live data — it's a fixed example captured
 * once from a real scan you ran, hardcoded here. No API request is
 * made, so there's no new unauthenticated backend surface to secure.
 *
 * Used when a logged-out visitor clicks "Try a Live Scan" or "Launch
 * Terminal". Shows ~5 example results, clearly labeled as an example,
 * then funnels to signup for the real thing.
 *
 * IMPORTANT: replace EXAMPLE_SCAN_RESULTS below with a real result set
 * captured from your own scan output — keep it real-looking (mixed
 * grades, real tickers) rather than inventing numbers from scratch.
 */

const EXAMPLE_SCAN_RESULTS = [
  { symbol: "RELIANCE", grade: "A", score: 24, chgPct: 1.84, pattern: "Golden Cross" },
  { symbol: "HDFCBANK", grade: "A+", score: 27, chgPct: 2.11, pattern: "MACD Bullish Cross" },
  { symbol: "TCS", grade: "B", score: 18, chgPct: 0.42, pattern: "RSI Bullish Reversal" },
  { symbol: "BHARTIARTL", grade: "A", score: 22, chgPct: 1.27, pattern: "Volume Breakout" },
  { symbol: "ITC", grade: "C", score: 12, chgPct: -1.05, pattern: "Continuation Flag" },
];

const EXAMPLE_FILTERS_LABEL = "Sector: All · Min Grade: C · Vol Ratio: >1.2x";
const EXAMPLE_TIMESTAMP_LABEL = "Captured example — not live data";

function gradeColor(grade) {
  if (grade === "A+" || grade === "A") return "text-emerald-400 bg-emerald-950/40";
  if (grade === "B") return "text-indigo-400 bg-indigo-950/40";
  if (grade === "C") return "text-amber-400 bg-amber-950/40";
  return "text-rose-400 bg-rose-950/40";
}

export default function ScanPreview({ onClose }) {
  const navigate = useNavigate();

  function goToSignup() {
    navigate("/signup");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-bold font-mono tracking-widest text-zinc-300 uppercase">
              Example Scan Output
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Example disclosure — never let this read as live data */}
        <div className="px-5 py-2 bg-amber-950/20 border-b border-amber-900/30">
          <p className="text-[11px] font-mono text-amber-400/90">
            {EXAMPLE_TIMESTAMP_LABEL} · sign up to run your own filters across
            all NSE stocks
          </p>
        </div>

        {/* Filters label */}
        <div className="px-5 py-3 text-[11px] font-mono text-zinc-500 border-b border-neutral-900">
          {EXAMPLE_FILTERS_LABEL}
        </div>

        {/* Results */}
        <div className="divide-y divide-neutral-900">
          {EXAMPLE_SCAN_RESULTS.map((r) => (
            <div
              key={r.symbol}
              className="flex items-center justify-between px-5 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${gradeColor(
                    r.grade
                  )}`}
                >
                  {r.grade}
                </span>
                <span className="font-mono text-sm text-zinc-200">
                  {r.symbol}
                </span>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  {r.pattern}
                </span>
              </div>
              <span
                className={`font-mono text-sm tabular-nums ${
                  r.chgPct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {r.chgPct >= 0 ? "+" : ""}
                {r.chgPct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* Locked / blurred rows hint — signals there's more behind signup */}
        <div className="relative px-5 py-3.5 flex items-center justify-between opacity-40 select-none">
          <div className="flex items-center gap-3 blur-[3px]">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400">
              A
            </span>
            <span className="font-mono text-sm text-zinc-200">SBIN</span>
          </div>
          <span className="font-mono text-sm text-emerald-400 blur-[3px]">
            +1.63%
          </span>
        </div>

        {/* CTA footer */}
        <div className="px-5 py-5 bg-neutral-900/40 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>995+ more results, custom filters, full history — signed in</span>
          </div>
          <button
            onClick={goToSignup}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold font-mono tracking-wider text-xs px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            SIGN UP TO RUN A REAL SCAN <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}