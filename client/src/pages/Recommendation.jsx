import { useState } from "react";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar";
import Recommends from "../components/home/recommendations/Recommends";

export default function Recommendation(){
     const tabs = [ "Active Signals" , "Closed Trades" , "Target2 Hit" , "SL Hit"];
     const [activeTab , setActiveTab] = useState(tabs[0])

    return (
        <div>
            <Header/>
            <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab === "Active Signals" && <div><Recommends isHome = {false} /></div>}
            {activeTab === "Closed Trades" && <div><Recommends isHome = {false} isOpen={false}/></div>}
          

        
            
        </div>
    )


}