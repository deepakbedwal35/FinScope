// src/pages/Watchlist.jsx (or wherever your main file is)
import { useEffect, useState } from "react";
import {userApi , api} from "../services/api";

import Header from "../components/Header/Header";
import { toast } from "react-hot-toast";
import CurrPriceBlock from "../components/home/recommendations/CurrPriceBlock";
import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom";
function Watchlist() {
  const [symbolList, setSymbolList] = useState([]);
  const [stockPrices , setStockPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    userApi.get("/watchlist/all")
    .then((res)=>{
        setSymbolList(res.data.allSymbols);
      })
      .catch((err) => console.error("Error fetching signals:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
  if (!symbolList.length) return;
  const symbols = symbolList.map((r) => r.symbol);
  api.post("/fetch/price", { symbols })
    .then((res) => setStockPrices(res.data) )
    .catch((err) =>  toast.error("Could not fetch prices"));
}, [symbolList]);


  return (

    <div className="min-h-screen bg-neutral-800">
     
      <Header />
      <Navbar tabs={["My Watchlist"]}/>
      <div className="mx-5 py-4 my-3  rounded-3xl dark:bg-neutral-900">
        
        {/* <div className="text-white font-mono mx-4 my-4 px-5 text-lg font-bold border-b-2 border-gray-600/40">
          Watchlist
        </div> */}
        {isLoading && <div className="text-gray-400 tracking-wider"> Loading watchlist stocks... </div> }
        {!isLoading && symbolList.length == 0 && <div className="text-gray-400 p-10 text-center"> No Stocks Add in watchlist  </div>}

        
        {symbolList.length > 0 &&  
         <div  className="  my-2 mx-5  rounded-2xl cursor-pointer  px-6 py-4 dark:bg-gray-900/20 border-white/20 border ">
      
         { symbolList.map((s) => (
           <div  onClick={()=>navigate(`/analyse/${s?.symbol}`)} className="  w-full items-center justify-between no-underline  my-2  rounded-2xl cursor-pointer  px-6 py-4 dark:bg-gray-800/20 border-white/20 border hover:bg-gray-700/20 transition-colors"><CurrPriceBlock symbol={s?.symbol} priceData={stockPrices[s.symbol]}/></div>
          ))}
          </div>
      
       } 
      </div>

    </div>
  );

}
export default Watchlist;

