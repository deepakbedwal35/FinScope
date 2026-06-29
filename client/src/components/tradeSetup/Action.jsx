import { Tooltip } from "@mui/material";
import Regime from "./Regime";

export default function Action({entry , currPrice}){

   
    return (
        <div className=" p-4">
         
            {!entry?.found && <div className="p-10 text-center bg-neutral-900 rounded-lg   text-normal text-gray-400 tracking-wider font-mono"> No Action sugggest for this stock </div> }
            
                {entry?.found &&
                <div className=" gap-4 rounded-xl flex flex-col py-2">
                    <div className="pl-2 pb-2 ">Action</div>
                    <Tooltip placement="top" arrow={true} title="Regime changes destroy strategies: Evaluate market conditions and risks against your system before takes Entry ."  slotProps={{tooltip: {sx: { bgcolor: "rgb(239 68 68 / 0.2)" , color:" #d1d5db"} } }}>
                        <div className=" p-5 col-span-1  rounded-2xl border-3 border-green-800/60 bg-neutral-950 ">
                            <div className="flex text-gray-400 pl-4 mb-4 font-medium text-sm justify-between">
                                <div>{entry?.grade_desc}</div>
                            </div>
                        
                            <div className=" flex flex-row justify-around rounded-2xl  py-4 mb-3 border-2 text-gray-300 text-sm bg-gray-800 border-gray-800 ">

                                
                                <div className=" flex flex-col  justify-around items-center bg-gray-500 pl-8  pr-8 pt-4 pb-4 border-2 border-gray-500 rounded-xl font-light text-xs" > 
                                    <div>ENTRY PRICE</div>
                                    <div className="pt-2 pb-2 text-white font-bold text-xl">{"\u20B9"}{entry?.entry?.toFixed(2)}</div>
                                    <div className="text-green-400 font-bold">{entry?.entry_type}</div>
                                </div>

                                <Tooltip title={`History tells ${entry?.target_hits?.sl?.verdict_note}`} >

                                    <div className="flex flex-col  justify-around items-center bg-red-300  pl-8  pr-8 pt-4 pb-4 border-2 border-red-300 rounded-xl font-light text-xs transition delay-150 duration-300 ease-in-out " > 
                                        <div className="text-gray-100">STOP LOSS</div>
                                        <div className="pt-2 pb-2 text-red-800 font-bold text-xl">{"\u20B9"}{entry?.sl.toFixed(2)}</div>
                                        <div className=" text-red-800 font-bold">{-(100*(entry?.entry - entry?.sl)/entry?.entry).toFixed(2)}% risk</div>
                                    </div>
                                </Tooltip>
                                <Tooltip title={`T1  ${entry?.target_hits?.t1?.verdict_note} at a success rate of ${entry?.target_hits?.t1?.success_rate}%  and T2 ${entry?.target_hits?.t2?.verdict_note} at a success rate of ${entry?.target_hits?.t2?.success_rate}% `} >


                                <div className=" flex flex-col   justify-around items-center bg-green-200 pl-8  pr-8 pt-4 pb-4 border-2 border-green-200 rounded-xl font-light text-xs" > 
                                    <div className="text-gray-500">TARGETS</div>
                                    <div className="pt-2   font-bold text-lg text-green-800">T1{"\u20B9"}{entry?.t1?.toFixed(2)}</div>
                                    <div className=" pb-2 font-bold text-sm text-green-700">T2{"\u20B9"}{entry?.t2?.toFixed(2)}</div>
                            
                                    
                                </div>
                                </Tooltip>
                                
                            </div>
                                <div className=" text-xs rounded-lg p-2  text-gray-300 flex flex-row justify-around " >
                                    <div className="flex flex-col  gap-2">
                                        <div>T1 Upside </div>
                                        <div className="text-green-400 text-sm">+{(100*(entry?.t1 - entry?.entry)/entry?.entry).toFixed(2)}%</div>
                                        <div className="text-gray-500 font-bold">R:R =1:{entry?.rr_t1.toFixed(2)}</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div>T2 Upside </div>
                                        <div className="text-green-400 text-sm">+{(100*(entry?.t2 - entry?.entry)/entry?.entry).toFixed(2)}%</div>
                                        <div className="text-gray-500 font-bold">R:R =1:{entry?.rr_t2.toFixed(2)}</div>

                                    </div>
                                        
                                    <div className="flex flex-col gap-2 items-center ">
                                        <div>Total Signals </div>
                                        <div className="text-green-400   text--center text-sm">{entry?.t_high_conf_signals}</div>
                                    </div>
                                
                                    <div className="flex flex-col gap-2 items-center">
                                        <div>Avg Confidence </div>
                                        <div className="text-green-400 text-sm">{entry?.confidence}%</div>
                                    </div>
                                    
                                </div>

                                
                        </div>
                    </Tooltip>
                

                </div>
                
                }   
        </div>
    )
}