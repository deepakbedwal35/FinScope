import { useState , useEffect } from "react";
import {api} from "../../../services/api"
import { toast } from "react-hot-toast";
import TradePerformance from "./TradePerformance";
// import Tooltip from "@mui/material"
export default function Action({stock , currPrice }){

    const findLeftShift = (price) => {
        return (((price - stock?.stopLoss ) / (stock?.target2 - stock?.stopLoss)) * 100).toFixed(2);
        };

    return (
         <div>
            <div className="flex text-gray-300 pb-2 justify-between text-xs">
                <div className="text-xs text-gray-300  "> 
                    <div className="text-gray-400">Recommended Price</div>
                    <div className="">{"\u20B9"}{stock?.entryPrice}</div>  
                </div>
                <div>
                    <div className="text-gray-400">Confidence</div>
                    <div className={`text-center ${stock?.confidence > 65 ? "text-green-400" : "text-orange-300"}`}> {stock?.confidence|| "0.00"}%</div>
                </div>
            </div>

            <div className="text-xs relative  pb-12 mr-6 ml-2 mt-6 h-1">  
                {/* stopLoss to stock: Always Red Dashed */}
                <div 
                    className="absolute top-0 border-t border-dashed border-red-500"
                    style={{ 
                    left: `${findLeftShift(stock?.stopLoss)}%`, 
                    width: `${findLeftShift(stock?.entryPrice) - findLeftShift(stock?.stopLoss)}%` 
                    }}
                />

                {/* stock to target1: Green Dashed */}
                <div 
                    className="absolute top-0 border-t border-dashed border-green-500"
                    style={{ 
                    left: `${findLeftShift(stock?.entryPrice)}%`, 
                    width: `${findLeftShift(stock?.target1) - findLeftShift(stock?.entryPrice)}%` 
                    }}
                />

                {/* target1 to target2: Green Dashed */}
                <div 
                    className="absolute top-0 border-t border-dashed border-green-500"
                    style={{ 
                    left: `${findLeftShift(stock?.target1)}%`, 
                    width: `${findLeftShift(stock?.target2) - findLeftShift(stock?.target1)}%` 
                    }}
                />

               
                {/* If price > stock: for open trades Green solid line from stock up to Current Price */}
                {!stock?.exitPrice && <>
                    { currPrice > stock?.entryPrice && (
                        <div 
                        className="absolute top-0 border-t ml-5 border-solid border-green-500 z-10"
                        style={{ 
                            left: `${findLeftShift(stock?.entryPrice)}%`, 
                            width: `${Math.min(findLeftShift(currPrice), findLeftShift(stock?.target2)) - findLeftShift(stock?.entryPrice)}%` 
                        }}
                        />
                    )}

                    {/* If price < stock: Red solid line from Current Price down to stock */}
                    {currPrice < stock?.entryPrice && (
                        <div 
                        className="absolute top-0  border-t-2 border-solid border-red-500 z-10"
                        style={{ 
                            left: `${Math.max(findLeftShift(currPrice), findLeftShift(stock?.stopLoss))}%`, 
                            width: `${findLeftShift(stock?.entryPrice) - Math.max(findLeftShift(currPrice), findLeftShift(stock?.stopLoss))}%` 
                        }}
                        />
                    )}
                 </>}
              
                 {/* for colsed trade stop this dashed line  */}
                 {stock?.exitPrice && <>
                    { stock?.exitPrice  > stock?.entryPrice && (
                        <div 
                        className="absolute top-0 border-t ml-5 border-solid border-green-500 z-10"
                        style={{ 
                            left: `${findLeftShift(stock?.entryPrice)}%`, 
                            width: `${Math.min(findLeftShift(stock?.exitPrice), findLeftShift(stock?.target2)) - findLeftShift(stock?.entryPrice)}%` 
                        }}
                        />
                    )}

                    {/* If price < stock: Red solid line from Current Price down to stock */}
                    {stock?.exitPrice  < stock?.entryPrice && (
                        <div 
                        className="absolute top-0  border-t-2 border-solid border-red-500 z-10"
                        style={{ 
                            left: `${Math.max(findLeftShift(currPrice), findLeftShift(stock?.stopLoss))}%`, 
                            width: `${findLeftShift(stock?.exitPrice) - Math.max(findLeftShift(currPrice), findLeftShift(stock?.stopLoss))}%` 
                        }}
                        />
                    )}
                 </>}
                
                <div style={{ left: `${findLeftShift(stock?.stopLoss) - 2}%` }} className="absolute flex flex-col items-center top-0">
                    <div className="-top-3 z-20 bg-neutral-900 mr-8 pt-0.5 absolute">
                    <span className="text-red-700 bg-red-900/10 border-white/10 border rounded-4xl p-1">SL</span>
                    </div>
                    <div className="pt-4 text-gray-400">Stop Loss</div>
                    <div className="text-gray-300 pt-1">{"\u20B9"}{stock?.stopLoss}</div> 
                </div>

                {/* stock Marker */}
                <div style={{ left: `${findLeftShift(stock?.entryPrice) - 2}%` }} className="absolute px-2 top-0">
                    <div className="-top-3 z-10 bg-neutral-900 pt-0.5 absolute">
                    <span className="text-green-700 bg-green-900/20 border-white/10 border rounded-4xl p-1">B</span>
                    </div>
                    <div className="pt-4  text-gray-400">Entry Price</div>
                    <div className="text-gray-300 pt-1">{"\u20B9"}{stock?.entryPrice}</div> 
                </div>

                {/* target1 Marker */}
                <div style={{ left: `${findLeftShift(stock?.target1) - 2}%` }} className="absolute px-2 top-0">
                    <div className="-top-3 z-10 bg-neutral-900 pt-[2px] absolute">
                    <span className="text-amber-600 bg-amber-700/20 border-white/10 border rounded-4xl p-1">T1</span>
                    </div>
                    <div className=" pr-4 ">

                        <div className="pt-4 text-gray-400">Target 1</div>
                        <div className="text-gray-300 pt-1">{"\u20B9"}{stock?.target1}</div> 
                    </div>
                </div>
      
                {/* target2 Marker */}
                <div style={{ left: `${findLeftShift(stock?.target2) - 7}%` }} className="absolute  top-0">
                    <div className="-top-3 z-10 bg-neutral-900 pt-[2px] ml-6 absolute">
                    <span className="text-amber-600 bg-amber-700/20 border-white/10 border rounded-4xl p-1">T2</span>
                    </div>
                    <div className="mr-6 pl-2 ">
                    <div className="pt-4 whitespace-nowrap text-gray-400">Target 2</div>
                    <div className="text-gray-300 pt-1">{"\u20B9"}{stock?.target2}</div> 
                    </div>
                </div>

                {stock?.exitPrice &&
                <div style={{ left: `${findLeftShift(stock?.exitPrice -1) }%` }} className="absolute  top-0">
                    <div className="-top-3 z-50 bg-neutral-900 pt-0.5 ml-6 absolute">
                    {/* <Tooltip> */}
                        <span className="text-red-600 bg-orange-700/20 border-red-600/10 border rounded-4xl p-1">S</span>
                    {/* </Tooltip> */}
                    </div>
                    <div className="mr-6 pl-2 ">
                    {/* <div className="pt-4 whitespace-nowrap text-gray-400">Target 2</div> */}
                    {/* <div className="text-gray-300 pt-1">{"\u20B9"}{stock?.target2}</div>  */}
                    </div>
                </div>
                
                }
            </div>


            {stock?.isOpen && <div className="grid grid-cols-2 mt-6 text-xs gap-4">
                <div className={`border-white/10 p-1 border text-center rounded-sm  ${currPrice > stock?.entryPrice ?"bg-green-800/20 font-medium text-green-500": "text-red-500 bg-red-800/20"} `}>ACHIEVED {((currPrice - stock?.entryPrice) *100/stock?.entryPrice).toFixed(2)}%</div>
                <div className=" border-white/10 p-1  border text-center rounded-sm bg-amber-800/10 text-amber-500">{((stock?.target1 - currPrice) *100/stock?.entryPrice).toFixed(2)}%  POTENTIAL LEFT</div>
            </div>}

            {!stock?.isOpen && <TradePerformance tradeDetail ={stock}/>}
        </div>  

    )

}