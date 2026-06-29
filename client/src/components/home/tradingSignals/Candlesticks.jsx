import {api} from "../../../services/api"
import {useState , useEffect} from "react"
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import InsertChartIcon from '@mui/icons-material/InsertChart';

import CandlePatternIcon from "../../../utils/CandlePatternIcon";
import { Tooltip } from "@mui/material";
import getTooltipConfig from "../../../utils/Tooltip"
import { toast } from "react-hot-toast";
import Footer from "../recommendations/Footer";
import CurrPriceBlock from "../recommendations/CurrPriceBlock";
export default function Candlesticks({limit = 10 , isHome =true}){
    const [ candleStocks , setCandleStocks] = useState(null);

    useEffect(()=>{
        api.get("/candlesticks/stocks")
        .then((res)=>{
            // toast.success(res?.data?.success)
            setCandleStocks(res.data);
        })
        .catch((e)=>{ 
            toast.error(" Error occured in Candlestick " + e);
        })
        


    }, [])

    const formatName = (candleName)=>{
        const name = candleName
        ?.split('_')
        ?.map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' '); 
        return name;
        
    }

    const CalMov = (change , price)=>{
        let priceChange = (price * change/100).toFixed(2);
        return priceChange >= 0 ? priceChange : priceChange*(-1)
    }
    
        // "success":  True,
        // "total":    len(found),
        // "results":  found,
        // "bullish":  bullish,
        // "bearish":  bearish,
        // "neutral":  neutral,

    return (
        <div className="p-4">
            {!candleStocks?.success && <div className="h-[100px] text-center  flex text-sm  items-center justify-center text-gray-400 ">There are no signals available at the moment</div>}
            
             {candleStocks?.total >  0 &&  <div  className={isHome ? "flex flex-row  gap-4  min-w-[500px]  overflow-x-auto  scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out" : "flex gap-4  flex-wrap"}>
                {candleStocks?.results?.map((details)=>(
                        <div className="text-gray-100 flex flex-row w-[430px]   border border-white/20 rounded-lg ">
                            <Tooltip title = {details?.candle?.desc}  {...getTooltipConfig('top', details?.candle?.color)}>
                                <div className={`w-1/5 flex flex-col justify-center items-center pb-4 pt-2 ${details?.candle?.direction == "BEARISH" ? "bg-amber-950/30 text-amber-700" : "bg-green-950/50 text-green-400"}`}>    
                                    <CandlePatternIcon name={details?.candle?.name}/>
                                    <div className="text-[12px] text-center">{formatName(details?.candle?.name)}</div>
                                    <div className="text-[10px]">({details?.candle?.direction})</div>  
                                </div>
                            </Tooltip>
                            <div className=" flex-1 text-sm p-4 hover:bg-neutral-800 rounded-r-lg  text-gray-200">
                                <CurrPriceBlock symbol = {details?.symbol} priceData={{price:details?.price , change:details?.change , change_percent:details?.change_percent}}/>
                                <div className="text-sm font-extralight pt-2  text-gray-500">     
                                <div>Strength : <span className={`font-medium ${details?.candle?.strength ? "text-green-400" : " text-amber-600"}`}> {details?.candle?.strength}</span></div>
                                
                                </div>
                                <Footer stock={details?.symbol}/>


                

                            </div>
    
                        </div>
                        
                    
                    

                ))}

             </div> }


        </div>
    )
    
}

