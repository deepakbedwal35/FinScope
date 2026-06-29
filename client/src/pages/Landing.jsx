import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header/Header";

import {
  TrendingUp,
  Cpu,
  BarChart3,
  Database,
  Shield,
  Zap,
  Search,
  Sparkles,
} from "lucide-react";


export default function Landing({ onLaunch }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans tracking-wide antialiased selection:bg-purple-500/30 selection:text-purple-200">
      {/* GLOBAL TELEMETRY BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* FIXED STRIPPED-DOWN HEADER */}
      <header className="sticky top-0 z-50 bg-neutral-950/70 backdrop-blur-md border-b border-neutral-900/60 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <span className="text-xs font-black text-white font-mono">FS</span>
          </div>
          <span className="text-base font-bold font-mono tracking-widest text-zinc-200">
            FINSCOPE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-semibold font-mono tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors duration-200 px-3 py-1.5"
          >
            LOG IN
          </Link>
          <button
            onClick={onLaunch}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wider text-purple-400 transition-all duration-200 hover:border-zinc-700 cursor-pointer"
          >
            LAUNCH TERMINAL
          </button>
        </div>
      </header>

      {/* HERO SECTION: TITLE + ACTIONABLE VALUE PROPOSITION */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-purple-950/30 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest text-purple-400 uppercase">
          <Zap className="w-3 h-3 animate-pulse" /> Live NSE Data Pipeline
          Active
        </div>

        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-500 max-w-3xl leading-[1.15]">
          Scan, analyze, and backtest NSE stocks with real technical signals.
        </h2>

        <p className="text-sm md:text-base text-zinc-400 font-normal max-w-xl leading-relaxed">
          An automated quantitative intelligence workspace that filters
          1,000+ active equities into verifiable breakout setups using live
          volatility data and a custom algorithmic scoring engine.
        </p>

        {/* SINGLE HIGH-CONVERSION Call To Action */}
        <div className="mt-2">
          <button
            onClick={onLaunch}
            className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold font-mono tracking-wider text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.4)] cursor-pointer"
          >
            TRY A LIVE SCAN{" "}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 ml-1 font-sans">
              →
            </span>
          </button>
        </div>

        {/* LIVE MOCK CONTEXT DATA SCREENSHOT WINDOW AT THE HERO SECTION */}
        <div className="w-full mt-10 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 md:p-5 backdrop-blur-sm relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

          {/* WINDOW CHROME BARS */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-900/80 mb-4 text-xs font-mono text-zinc-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              <span className="ml-2 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                Terminal Simulation // Active Scan Array
              </span>
            </div>
            <div className="hidden sm:block text-[10px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800/40 text-emerald-400">
              SYS STATUS: NOMINAL
            </div>
          </div>

          {/* PLACEHOLDER IMAGERY CONTENT — swap for a real screenshot:
              <img src="/hero-dashboard-scan.png" alt="FinScope Scanner View"
                   className="w-full h-auto rounded-lg object-cover" /> */}
          <div className="bg-neutral-950/80 rounded-xl p-6 min-h-[260px] border border-neutral-900 flex flex-col justify-between text-left font-mono relative group-hover:border-neutral-800/60 transition-all duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-neutral-900 pb-3">
                <div className="text-purple-400 font-bold uppercase tracking-wider">
                  [Live Scan Target: Full NSE Universe ~1024 Symbols]
                </div>
                <div className="text-zinc-500">
                  Query Speed:{" "}
                  <span className="text-zinc-300 font-bold">
                    124ms (Cached via Redis)
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-lg flex flex-col gap-1.5">
                  <div className="text-zinc-500 font-bold uppercase tracking-wide">
                    Applied Signal Filters
                  </div>
                  <div className="text-zinc-300 flex flex-wrap gap-2 mt-1">
                    <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-[10px]">
                      RSI: Bullish Reversal (&lt;45)
                    </span>
                    <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-[10px]">
                      MACD: Cross Upward
                    </span>
                    <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-[10px]">
                      Volume Ratio: &gt;1.2x
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-lg flex flex-col gap-1">
                  <div className="text-zinc-500 font-bold uppercase tracking-wide">
                    Top Scanning Matches
                  </div>
                  <div className="space-y-1 mt-1 text-[11px]">
                    <div className="flex justify-between text-emerald-400">
                      <span>• NMDC</span>{" "}
                      <span className="bg-emerald-950/40 px-1.5 rounded text-[10px]">
                        GRADE A [Score 65]
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>• TATASTEEL</span>{" "}
                      <span className="bg-neutral-900 px-1.5 rounded text-[10px] text-zinc-500">
                        GRADE C [Score 51]
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-600 border-t border-neutral-900 pt-3 mt-4 flex items-center justify-between">
              <div>
                *Click "TRY A LIVE SCAN" above to access the live dashboard
                directly.
              </div>
              <div className="text-purple-500 font-bold">
                FINSCOPE ENGINE V1.0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FROZEN SCOPE 3-COLUMN HIGHLIGHT PILLARS */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* FEATURE CELL 1: SCAN */}
          <div className="bg-neutral-900/30 border border-neutral-800/60 p-5 rounded-xl flex flex-col gap-3 hover:border-neutral-800 transition-all duration-200">
            <div className="h-8 w-8 rounded-lg bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold tracking-wider font-mono text-zinc-200 uppercase">
              01 / Full NSE Scan
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Applies multi-factor filters — sector, indicator, volume
              ratio, 52-week range, FinScope grade — across ~1,000 active
              tickers in a single pass, returning scored, graded results.
            </p>
          </div>

          {/* FEATURE CELL 2: ANALYZE */}
          <div className="bg-neutral-900/30 border border-neutral-800/60 p-5 rounded-xl flex flex-col gap-3 hover:border-neutral-800 transition-all duration-200">
            <div className="h-8 w-8 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold tracking-wider font-mono text-zinc-200 uppercase">
              02 / AI-Assisted Analysis
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Streams technicals, fundamentals, and live news context into an
              LLM pipeline to generate a structured summary and decision
              view for every stock — not just raw numbers.
            </p>
          </div>

          {/* FEATURE CELL 3: BACKTEST */}
          <div className="bg-neutral-900/30 border border-neutral-800/60 p-5 rounded-xl flex flex-col gap-3 hover:border-neutral-800 transition-all duration-200">
            <div className="h-8 w-8 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold tracking-wider font-mono text-zinc-200 uppercase">
              03 / Backtest Engine
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Runs the exact signal logic across 15–20 years of historical
              data, returning win rate, model accuracy, profit factor, and a
              full trade journal with MFE/MAE breakdowns.
            </p>
          </div>
        </div>
      </section>

      {/* SECONDARY ROW: ARCHITECTURE / TRUST SIGNALS */}
      <section className="max-w-6xl mx-auto px-6 py-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-900/60">
            <Database className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wide text-zinc-300 uppercase">
                Cached at the edge
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Redis caches every scan, stock detail, and backtest response
                — repeat queries skip yfinance/NSE entirely.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-900/60">
            <Sparkles className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wide text-zinc-300 uppercase">
                Two ways to measure a win
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Trade outcomes and signal quality (model win) are tracked
                separately, so you know if the plan failed or the call was
                right.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-900/60">
            <Shield className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wide text-zinc-300 uppercase">
                Volatility-aware risk
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Stops and targets scale with each stock's own ATR — not a
                flat percentage applied blindly across the board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-zinc-200 tracking-tight">
          See it in action
        </h3>
        <p className="text-sm text-zinc-500 mt-2">
          Run a real scan, explore a stock, or backtest a strategy — right
          now.
        </p>
        <button
          onClick={onLaunch}
          className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold font-mono tracking-wider text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.25)] cursor-pointer"
        >
          LAUNCH TERMINAL
        </button>
      </section>
    </div>
  );
}