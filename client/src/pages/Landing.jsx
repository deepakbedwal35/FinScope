import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  BarChart3,
  Zap,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Brain,
  History,
  Compass,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  ENTRY_PATHS,
  JOURNEY_STEPS,
  UNDER_THE_HOOD,
  DISCLAIMER,
} from "../constants/journey";
import { StepPreviewMock } from "../components/common/StepPreviewMock";

export default function Landing({ onLaunch }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderPathIcon = (iconName) => {
    switch (iconName) {
      case "Filter":
        return <Filter className="w-5 h-5" />;
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5" />;
      case "Search":
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  const renderStepIcon = (iconName) => {
    switch (iconName) {
      case "Compass":
        return <Compass className="w-4 h-4" />;
      case "Brain":
        return <Brain className="w-4 h-4" />;
      case "History":
        return <History className="w-4 h-4" />;
      case "ShieldAlert":
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

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
        <div className="flex items-center gap-4">
          <a
            href="#how-it-works"
            onClick={scrollToHowItWorks}
            className="text-xs font-semibold font-mono tracking-wider text-zinc-400 hover:text-purple-300 transition-colors duration-200 cursor-pointer hidden sm:inline-block"
          >
            HOW IT WORKS
          </a>
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

      {/* HERO SECTION */}
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
      <section className="max-w-6xl mx-auto px-6 py-8">
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
              onClick={() => navigate(isAuthenticated ? "/fullscan" : "/demo/scan")} 
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
              onClick={() => navigate(isAuthenticated ? "/backtest" : "/demo/backtest")} 
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
              onClick={() => navigate(isAuthenticated ? "/analyse/SUNPHARMA" : "/demo/stock")}
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
              onClick={() => navigate(isAuthenticated ? "/recommendations" : "/demo/recommendations")}
              className="w-full text-center bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold font-mono tracking-wider text-xs py-3 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.4)] cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
          </div>

        </div>
      </section>

      {/* USER JOURNEY + HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        
        {/* ROW 1: WHERE DO YOU WANT TO START? */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase font-semibold">
              Entry Paths
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-zinc-100 tracking-tight mt-1">
              Where do you want to start?
            </h3>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto mt-2">
              Choose your strategy entry point. All paths seamlessly connect into individual stock deep-dives and risk setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ENTRY_PATHS.map((path) => (
              <div
                key={path.id}
                className="bg-neutral-900/40 border border-neutral-800/80 hover:border-purple-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/50 border border-purple-500/20 px-2 py-0.5 rounded">
                      PATH {path.code}
                    </span>
                    <div className="text-zinc-400 group-hover:text-purple-400 transition-colors">
                      {renderPathIcon(path.icon)}
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-zinc-100 mb-2 font-mono">
                    {path.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {path.description}
                  </p>
                </div>

                <button
                  onClick={() => navigate(isAuthenticated ? path.liveUrl : path.demoUrl)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-zinc-200 hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer border border-neutral-700/60"
                >
                  <span>{path.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2: HOW IT WORKS (4 STEPS) */}
        <div>
          <div className="text-center mb-10">
            <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase font-semibold">
              Execution Lifecycle
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-zinc-100 tracking-tight mt-1">
              How it works
            </h3>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto mt-2">
              From market-wide discovery down to entry precision and disciplined risk containment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {JOURNEY_STEPS.map((s) => (
              <div
                key={s.step}
                className="bg-neutral-900/30 border border-neutral-800/70 rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-neutral-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-extrabold text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded">
                      {s.number}
                    </span>
                    <div className="text-zinc-400">
                      {renderStepIcon(s.icon)}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wider mb-2">
                    {s.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {s.description}
                  </p>

                  {/* STATIC VISUAL PREVIEW MOCK */}
                  <div className="mb-4">
                    <StepPreviewMock step={s.step} />
                  </div>
                </div>

                <button
                  onClick={() => navigate(isAuthenticated ? s.liveUrl : s.demoUrl)}
                  className="w-full text-center py-2 px-3 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 hover:text-purple-100 text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{s.cta}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* UNDER THE HOOD NOTE */}
          <div className="mt-10 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-center">
            <p className="text-xs font-mono text-zinc-300 tracking-wide">
              <span className="text-purple-400 font-bold uppercase mr-2">Under the hood:</span>
              {UNDER_THE_HOOD}
            </p>
          </div>

          {/* DISCLAIMER */}
          <div className="mt-4 text-center">
            <p className="text-[11px] font-mono text-zinc-500 tracking-wider">
              {DISCLAIMER}
            </p>
          </div>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900/80 bg-neutral-950/60 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
              <span className="text-[10px] font-black text-white font-mono">FS</span>
            </div>
            <span className="text-xs font-bold font-mono tracking-widest text-zinc-300">
              FINSCOPE
            </span>
            <span className="text-zinc-600 text-xs ml-2">| Quantitative Equity Terminal</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-zinc-400">
            <a
              href="#how-it-works"
              onClick={scrollToHowItWorks}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              HOW IT WORKS
            </a>
            <Link to="/login" className="hover:text-zinc-200 transition-colors">
              LOG IN
            </Link>
            <button
              onClick={onLaunch}
              className="hover:text-purple-400 transition-colors cursor-pointer"
            >
              LAUNCH
            </button>
          </div>

          <div className="text-[11px] font-mono text-zinc-500">
            {DISCLAIMER}
          </div>
        </div>
      </footer>
    </div>
  );
}
