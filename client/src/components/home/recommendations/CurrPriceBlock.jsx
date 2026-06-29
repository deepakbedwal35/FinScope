import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';


import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuyButton from "../../../features/BuyButton"
import { useState, useEffect } from 'react';
import HandleWatchlist from '../../handleWatchlist';

export default function CurrPriceBlock({ symbol, priceData , company = "company Name" , isHome = true}) {
   const [isBuy , setBuy] = useState(false);
    const [watchlistSymbol, setWatchlistSymbol] = useState(null);

    const handleBuyClick =()=>{
        setBuy(!isBuy);
    }

  let isPositive ;
  if(priceData) isPositive = priceData.change >= 0;
  

  return (
    <div className="flex-1  text-sm rounded-lg text-gray-200">
     
      <div className="flex flex-row justify-between items-center">
        <div className="pr-3 text-sm font-bold">{symbol}</div>
         {!priceData && <div className="text-gray-400 text-sm mr-5 animate-pulse">Loading…</div> }
        {priceData && <div className={`pt-0.5 text-sm pr-2 font-bold font-mono ${isPositive ? "text-green-400" : "text-red-500"}`}>
          {priceData?.price?.toFixed(2)} {isPositive ? "▲" : "▼"}
        </div> }
        
      </div>

      { priceData && 
        <div className="flex pt flex-row font-light justify-between  text-sm items-center">
          <div className="pr-3 text-xs text-gray-400"></div>
          <div className={`pt-0.5 text-sm pr-2 font-medium font-mono ${isPositive ? "text-green-400" : "text-red-500"}`}>
            ₹{priceData?.change.toFixed(2)} ({priceData?.change_percent}%)
          </div>
        </div>
      }

      {priceData && !isHome && 
        <div className="flex justify-between mt-2">
           <div className={`font-light text-sm flex flex-row justify-baseline gap-2 text-gray-300 `}>
              <div className='flex flex-col hover:text-blue-50 cursor-pointer items-center p-2'>
                  <div className='text-blue-200 hover:text-blue-400 '>< AnalyticsIcon /></div>
                  <div>Option Chain</div>
              </div>
              <div className='flex items-center hover:text-blue-50 cursor-pointer flex-col p-2'>
                  <div className='text-blue-200  hover:text-blue-400'><CandlestickChartIcon/></div>
                  <div>Charts</div>
              </div>
                  
          </div>

          <div className='flex flex-row justify-end items-center text-lg font-medium gap-4 pr-2'>
              <button  onClick={()=>setWatchlistSymbol(symbol)} className="text-gray-200 cursor-pointer"><BookmarkAddOutlinedIcon/></button>
              {watchlistSymbol && <HandleWatchlist symbol={watchlistSymbol}  onDone={() => setWatchlistSymbol(null)} />}
              <button onClick={handleBuyClick} className='cursor-pointer pl-4 pr-4 pt-1 pb-1 rounded-lg bg-green-400 hover:bg-green-500'>Buy</button>
              <button className='cursor-pointer pl-4 pr-4 pt-1 pb-1 rounded-lg bg-red-400 hover:bg-red-500'>Sell</button>
          </div>

           {isBuy && <div className="p-4 fixed inset-0 z-50 "><BuyButton data={symbol} handleIsOpen={handleBuyClick}/></div>}
        </div>
      
      }
    </div>
  );
}

