import {api} from "../../../services/api"
import {useState , useEffect} from "react"
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';

import { Tooltip } from "@mui/material";
import getTooltipConfig from "../../../utils/Tooltip"
import SignalCard from "./SignalCard";
export default function RevPatterns({isHome = true}){
    const [ reversalStocks , setReversalStocks] = useState(null);

    useEffect(()=>{
        api.get("/reversal/stocks")
        .then((res)=>{
            setReversalStocks(res.data);
        })
        .catch((e)=> toast.error(" Error occured in Candlestick " + e))


    }, [])

   
    return (
        <div className="p-4">
          
            {!reversalStocks?.success  && <div className="h-[100px] text-center   flex items-center text-sm justify-center text-gray-400 ">There are no signals available at the moment</div> }
             {reversalStocks?.total >  0 && <div  className={isHome ? "flex gap-4" : "flex gap-3 flex-wrap"}>
                {reversalStocks?.results?.map((details)=>(
                    <div className="w-[450px] flex-shrink-0">
                       <SignalCard details={details} patterns = {details?.reversal}/>
                    </div>
                       

                ))}

             </div> }


        </div>
    )
    
}

