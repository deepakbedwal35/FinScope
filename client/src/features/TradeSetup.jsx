import Action from "../components/tradeSetup/Action"
import {toast} from "react-hot-toast"
import Regime from "../components/tradeSetup/Regime";
import SignalConviction from "../components/tradeSetup/SignalConviction";

import OverallRisk from "../components/risks/OverallRisk"
export default function TradeSetup({stockData}){

     return(
        <div className="grid grid-cols-2  gap-2">

            <div className="bg-neutral-900 rounded-xl text-lg">  <Action entry = {stockData?.trade_action} currPrice={stockData?.price}/> </div>
            <div className="bg-neutral-900 rounded-xl text-lg">  <Regime regime ={stockData?.trade_action?.regime} /> </div>
            <div className=" col-span-2  bg-neutral-900 rounded-xl text-lg"> <OverallRisk risks = {stockData?.risks}/> </div>

            <div className="bg-neutral-900 col-span-2 rounded-xl text-lg">  <SignalConviction allEntries={stockData?.trade_action?.entries}/> </div>
           
             
            

       </div>
           
    
    )


}




// "symbol": "BEL",
//   "price": 419.1000061035156,
//   "change": -0.24,
//   "w52h": 473.45,
//   "dist_52w": -11.48,
//   "vol_ratio": 0.87,
//   "rsi": 42.9,
//   "score": 10,
//   "strength": "MEDIUM",
//   "grade": "C",
//   "grade_color": "#f5a623",
//   "sl": 404,
//   "t1": 439.24,
//   "t2": 454.35,