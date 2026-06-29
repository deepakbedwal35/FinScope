import { useState } from "react";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar";
import Candlesticks from "../components/home/tradingSignals/Candlesticks";
import RevPatterns from "../components/home/tradingSignals/RevPatterns";
import ContPatterns from "../components/home/tradingSignals/ContPatterns";

export default function PatternsStock(){
    const tabs = ["Candlesticks" , "Rev. Patterns" , "Cont. Patterns" , "Wedge & Triangle Patterns"];
    let [activeTab , setActiveTab] = useState(tabs[0]);

    return (
        <div>
            <Header/>
             <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab === "Candlesticks" && <div className="bg-neutral-900 mx-4  rounded-xl"><Candlesticks isHome={false}/></div>}
            {activeTab === "Rev. Patterns" &&<div className="bg-neutral-900 mx-4 rounded-xl"><RevPatterns isHome={false}/></div>}
            {activeTab === "Cont. Patterns" && <div className="bg-neutral-900 mx-4 rounded-xl"><ContPatterns isHome={false}/></div>}
            {activeTab === "Wedge & Triangle Patterns" && <div className="text-gray-300 ml-10">Progress..</div>}
    
        </div>
    )
}