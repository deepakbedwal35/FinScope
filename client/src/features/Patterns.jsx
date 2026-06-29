import SignalCard from "../components/home/tradingSignals/SignalCard";
import ReversalPattern from "../components/ReversalPattern";
import CandlestickPattern from "./CandlestickPattern";

export default function Patterns({stockData}){

    return (
        <div>
            <div className="flex flex-col  gap-2 ">
                <div className="bg-neutral-900 rounded-xl"><CandlestickPattern candles ={stockData?.candles}/></div>
                <div className="grid grid-cols-2 gap-2">
                    {/* details ,patterns */}
                    <div className="bg-neutral-900 rounded-xl p-4 ">
                        <div className="text-lg mb-3 font-bold text-gray-300">Reversal Pattern</div>
                        <SignalCard details = {stockData} patterns = {stockData?.reversal?.best} isHome={false}/>
                        </div>
                    <div className="bg-neutral-900 rounded-xl p-4 ">
                        <div className="text-lg mb-3 font-bold text-gray-300">Continuation Pattern</div>
                        <SignalCard details = {stockData} patterns = {stockData?.cont?.best} isHome={false}/>
                        </div>

                </div>

                
              
                
                
            </div>
            
        
        
        </div>
    )
}


