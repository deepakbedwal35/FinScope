import { useParams  } from "react-router-dom"
import { useState , useEffect } from "react";
import {api} from "../services/api";

import Header from "../components/Header/Header";
import BacktestFilters from "../components/backtest/BacktestFilters";
export default function Backtesting(){
   


    return(
        <div className="text-white min-h-screen  bg-neutral-800">
            <Header/>
            <BacktestFilters />
           
               
        </div>
    )
}