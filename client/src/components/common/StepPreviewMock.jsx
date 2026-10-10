import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Sliders, Brain, History, ShieldAlert } from "lucide-react";

/**
 * Lightweight static visual preview mocks using Tailwind CSS & SVG primitives.
 * Zero external images, zero network calls, completely self-contained.
 */
export function StepPreviewMock({ step }) {
  switch (step) {
    case 1:
      // Discover: Filter & Scan preview
      return (
        <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 font-mono text-[11px] select-none text-zinc-300">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5 mb-2">
            <span className="text-[10px] text-purple-400 font-semibold uppercase">Scan Multi-Filter</span>
            <span className="text-[9px] bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">NSE : 1,048</span>
          </div>
          <div className="flex gap-1.5 flex-wrap mb-2">
            <span className="bg-neutral-800/80 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 border border-neutral-700/60">Pharma</span>
            <span className="bg-emerald-950/40 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] border border-emerald-500/30">Grade A</span>
            <span className="bg-neutral-800/80 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 border border-neutral-700/60">RSI &lt; 45</span>
          </div>
          <div className="space-y-1 bg-neutral-900/40 p-1.5 rounded border border-neutral-800/60 text-[10px]">
            <div className="flex justify-between text-zinc-200">
              <span className="font-bold">SUNPHARMA</span>
              <span className="text-emerald-400">+1.24%</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[9px]">
              <span>RSI 41.2 • Vol 1.8x</span>
              <span className="text-purple-300 font-bold">Grade A</span>
            </div>
          </div>
        </div>
      );

    case 2:
      // Understand: AI Summary & Setups preview
      return (
        <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 font-mono text-[11px] select-none text-zinc-300">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5 mb-2">
            <span className="text-[10px] text-indigo-400 font-semibold uppercase">AI Setup Engine</span>
            <span className="text-[9px] bg-emerald-950/40 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">84% CONF</span>
          </div>
          <p className="text-[10px] text-zinc-300 leading-tight mb-2 font-sans line-clamp-2">
            Bullish accumulation detected above 200 EMA with breakout above channel resistance.
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[9px] bg-neutral-900/50 p-1.5 rounded border border-neutral-800/60">
            <div>
              <span className="text-zinc-500 block">SETUP</span>
              <span className="text-zinc-200 font-semibold">Immediate</span>
            </div>
            <div>
              <span className="text-zinc-500 block">T1 TARGET</span>
              <span className="text-emerald-400 font-semibold">₹1,940 (+12%)</span>
            </div>
          </div>
        </div>
      );

    case 3:
      // Validate: Backtest win rate & avg return
      return (
        <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 font-mono text-[11px] select-none text-zinc-300">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5 mb-2">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase">Historical Backtest</span>
            <span className="text-[9px] text-zinc-400">10-Yr Trades</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2 text-center">
            <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/80">
              <span className="text-[9px] text-zinc-400 block">WIN RATE</span>
              <span className="text-xs font-bold text-emerald-400">71.0%</span>
            </div>
            <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/80">
              <span className="text-[9px] text-zinc-400 block">AVG RETURN</span>
              <span className="text-xs font-bold text-cyan-400">+5.42%</span>
            </div>
          </div>
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: "71%" }} />
            <div className="bg-rose-500/80 h-full" style={{ width: "29%" }} />
          </div>
        </div>
      );

    case 4:
      // Manage risk: Stop-loss, Targets & Position sizing
      return (
        <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 font-mono text-[11px] select-none text-zinc-300">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5 mb-2">
            <span className="text-[10px] text-amber-400 font-semibold uppercase">Risk Planning</span>
            <span className="text-[9px] text-emerald-400 font-semibold">R:R 1:2.6</span>
          </div>
          <div className="space-y-1 text-[10px] bg-neutral-900/50 p-1.5 rounded border border-neutral-800/60">
            <div className="flex justify-between">
              <span className="text-rose-400">Stop-Loss (SL)</span>
              <span className="text-rose-400 font-semibold">₹1,680 (-4.2%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-400">Target 1 (T1)</span>
              <span className="text-emerald-400 font-semibold">₹1,890 (+8.5%)</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[9px] pt-0.5 border-t border-neutral-800">
              <span>Pos Size (2% risk)</span>
              <span className="text-zinc-200">62 shares</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

