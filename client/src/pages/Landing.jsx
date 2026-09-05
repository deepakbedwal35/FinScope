import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  BarChart3,
  Zap,
  Search,
} from "lucide-react";

export default function Landing({ onLaunch }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans tracking-wide antialiased selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-hidden">
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

      
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-purple-950/30 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest text-purple-400 uppercase">
          <Zap className="w-3 h-3 animate-pulse" /> Live NSE Data Pipeline Active
        </div>

        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-500 max-w-3xl leading-[1.15]">
          Scan, analyze, and backtest NSE stocks with real technical signals.
        </h2>

        <p className="text-sm md:text-base text-zinc-400 font-normal max-w-xl leading-relaxed">
          An automated quantitative intelligence workspace that filters
          1,000+ active equities into verifiable breakout setups using live
          volatility data and a custom algorithmic scoring engine.
        </p>
      </section>

      {/* CORE HIGHLIGHT PILLARS */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* FEATURE CELL 1: SCAN */}
          <div className="bg-neutral-900/30 border border-neutral-800/60 p-5 rounded-xl flex flex-col justify-between gap-4 hover:border-neutral-800 transition-all duration-200">
            <div className="flex flex-col gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold tracking-wider font-mono text-zinc-200 uppercase">
                01 / Full NSE Scan
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Applies multi-factor filters — sector, indicator, volume
                ratio, 52-week range, FinScope grade — across ~1,000 active
                tickers in a single pass.
              </p>
            </div>
            <button 
              onClick={() => navigate("/fullscan")} 
              className="w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold font-mono tracking-wider text-xs py-3 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.4)] cursor-pointer"
            >
              TRY A LIVE SCAN
            </button>
          </div>

          {/* FEATURE CELL 2: BACKTEST */}
          <div className="bg-neutral-900/30 border border-neutral-800/60 p-5 rounded-xl flex flex-col justify-between gap-4 hover:border-neutral-800 transition-all duration-200">
            <div className="flex flex-col gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold tracking-wider font-mono text-zinc-200 uppercase">
                02 / Backtest Engine
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Runs the exact signal logic across 15–20 years of historical
                data, returning win rate, model accuracy, profit factor, and a
                full trade journal.
              </p>
            </div>
            <button 
              onClick={() => navigate("/backtest")} 
              className="w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold font-mono tracking-wider text-xs py-3 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.4)] cursor-pointer"
            >
              RUN BACKTEST
            </button>
          </div>

          {/* FEATURE CELL 3: SINGLE STOCK ANALYSIS */}
          <div className="bg-neutral-900/30 border border-neutral-800/60 p-5 rounded-xl flex flex-col justify-between gap-4 hover:border-neutral-800 transition-all duration-200">
            <div className="flex flex-col gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold tracking-wider font-mono text-zinc-200 uppercase">
                03 / Stock Analysis
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Get a comprehensive AI-powered report including technical parameters,
                indicators, support & resistance patterns, and sentiment scores.
              </p>
            </div>
            <button 
              onClick={() => navigate("/analyse/SUNPHARMA")}
              className="w-full text-center bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold font-mono tracking-wider text-xs py-3 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.4)] cursor-pointer"
            >
              VIEW DEMO STOCK
            </button>
          </div>

          {/* FEATURE CELL 4: RECOMMENDATIONS */}
          <div className="bg-neutral-900/30 border border-neutral-800/60 p-5 rounded-xl flex flex-col justify-between gap-4 hover:border-neutral-800 transition-all duration-200">
            <div className="flex flex-col gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold tracking-wider font-mono text-zinc-200 uppercase">
                04 / Recommendations
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Receive algorithmic setup alerts generated by automated volume shifts
                and custom trend confirmation scoring indicators daily.
              </p>
            </div>
            <button 
              onClick={() => navigate("/fin/recommendations")}
              className="w-full text-center bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold font-mono tracking-wider text-xs py-3 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.4)] cursor-pointer"
            >
              VIEW RADAR
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
