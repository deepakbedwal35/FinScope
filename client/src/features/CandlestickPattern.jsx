import { Tooltip } from "@mui/material";
import CandlePatternIcon from "../utils/CandlePatternIcon";

export default function CandlestickPattern({ candles }) {
    const formatName = (candleName) => {
        if (!candleName) return "";
        return candleName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const latest = candles?.latest;
  
    if (!latest || (Array.isArray(latest) && latest.length === 0)) {
        return <div className="text-center text-gray-500 py-2">No Candlestick Pattern Found</div>;
    }

  
    const isBullish = latest?.direction?.toLowerCase() === "bullish";
    const cardBgColor = isBullish ? "bg-green-950/40 text-green-400" : "bg-red-950/40 text-red-400";
    const iconBgColor = isBullish ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400";
    const badgeBgColor = isBullish ? "bg-green-700/50 text-green-200" : "bg-red-700/40 text-red-200";
    const tooltipBgColor = isBullish ? "green" : "#9e4c60";

    return (
        <div className="p-2 w-full">
            <div className="m-2">
                <div className="text-gray-300 text-lg tracking-wider font-semibold mb-3"> Candlestick Pattern</div> 
                
           
                <div className={`flex flex-row justify-between items-center p-4 rounded-xl ${cardBgColor}`}>
                    
                 
                    <div className="flex flex-row items-start gap-4 flex-1 min-w-0">
                        <div className={`mt-1 flex-shrink-0 `}>
                            <CandlePatternIcon name={latest?.name} />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="font-bold text-lg truncate">{formatName(latest?.name)}</div>
                            <div className="text-sm text-gray-300 line-clamp-2">{latest?.desc}</div>
                            <div className="text-xs text-gray-500 font-medium mt-1">{latest?.bars_ago} Bars Ago</div>
                        </div>
                    </div>

                   
                    <div className="w-[200px] flex-shrink-0 flex flex-row justify-end items-center gap-2 pl-4">
                        <Tooltip 
                            title="Signal" 
                            arrow
                            slotProps={{ tooltip: { sx: { color: '#ffffff', bgcolor: tooltipBgColor } }, arrow: { sx: { color: tooltipBgColor } } }}
                        >
                            <div className={`${badgeBgColor} px-3 py-1 text-sm font-medium rounded-lg uppercase  tracking-wide text-center whitespace-nowrap`}>
                                {latest?.signal}
                            </div>
                        </Tooltip>

                        <Tooltip 
                            title="Strength" 
                            arrow
                            slotProps={{ tooltip: { sx: { color: '#ffffff', bgcolor: "#a2a377" } }, arrow: { sx: { color: "#a2a377" } } }}
                        >
                            <div className={`px-3 py-1 text-sm font-medium rounded-lg text-center flex-1 ${latest?.strength === "STRONG" ? "bg-emerald-900/60 text-green-200" : "bg-yellow-900/40 text-yellow-200"}`}>
                                {latest?.strength}
                            </div>
                        </Tooltip>
                    </div>

                </div>
            </div>
        </div>
    );
}
