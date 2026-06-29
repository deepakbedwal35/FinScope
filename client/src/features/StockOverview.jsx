import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
// import {CurrencyRupeeIcon} from '@mui/icons-material';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import KeyRatio from "../components/fundamentals/KeyRatio.jsx";
import{ api} from '../services/api';
import { useState, useEffect } from 'react';
import BuyButton from "./BuyButton"
import { useParams } from 'react-router-dom';
import FinAnalysis from '../components/stockOverview/FinAnalysis.jsx';
import Week52 from '../components/stockOverview/52Week.jsx';
import Technicals from '../components/stockOverview/Technicals.jsx';
import Dow from './dow.jsx';
import Activity from '../components/Activity.jsx';
import Regime from '../components/tradeSetup/Regime.jsx';


export default function StockOverview({stockData }){

    const {symbol} = useParams() || stockData?.symbol ;
   const fundamentals = stockData?.fundamentals;
  const data = stockData?.df2 || {};
   
  

    return (
        <div className="min-h-screen font-sans" >
            
            <div className='bg-neutral-900 py-2 grid rounded-xl grid-cols'>
                <Activity data={data}/>
                <div className="p-4 ">
                    <Week52 stockData={stockData}/>
                </div> 
            </div>

            <div className="my-3 gap-2 grid grid-cols-2">
                <div className="bg-neutral-900 p-2 rounded-lg"><Regime regime={stockData?.trade_action?.regime}/></div>
                <div className="bg-neutral-900 p-2 rounded-lg"><KeyRatio key_ratios = {fundamentals?.ratios} quality={fundamentals?.quality}/></div>
            </div>
            <div className=" grid gap-2 grid-cols-2">
                <div className="bg-neutral-900 rounded-lg p-2"><Technicals stockData={stockData}/></div>
                <div className="bg-neutral-900 rounded-lg p-2"><Dow stockData={stockData}/></div>


            </div>

            
             

            
            
        
        </div>
    )
}




//    "df2": {
//     "Open": 422,
//     "High": 422,
//     "Low": 416.1000061035156,
//     "Close": 419.1000061035156,
//     "Volume": 10869439,
//     "SMA_20": 427.1575012207031,
//     "SMA_50": 431.6980010986328,
//     "SMA_200": 414.08919570922853,
//     "EMA_9": 421.39780658433165,
//     "EMA_21": 426.3992014656701,
//     "RSI": 42.92558163815698,
//     "RSI_signal": "BEARISH",
//     "MACD": -4.961831434260546,
//     "MACD_signal": -4.191590753214207,
//     "MACD_hist": -0.7702406810463387,
//     "MACD_cross": "NONE",
//     "BB_upper": 443.27440115227546,
//     "BB_lower": 411.0406012891308,
//     "BB_mid": 427.1575012207031,
//     "BB_width": 7.546115840416941,
//     "BB_pct": 0.25002962258879563,
//     "BB_squeeze": true,
//     "ATR": 10.066572369060008,
//     "ATR_pct": 2.4,
//     "Vol_MA20": 12531991.8,
//     "Vol_ratio": 0.87,
//     "OBV": 1327158665,
//     "Dist_from_200MA": 1.21
//   }
// }

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