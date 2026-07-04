export default function TradePerformance({tradeDetail}){
    if(tradeDetail?.isOpen) return <></>;


    return (
       <div className="grid grid-cols-2 mt-6 text-xs gap-4">
                {!tradeDetail?.stopLossHit &&  <div className={`border-white/10 border text-center p-1 rounded-sm bg-green-800/20 font-medium text-green-500  `}>ACHIEVED {((tradeDetail?.exitPrice- tradeDetail?.entryPrice) *100/tradeDetail?.entryPrice).toFixed(2)}%</div>}
                 {tradeDetail?.target1Hit  && !tradeDetail?.target2Hit &&  <div className={`border-white/10 border text-center p-1 rounded-sm bg-green-800/20 font-medium text-green-500  `}>Target1 Hit </div>}
                  {tradeDetail?.target2Hit &&  <div className={`border-white/10 border text-center p-1 rounded-sm bg-green-800/20 font-medium text-green-500  `}>Target2 Hit </div>}
                {tradeDetail?.stopLossHit &&  <div className={`border-white/10 border text-center rounded-sm bg-red-800/20 font-medium text-red-500  `}>Exited At {((tradeDetail?.exitPrice- tradeDetail?.entryPrice) *100/tradeDetail?.entryPrice).toFixed(2)}%</div>}
                 {tradeDetail?.stopLossHit &&  <div className={`border-white/10 border text-center rounded-sm bg-red-800/20 font-medium text-red-500  `}>Stop Loss Hit </div>}
              
               {/* <div className=" border-white/10 border text-center rounded-sm bg-amber-800/10 text-amber-500">{((stock?.target1 - currPrice) *100/stock?.entryPrice).toFixed(2)}%  POTENTIAL LEFT</div> */}
        </div>

    )
    

}