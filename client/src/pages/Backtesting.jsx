import { useParams  } from "react-router-dom"
import { useState , useEffect } from "react";
import {api} from "../services/api";

import Header from "../components/Header/Header";
import BacktestFilters from "../components/backtest/BacktestFilters";
import DemoPageBadge from "../components/common/DemoPageBadge";

export default function Backtesting({ isDemo = false }){
    return(
        <div className="text-white min-h-screen bg-neutral-800">
            <Header/>
            {isDemo && <DemoPageBadge title="Backtest Simulation" date="09 Oct 2026" />}
            <BacktestFilters isDemo={isDemo} />
        </div>
    )
}