import {useState } from "react"
import RiskFactors from "./RiskFactors";
import { Tooltip } from "@mui/material";
export default function OverallRisk({risks}){
    const [isExpand , setExpand] = useState(false);
    return(
        <div className="pb-4">

            <div className="text-purple-400   font-bold p-4 "> Risks </div>
            {!risks && <div className="text-gray-400 text-sm text-center">No Outcome! try Again</div>}
            {risks && <Tooltip placement="top" arrow="true" title={!isExpand ? "Click for expand":"Click for shrink"}>
                <div onClick={()=>setExpand(!isExpand)} className="hover:bg-red-950/40 bg-red-950/30 mb-2 cursor-pointer mx-4 border border-white/20 rounded-xl grid grid-cols-2 items-center justify-between p-3" style={{color : risks?.overall_color}}>
                <div><span>Overall Risk: </span>{risks?.overall}</div>
                <div className="flex flex-row justify-end pr-6 text-sm font-medium gap-8">
                    {risks?.high_count > 0 && <div className=" bg-red-900/40 rounded-xl text-red-300 p-2">{risks?.high_count} High</div>}
                    {risks?.medium_count && <div className=" bg-yellow-800 rounded-xl text-yellow-300 p-2">{risks?.medium_count} Medium</div>}
                </div>
                <div>
                    <div className="text-sm font-light text-gray-400 p-2">{risks?.overall_desc}</div>
                </div>
                
            </div>
            </Tooltip>}

            {isExpand && <div><RiskFactors allRisks={risks?.risks}/></div>}

        </div>
    )
}

