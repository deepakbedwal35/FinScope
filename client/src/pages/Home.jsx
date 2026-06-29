import { useEffect , useState } from "react"

import {api} from "../services/api"

import Header from "../components/Header/Header"
// import Navbar from "../components/Navbar"

// import HomeBlock from "../components/home/HomeBlock"
import IndexBlock from "../components/home/IndexBlock";

import TradingSignals from "../components/home/tradingSignals/TradingSignals";
import Indicators from "../components/home/indicators/Indicators";
import Recommends from "../components/home/recommendations/Recommends";
import SectorsFullScan from "../components/fullscan/SectorsFullScan";
function Home(){
    

   

    return(
    <div className="min-h-screen bg-neutral-800">
        
        <Header />
        <IndexBlock/>
        <Indicators/>
        <TradingSignals/>
        <Recommends isHome={true}/>
        <SectorsFullScan/>
        <div className="p-2"></div>
    </div>
    )
}

export default Home