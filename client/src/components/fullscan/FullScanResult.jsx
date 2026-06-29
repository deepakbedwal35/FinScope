import SectorsFullScan from "./SectorsFullScan";
import { Link } from "react-router-dom";
import InsightsIcon from '@mui/icons-material/Insights';
export default function FullScanResult({getStocks , isHome = false}){

    const sliderStyle = " flex flex-row  gap-4  min-w-[500px]  overflow-x-auto whitespace-nowrap scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out" 
    

    return (

        <div className="bg-neutral-900  rounded-xl mb-5">
            {getStocks && getStocks.results?.length === 0 && (
                <div className="text-gray-400 text-sm text-center p-20  mt-10">
                    No stocks found at the moment.
                </div>
            )}
            {getStocks && getStocks.results?.length > 0 && ( 
                <div className="text-white p-2">
                    <div className=" border-0  flex flex-col rounded-xl    text-white">
                       {!isHome && <div className="text-xl  p-2">Signals</div>}
                        <div className={isHome ? sliderStyle : "grid grid-cols-3"}>
                            {getStocks?.results?.map((stocks) =>(
                            <div key={stocks.symbol}  className="flex flex-col p-4 m-2 border min-w-[400px] border-neutral-800 rounded-2xl bg-neutral-950 hover:bg-neutral-900/90 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-neutral-950/50 group select-none">
                              {/* Header Section: Ticker and Strength Badge */}
                                <div className="flex flex-row items-center justify-between"> 
                                    <div className="text-lg font-bold tracking-wide text-neutral-100 pl-1">{stocks.symbol}</div>
                                    
                                    <div 
                                        className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2.5 py-1 border border-transparent" 
                                        style={{
                                            background: stocks.strength === "STRONG" ? "rgba(34, 197, 94, 0.15)" : stocks.strength === "MEDIUM" ? "rgba(245, 158, 11, 0.15)" : "rgba(115, 115, 115, 0.15)",
                                            color: stocks.strength === "STRONG" ? "#22c55e" : stocks.strength === "MEDIUM" ? "#f59e0b" : "#a3a3a3",
                                            borderColor: stocks.strength === "STRONG" ? "rgba(34, 197, 94, 0.2)" : stocks.strength === "MEDIUM" ? "rgba(245, 158, 11, 0.2)" : "rgba(115, 115, 115, 0.2)",
                                        }}
                                    >
                                        {stocks.strength}
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div className={`pl-1 mt-1.5 flex items-baseline gap-2 font-mono ${stocks.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    <div className="text-lg font-bold tracking-tight">{stocks.price?.toFixed(2) ?? "0.00"}</div>
                                    <div className="text font-semibold">
                                        {stocks.change >= 0 ? "+" : ""}{stocks.change?.toFixed(2)}%
                                    </div>
                                </div>

                             {/* Financial Technical Metrics Grid Grid */}
                                <div className="grid grid-cols-4 gap-1 bg-neutral-900/40 border border-neutral-900 rounded-xl p-2.5 my-3.5 text-center">
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Vol</div>
                                        <div className="text-sm font-bold text-neutral-200 font-mono">{stocks.vol_ratio}x</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">RSI</div>
                                        <div className="text-sm font-bold text-neutral-200 font-mono">{stocks.rsi}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Score</div>
                                        <div className="text-sm font-bold text-neutral-200 font-mono">{stocks.score}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Grade</div>
                                        <div className="text-sm font-extrabold font-mono" style={{ color: stocks.grade_color }}>{stocks.grade}</div>
                                    </div>
                                </div>

                             {/* Footer Section: 52-Week Ranges & Primary Dynamic CTA Button */}
                                <div className="flex flex-row items-center justify-between border-t border-neutral-900 pt-3 mt-auto">
                                    <div className="flex gap-4">
                                        <div>
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">From 52W H</div>
                                            <div className="text-xs font-bold text-amber-500 font-mono mt-0.5">
                                                {stocks.dist_52w >= 0 ? "+" : ""}{stocks.dist_52w}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">52W High</div>
                                            <div className="text-xs font-bold text-neutral-300 font-mono mt-0.5">{stocks.w52h}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <Link to={`/analyse/${stocks.symbol}`}>
                                            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all duration-200 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 hover:shadow-md hover:shadow-blue-950/50 active:scale-95">
                                                <InsightsIcon sx={{ fontSize: "14px" }} />
                                                <span>Analyse</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>)}
        </div>

    )

}