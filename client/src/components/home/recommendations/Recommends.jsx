import {api} from "../../../services/api"
import {useState , useEffect , useRef} from "react"
import CurrPriceBlock from "./CurrPriceBlock";
import Footer from "./Footer";
import Action from "./Action"
import { toast } from "react-hot-toast";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from "react-router-dom";
export default function Recommends({isHome = false}){
    const navigate = useNavigate();
   const [recommendations, setRecommendations] = useState([]);
   const [loading , setLoading] = useState(true);
    const [stockPrices, setStockPrices] = useState({});
    const sliderStyle = " flex flex-row  gap-4  min-w-[500px]  overflow-x-auto whitespace-nowrap scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out" 
    useEffect(() => {
        api.get("/recommends/list")
            .then((res) => { 
                setRecommendations(res.data.allRecommends); 
            })
            .catch((err) => {
            console.error(err);
            toast.error("Failed to load recommendations.");
            })
            .finally(()=>setLoading(false))
    }, []);
    
    useEffect(() => {
    if (!recommendations.length) return;
    const symbols = recommendations.map((r) => r.symbol);
    api.post("/fetch/price", { symbols })
        .then((res) => setStockPrices(res.data) )
        .catch((err) =>  toast.error("Could not fetch prices"));
    }, [recommendations]);



    return(
        <div className="bg-neutral-900 m-4  tracking-wider pt-8 pl-8  p-6 rounded-xl text-gray-200">
            <div className="flex justify-between mb-3">
                 <div className="font-medium text-normal  tracking-wider text-neutral-200 ">Fin Recommendations</div>
                 {isHome &&  <div onClick={()=>navigate("/fin/recommendations")} className="text-blue-500 mr-2 py-1 px-2 rounded-lg cursor-pointer font-medium hover:bg-indigo-800/20"> 
                    VIEW ALL <span className="mb-1"><ArrowForwardIosIcon sx={{fontSize:"18px" , pb :"2px"}}/></span> 
                    
                </div>}
            </div>
           
            {loading && <div className="text-gray-400">Loading…</div>}

            {!loading && !recommendations && <div>No current recommendation</div>}
            {recommendations.length > 0 && <div className="  gap-2"> 
                <div  className={isHome ? sliderStyle : "grid grid-cols-3 gap-4"}>
                {!loading && recommendations?.map((stock)=>(
                    <div className={`border  border-white/20 p-4 rounded-lg ${isHome ? "min-w-[460px]": ""}`}>
                        <CurrPriceBlock symbol= {stock?.symbol}  priceData={stockPrices[stock.symbol]}/>
                         <div className="border-b-1 mb-2 border-white/20 pb-3 border-dashed "></div>
                        <Action stock={stock} currPrice={stockPrices[stock.symbol]?.price} />  
                        <Footer stock = {stock?.symbol} />
                    </div>
                ))}
                </div>           
            </div>}
           
        </div>
    )

}