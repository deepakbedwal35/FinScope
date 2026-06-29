import {useState , useEffect} from "react"
import {Link, useParams} from "react-router-dom"
import {api} from "../services/api.js"
import {toast} from "react-hot-toast"
import Patterns from "../features/Patterns.jsx"
import TradeSetup from "../features/TradeSetup.jsx"
import Fundamentals from "../features/Fundamentals.jsx"
import AiAnalysis from "../features/AiAnalysis.jsx"
import StockOverview from "../features/StockOverview.jsx"
import CandlestickPattern from "../features/CandlestickPattern.jsx"
import Header from "../components/Header/Header.jsx";
import Navbar from "../components/Navbar.jsx";
import CurrPriceBlock from "../components/home/recommendations/CurrPriceBlock.jsx";
export default function StockDetails(){
    const {symbol} = useParams();
    // const tabs = ["Overview","AI Analysis" ,  "🎯Trade Setup", "Dow Theory", "Positives Vs Risks", "Indicators" ,"Continuation Patterns","Technical Analysis" , "Fundamental Analysis" , "Sentiment Analysis" , "Holdings"  ];
        const tabs = ["Overview","AI Analysis" ,  "Trade Setup"  , "Fundamentals" , "Patterns"   ];
    let [activeTab , setActiveTab] = useState(tabs[0]);
    let [loading , setLoading] = useState(true);
    let [stockData , setStockData]= useState(null);

    useEffect( ()=>{
    setStockData(null);
       if(!symbol )  return;
       api.get(`/analyze/${symbol}`)
       .then((res)=>setStockData(res.data))
       .catch((err)=>toast.error())
       .finally(()=>setLoading(false))
    }, [symbol]);
    
   
    return (
        <div className="bg-neutral-800 min-h-screen">    
            <Header/>
            {loading && <div className="text-center text-gray-300 text-lg font-md "> Stock Details Loading.. </div>}
            {!loading && !stockData && <div className="text-center text-gray-300 text-lg font-md"> No  Info found for this stock </div> }
             {!loading && stockData && 
                <div className=" grid grid-cols-1 ">
                    <div className="bg-neutral-900 border-white/10 border-[0.5px] mx-4 mb-4 p-4 rounded-lg">
                         <CurrPriceBlock  priceData= {{price : stockData?.price , change : stockData?.change  , change_percent : stockData?.change_percent }} symbol = {stockData?.symbol} company={stockData?.fundamentals?.info?.name} isHome ={ false}/>
                    </div>
                    <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
                        <div className=" mx-2 mb-10 rounded-2xl px-4 tracking-wider text-white bg-neutral-800">
                            {activeTab === "Overview" && <div className="text-2xl font-bold "> <StockOverview stockData = {stockData}/> </div> }
                            {activeTab === "Fundamentals" && <div className="text-2xl font-bold "><Fundamentals data={stockData?.fundamentals}/> </div> }
                            {activeTab === "AI Analysis" && <div className="text-2xl font-bold "> <AiAnalysis symbol={stockData?.symbol}/> </div> }             
                            {activeTab === "Trade Setup" && <div className="text-2xl font-bold "><TradeSetup stockData={stockData}/> </div> } 
                            {activeTab === "Patterns" && <div className=""><Patterns stockData={stockData}/> </div> }    
                            
                        </div>  
                </div>
            } 
        </div>
    )
}

