import {api} from "../../../services/api"
import {useState , useEffect} from "react"

import SignalCard from "./SignalCard";
export default function ContPatterns({isHome = true}){
    const [ contStocks , setContStocks] = useState(null);

    useEffect(()=>{
        api.get("/continuation/stocks")
        .then((res)=>{
            setContStocks(res.data);
        })
        .catch((e)=> toast.error(" Error occured in Candlestick " + e))


    }, [])
    
    return (
        <div className="p-4">
            {/* {&& <div>Not found</div> } */}
            {!contStocks?.success  && <div className="min-h-[100px]   flex items-center justify-center text-center text-sm text-gray-400 ">There are no signals available at the moment</div> }
             {contStocks?.total >  0 && <div  className={isHome ? "flex flex-row  gap-4  min-w-[500px]  overflow-x-auto  scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out" : "flex flex-wrap gap-3"}>
                {contStocks?.results?.map((details)=>(
                    <div className="w-[450px] flex-shrink-0">
                        <SignalCard details={details} patterns = {details?.cont}/>
                    </div>

                ))}

             </div> }


        </div>
    )
    
}

