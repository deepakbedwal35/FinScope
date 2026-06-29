import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import {Link} from "react-router-dom"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React , {useState , useEffect} from "react"
import { Tooltip } from "@mui/material";
import getTooltipConfig from "../../../utils/Tooltip"
import HandleWatchlist from '../../handleWatchlist';
export default function Footer({stock}){
    const [watchlistSymbol , setWatchlistSymbol] = useState(null);

    
    return(
        <div className="text-gray-400 flex justify-between items-end pt-3 text-sm font-light border-t border-white/20 mt-4">
            <div className="text-xs">
                <div>Timeframe : 1D </div>
                <div>Recommends  : {'Today'} </div>
            </div>
            <div className="flex gap-2 items-center text-gray-300 mb-0.5">
                <Tooltip title="Add to watchlist" {...getTooltipConfig('top')}>   
                    <div  onClick={()=>setWatchlistSymbol(stock)} className="cursor-pointer  hover:bg-neutral-800/10 hover:text-gray-200 "><BookmarkAddOutlinedIcon/></div>
                     {watchlistSymbol && <HandleWatchlist  symbol={watchlistSymbol}  onDone={() => setWatchlistSymbol(null)} />}
                </Tooltip >
                <Tooltip title="Chart" {...getTooltipConfig('top')}>  
                    <div className="cursor-pointer hover:bg-neutral-800/10 hover:text-gray-200 "><InsertChartIcon/></div>
                </Tooltip >
                <Tooltip title="Stock Details" {...getTooltipConfig('top')}>  
                    <Link to={`/analyse/${stock}`}><div className="cursor-pointer hover:bg-neutral-800/10 hover:text-gray-200 "><InfoOutlinedIcon/></div></Link>
                </Tooltip >
                <button  className='cursor-pointer text-green-200 pl-4 pr-4 pt-1 pb-1  font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500'>Buy</button>
            </div>
        </div> 
    )
}