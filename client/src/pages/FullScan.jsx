import {useState , useEffect} from "react"
import {Link} from "react-router-dom"
import {api} from "../services/api.js"


import SectorsFullScan from "../components/fullscan/SectorsFullScan.jsx"
import StockFilters from "../components/fullscan/StockFilters.jsx"
import Header from "../components/Header/Header.jsx";

export default function FullScan(){
    // for creating tabs 
    const tabs = ["Overview","Trade Setup", "Dow Theory", "Indicators" ,"Continuation Patterns","Technical Analysis" , "Fundamental Analysis" , "Sentiment Analysis" , "Holdings" , "AI Analysis"];
    let [activeTab , setActiveTab] = useState(tabs[0]);
    let [stockName , setStockName] = useState("");
    let [stockData , setStockData]= useState(null);

    function handleInputChange(e){
        setStockName(e.target.value);
        
    }
   
    async function  handleAnalysis(stockName){
        if(!stockName){
            alert("Please enter a stock name");
            return;
        }
        api.get(`/analyze/${stockName}`)
        .then(res=>setStockData(res.data))
        .catch(err => console.log(err))
        // console.log("Analyzing stock: " + stockData);

    }

   

    return(
        <div className="min-h-screen bg-neutral-800">
            <Header/>
             <SectorsFullScan />

            <StockFilters/>
            <div className="p-2"></div>
        </div>
       
    )
}