import {api} from "../../services/api"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { useState , useEffect } from "react"
import StockCard from "../StockCard";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import SearchResult from "./SearchResult";

export default function SearchStock(){
    const [stockName , setStockName] = useState("");
    const [searchResult , setSearchResult] = useState(null);
   const [searching , setSearching] = useState(false);
  

    function handleInputChange(e){
        
        setSearching(true);
        setStockName(e.target.value);
        
    }
   
    async function  handleAnalysis(stockName){

        await api.get(`/search?q=${stockName}`)
        .then(res=>setSearchResult(res.data))
        .catch(err => console.log(err))
      

    }

    // for debouncing means wait for user to type 
    useEffect(()=>{
        if(!stockName) return;

        const delayDebounceFn = setTimeout(()=>{
            handleAnalysis(stockName)
        }, 2000)

        // reset timer if user type sth
        return ()=> clearTimeout(delayDebounceFn)

    } , [stockName])
    

    

    return(
        <div className="">
           
                <div className="bg-neutral-800 w-72  rounded-lg flex flex-row  border-white/40 border items-center ">

                    {!searching &&   <SearchIcon onClick={()=>setSearching(true)} className="text-gray-300 pl-1  text-lg cursor-pointer"/>}
    
                    <input onFocus={()=>setSearching(true)} onBlur={(e)=>{setSearching(false); setStockName("") ; setSearchResult(null)}} type="text" placeholder="Search for stocks" className=" p-2 flex-1 text-center  text-gray-200 outline-none hover:pl-2 rounded-lg " value={stockName}  onChange={handleInputChange}/>
                </div>
                <div className="">  { searching && <SearchResult searchResult={searchResult}/>}</div>
               
               
                  
                
               
                 
            
     
        </div>
      



    )
}