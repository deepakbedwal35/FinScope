import React, { useState } from "react";
import BacktestCard from "../components/backtest/BacktestCard";
import BacktestGrade from "../components/backtest/BacktestGrade";
import BacktestOutcomeCard from "../components/backtest/BacktestOutcomeCard";
import BacktestTradelog from "../components/backtest/BacktestTradelog";
import Tooltip from "@mui/material/Tooltip";
import { History, ShieldAlert } from "lucide-react";
import demoBacktestData from "../demo/demoBacktest.json";

export default function StockBacktestTab({ stockSymbol = "SUNPHARMA", stockGrade = "B" }) {
  // Use precomputed conservative backtest data for demo/overview
  const defaultTradelog =
    demoBacktestData.presets?.conservative?.tradelog ||
    demoBacktestData.results?.SUNPHARMA?.tradelog ||
    demoBacktestData.presets?.momentum?.tradelog ||
    {};

  const tradelog = defaultTradelog;

  return (
    <div className="space-y-4">
      {/* REQUIRED DISCLAIMER & GUIDANCE BANNER */}
      <div className="bg-neutral-900 border border-purple-500/30 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <History className="w-4 h-4" />
            <span>Step 03: Validate Historical Setup</span>
          </div>
          <p className="text-xs text-zinc-300 mt-1">
            Check how this grade performed historically before sizing a position.
          </p>
        </div>
        <div className="text-[11px] bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 text-zinc-400">
          Sample data, not investment advice
        </div>
      </div>

      {/* METRICS SUMMARY */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
        <div className="text-lg font-mono tracking-wider p-2 text-zinc-200">
          Historical Signals ({stockSymbol}) : {tradelog?.total_trades || 0} Trades
        </div>
        <div className="flex flex-wrap justify-between gap-2 mt-2">
          <Tooltip title="Model win if rally was achieved historically">
            <div>
              <BacktestCard title="MODEL ACCURACY" value={tradelog?.model_win_rate} desc="Directional wins" sign="%" />
            </div>
          </Tooltip>
          <Tooltip title="Strict Trade Win Rate achieved historically">
            <div>
              <BacktestCard title="TRADE WIN RATE" value={tradelog?.win_rate} desc="Strict P&L wins" sign="%" />
            </div>
          </Tooltip>
          <Tooltip title="Average historical return per trade">
            <div>
              <BacktestCard title="AVG RETURN" value={tradelog?.avg_return} desc="Per trade" sign="%" />
            </div>
          </Tooltip>
          <Tooltip title="Gross win/loss ratio">
            <div>
              <BacktestCard title="PROFIT FACTOR" value={tradelog?.profit_factor} desc="Gross win/loss" />
            </div>
          </Tooltip>
          <Tooltip title="Expected value per trade">
            <div>
              <BacktestCard title="EXPECTANCY" value={tradelog?.expectancy} desc="Per trade EV" />
            </div>
          </Tooltip>
          <Tooltip title="Average loss when stop-loss triggered">
            <div>
              <BacktestCard title="AVG LOSS" value={tradelog?.avg_loss} color="text-red-500" desc="Avg losing trade" sign="%" />
            </div>
          </Tooltip>
          <Tooltip title="Average holding period in trading days">
            <div>
              <BacktestCard title="AVG HOLD" value={tradelog?.avg_hold} color="text-zinc-300" desc="Avg holding days" sign=" days" />
            </div>
          </Tooltip>
          <Tooltip title="Sharpe ratio">
            <div>
              <BacktestCard title="SHARPE" value={tradelog?.sharpe} desc="Risk-Adjusted Return" />
            </div>
          </Tooltip>
        </div>
      </div>

      {/* OUTCOMES & GRADES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
          <div className="text-base font-mono tracking-wider p-2 text-zinc-200">Outcome Breakdown</div>
          <div className="flex flex-wrap justify-between gap-2 mt-2">
            <BacktestOutcomeCard title="T2 Hit" value={tradelog?.outcomes?.T2_HIT} desc="Full Target" />
            <BacktestOutcomeCard title="T1 Hit" value={tradelog?.outcomes?.T1_HIT ?? tradelog?.outcomes?.T2_HIT} desc="First Target" />
            <BacktestOutcomeCard title="Part. Rally" value={tradelog?.outcomes?.PARTIAL_RALLY} desc="Model win, no SL" />
            <BacktestOutcomeCard title="SL Hit" value={tradelog?.outcomes?.SL_HIT} desc="Full Stop Loss" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
          <div className="text-base font-mono tracking-wider p-2 text-zinc-200">Grade Performance</div>
          <div className="flex gap-2 flex-wrap mt-2 justify-between">
            <BacktestGrade title="Grade A" winrate={tradelog?.by_grade?.A?.win_rate} trades={tradelog?.by_grade?.A?.trades} />
            <BacktestGrade title="Grade B" winrate={tradelog?.by_grade?.B?.win_rate} trades={tradelog?.by_grade?.B?.trades} />
            <BacktestGrade title="Grade C" winrate={tradelog?.by_grade?.C?.win_rate} trades={tradelog?.by_grade?.C?.trades} />
            <BacktestGrade title="Grade D" winrate={tradelog?.by_grade?.D?.win_rate} trades={tradelog?.by_grade?.D?.trades} />
          </div>
        </div>
      </div>

      {/* TRADELOG PREVIEW */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
        <div className="text-base font-mono tracking-wider p-2 text-zinc-200">Historical Signal Log</div>
        <BacktestTradelog tradelog={tradelog} />
      </div>
    </div>
  );
}

