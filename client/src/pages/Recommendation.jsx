import { useState } from "react";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar";
import Recommends from "../components/home/recommendations/Recommends";
import DemoPageBadge from "../components/common/DemoPageBadge";

export default function Recommendation({ isDemo = false }){
     const tabs = [ "Active Signals" , "Closed Trades" ];
     const [activeTab , setActiveTab] = useState(tabs[0])

    return (
        <div className="min-h-screen bg-neutral-900 text-zinc-100">
            <Header/>
            {isDemo && <DemoPageBadge title="Fin Recommendations" date="09 Oct 2026" />}
            <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab === "Active Signals" && <div><Recommends isHome={false} isOpen={true} isDemo={isDemo} /></div>}
            {activeTab === "Closed Trades" && <div><Recommends isHome={false} isOpen={false} isDemo={isDemo} /></div>}
        </div>
    )
}