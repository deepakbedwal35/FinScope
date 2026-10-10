import {useState , useEffect} from "react"
import {Link, useParams, useSearchParams} from "react-router-dom"
import {api} from "../services/api.js"
import {toast} from "react-hot-toast"
import Patterns from "../features/Patterns.jsx"
import TradeSetup from "../features/TradeSetup.jsx"
import Fundamentals from "../features/Fundamentals.jsx"
import AiAnalysis from "../features/AiAnalysis.jsx"
import StockOverview from "../features/StockOverview.jsx"
import CandlestickPattern from "../features/CandlestickPattern.jsx"
import StockBacktestTab from "../features/StockBacktestTab.jsx"
import Header from "../components/Header/Header.jsx";
import Navbar from "../components/Navbar.jsx";
import CurrPriceBlock from "../components/home/recommendations/CurrPriceBlock.jsx";
import DemoPageBadge from "../components/common/DemoPageBadge.jsx";
import StockJourneyIndicator from "../components/common/StockJourneyIndicator.jsx";
import demoStockData from "../demo/demoStock.json";

export default function StockDetails({ isDemo = false }){
    const {symbol} = useParams();
    const [searchParams] = useSearchParams();
    const isDemoMode = isDemo || (typeof window !== "undefined" && window.location.pathname.includes("/demo/stock"));
    const tabs = ["Overview","AI Analysis" ,  "Trade Setup"  , "Fundamentals" , "Patterns" , "Backtest" ];
    
    // Check if initial tab is requested via query param (e.g. ?tab=Trade+Setup)
    const initialTabParam = searchParams.get("tab");
    const initialTab = tabs.includes(initialTabParam) ? initialTabParam : tabs[0];
    
    let [activeTab , setActiveTab] = useState(initialTab);
    let [loading , setLoading] = useState(!isDemoMode);
    let [stockData , setStockData]= useState(isDemoMode ? { ...demoStockData, trade_action: demoStockData.trade_action || demoStockData.entry || {} } : null);

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam && tabs.includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    useEffect( ()=>{
        if (isDemoMode) {
            setStockData({
                ...demoStockData,
                trade_action: demoStockData.trade_action || demoStockData.entry || {},
            });
            setLoading(false);
            return;
        }

        setStockData(null);
        if(!symbol ) return;
        api.get(`/analyze/${symbol}`)
        .then((res)=>{
            const data = res.data;
            if (data && !data.trade_action && data.entry) {
                data.trade_action = data.entry;
            }
            setStockData(data);
        })
        .catch((err)=>toast.error("Failed to load stock data"))
        .finally(()=>setLoading(false))
    }, [symbol, isDemoMode]);
    
   
    return (
        <div className="bg-neutral-800 min-h-screen">    
            <Header/>
            {isDemo && <DemoPageBadge title={`${stockData?.symbol || "SUNPHARMA"} Technical Analysis`} date="09 Oct 2026" />}
            {loading && <div className="text-center text-gray-300 animate-pulse text-lg font-md p-10"> Stock Details Loading.. </div>}
            {!loading && !stockData && <div className="text-center text-gray-300 text-lg font-md p-10"> No Info found for this stock </div> }
             {!loading && stockData && 
                <div className=" grid grid-cols-1 ">
                    <div className="bg-neutral-900 border-white/10 border-[0.5px] mx-4 my-4 p-4 rounded-lg">
                         <CurrPriceBlock  priceData= {{price : stockData?.price , change : stockData?.change  , change_percent : stockData?.change_percent }} symbol = {stockData?.symbol} company={stockData?.fundamentals?.info?.name} isHome ={ false}/>
                    </div>
                    <StockJourneyIndicator activeTab={activeTab} onSelectTab={setActiveTab} />
                    <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
                        <div className=" mx-2 mb-10 rounded-2xl px-4 tracking-wider text-white bg-neutral-800">
                            {activeTab === "Overview" && <div className="text-2xl font-bold "> <StockOverview stockData = {stockData}/> </div> }
                            {activeTab === "Fundamentals" && <div className="text-2xl font-bold "><Fundamentals data={stockData?.fundamentals}/> </div> }
                            {activeTab === "AI Analysis" && <div className="text-2xl font-bold "> <AiAnalysis symbol={stockData?.symbol} demoData={stockData?.ai}/> </div> }             
                            {activeTab === "Trade Setup" && <div className="text-2xl font-bold "><TradeSetup stockData={stockData}/> </div> } 
                            {activeTab === "Patterns" && <div className=""><Patterns stockData={stockData}/> </div> }
                            {/* {activeTab === "Backtest" && <div><StockBacktestTab stockSymbol={stockData?.symbol} stockGrade={stockData?.grade} /> </div> }     */}
                        </div>  
                </div>
            }
 
        </div>
    )
}

