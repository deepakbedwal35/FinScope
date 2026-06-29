import {useState , useEffect} from "react"
import Candlesticks from "./Candlesticks";
import RevPatterns from "./RevPatterns" 
import ContPatterns from "./ContPatterns" 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from "react-router-dom";
export default function TradingSignals({isHome = true}){
    const navigate = useNavigate();
    const [activeTab , setActiveTab] = useState("Candlesticks");

    return(
        <div className="bg-neutral-900 m-4 tracking-wider pt-8 pl-8 p-2 rounded-xl text-gray-200">
            <div className="font-medium text-normal  tracking-wider text-neutral-200 ">Trading Signals</div>
            <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm py-4">
                    <div onClick={()=> setActiveTab("Candlesticks")} className={`p-1 w-[120px] rounded-lg text-center hover:text-blue-500  hover:bg-blue-400/10 cursor-pointer border border-white/20 ${activeTab == "Candlesticks" ? "bg-blue-400/10 text-blue-500" : ""}`}>Candlesticks</div>
                    <div onClick={()=> setActiveTab("Reversal Patterns")} className={`p-1 w-[120px] rounded-lg text-center hover:text-blue-500  hover:bg-blue-400/10 cursor-pointer border border-white/20 ${activeTab == "Reversal Patterns" ? "bg-blue-400/10 text-blue-500" : ""}`}>Rev. Patterns</div>
                    <div onClick={()=> setActiveTab("Cont. Patterns")} className={`p-1 w-[120px] rounded-lg text-center hover:text-blue-500  hover:bg-blue-400/10 cursor-pointer border border-white/20 ${activeTab == "Cont. Patterns" ? "bg-blue-400/10 text-blue-500" : ""}`}>Cont. Patterns</div>
                </div>
                 {isHome &&  <div onClick={()=>navigate("/all/patterns")} className="text-blue-500 mr-2 py-1 px-2 rounded-lg cursor-pointer font-medium hover:bg-indigo-800/20"> 
                    VIEW ALL <span className="mb-1"><ArrowForwardIosIcon sx={{fontSize:"18px" , pb :"2px"}}/></span> 
                    
                </div>}
                 
            </div>


            <div>
                {activeTab === "Candlesticks" && <div  > <Candlesticks/></div>}
                {activeTab === "Reversal Patterns" && <div  ><RevPatterns/></div>}
                {activeTab === "Cont. Patterns" && <div ><ContPatterns/></div>}
            </div>
        </div>
    )

}

