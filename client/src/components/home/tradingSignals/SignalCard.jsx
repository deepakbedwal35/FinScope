
import CandlePatternIcon from "../../../utils/CandlePatternIcon";
import React , {useState , useEffect} from "react"
import { Tooltip } from "@mui/material";
import getTooltipConfig from "../../../utils/Tooltip"
import Footer from '../recommendations/Footer';
import CurrPriceBlock from '../recommendations/CurrPriceBlock';
export default function SignalCard({details ,patterns , isHome =true}){
      const [activeTab, setActiveTab] = useState('signal');
     const formatName = (candleName)=>{
        const name = candleName
        ?.split('_')
        ?.map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' '); 
        return name;
        
     }
     
    return (
        <div className="text-gray-100 mb-2 flex  flex-row border border-white/20 rounded-lg overflow-hidden bg-neutral-900/40">
            
            <Tooltip title={patterns?.desc} {...getTooltipConfig('top', patterns?.color)}>
            
                <div className={`w-[100px] flex flex-col justify-center items-center pb-4 pt-2 ${patterns?.direction === "BEARISH" ? "bg-amber-950/30 text-amber-700" : "bg-green-950/50 text-green-400"}`}>
                
                    <CandlePatternIcon name={patterns?.name}/>
                    
                    <div className="text-[12px] pt-2 px-2 text-center whitespace-normal line-clamp-2 min-h-[40px] flex items-center justify-center">
                        {formatName(patterns?.name)}
                    </div>
                    
                    <div className="text-[10px] mt-1">({patterns?.direction})</div>
                </div>
            </Tooltip>

            <div className="flex-1 text-sm p-4 rounded-r-lg text-gray-200 flex flex-col justify-between">
                <div>

                    <CurrPriceBlock symbol={details?.symbol} priceData={{price : details?.price , change:details?.change , change_percent:details?.change_percent}} company={details?.fundamentals?.info?.name}/>
                   
                    <div className="flex flex-row gap-1  bg-neutral-950/40 p-1 rounded-md my-3 border border-white/5">
                        {['signal', 'setup', 'action'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 text-center py-1 text-xs font-medium rounded capitalize transition-all duration-200 ${
                                    activeTab === tab 
                                        ? 'bg-neutral-800 text-white shadow-sm font-semibold' 
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/20'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    
                    <div className="min-h-[150px] flex flex-col justify-center">
                       
                        {activeTab === 'signal' && (
                            <div className="text-sm font-extralight text-gray-400 space-y-1 animate-fadeIn">
                                <div>Status: {patterns?.confirmed && <span className="font-medium text-green-400"> Breakout </span>}  {!patterns?.confirmed && <span className="font-medium text-amber-600"> Watching </span>}</div>
                                {patterns?.confidence && (
                                    <div>Confidence: <span className={`font-medium ${patterns?.confidence > 50 ? "text-green-400" : "text-amber-600"}`}>{patterns?.confidence}%</span></div>
                                )}
                                {patterns?.strength && (
                                    <div>Strength: <span className={`font-medium ${patterns?.strength ? "text-green-400" : "text-amber-600"}`}>{patterns?.strength}</span></div>
                                )}
                                <div className="text-xs line-clamp-3 whitespace-normal">Description: <span className={`font-light  ${patterns?.confidence > 60 ? "text-green-400" : "text-amber-600"}`}>{patterns?.desc}</span></div>

                            </div>
                        )}

                        {/* Tab 2: Setup (Technical Details) */}
                        {activeTab === 'setup' && (
                            <div className="text-sm font-extralight whitespace-normal text-gray-400 space-y-1 animate-fadeIn">
                                {patterns?.pole_move && <div>Pole Momentum: <span className="font-light text-gray-200 font-mono">{`${patterns?.pole_move}%` ?? "N/A"}</span></div>}
                                 {patterns?.pole_bars && <div>Flagpole Bars: <span className="font-light text-gray-200 font-mono">{`${patterns?.pole_bars}` ?? "N/A"}</span></div>}
                              
                                <div>Neckline Resistance: <span className="font-light text-gray-200 font-mono">₹{patterns?.neckline ?? "N/A"}</span></div>
                                <div>Volume Validation: <span className={`font-light ${patterns?.vol_ok ? "text-green-400" : "text-red-400"}`}>{patterns?.vol_ok ? "High Volume " : "Low Volume"}</span></div>
                                <div>Pattern Duration: <span className="font-light text-gray-200 font-mono">{patterns?.bars_formed ?? "N/A"} Bars</span></div>
                            </div>
                        )}

                        {/* Tab 3: Action (Execution & Targets) */}
                        {activeTab === 'action' && (
                            <div className="text-sm font-extralight text-gray-400 space-y-1 animate-fadeIn">
                                {patterns?.trade_note && (
                                    <div  className="whitespace-normal">Action: <span className={`font-light ${patterns?.direction === "BEARISH" ? "text-amber-700" : "text-green-400"}`}>{patterns?.trade_note}</span></div>
                                )}
                                <div>Target Price: <span className="font-light text-green-400 font-mono">₹{patterns?.price_target ?? "N/A"}</span></div>
                            </div>
                        )}
                    </div>
                </div>
                {isHome && <Footer stock={details?.symbol}/>}

              
              
              
                
            </div>
        </div>   

    )

}