import { useState } from "react";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar";
import Recommends from "../components/home/recommendations/Recommends";

export default function Recommendation(){
     const tabs = [ "Active" , "Past Calls"];
     const [activeTab , setActiveTab] = useState(tabs[0])

    return (
        <div>
            <Header/>
            <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab === "Active" && <div><Recommends isHome = {false} /></div>}
            {activeTab === "Past Calls" && <div>OP</div>}

        
            
        </div>
    )


}