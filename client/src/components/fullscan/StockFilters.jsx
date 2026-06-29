import Slider from "@mui/material/Slider";
import { Link } from "react-router-dom";
import { useState } from "react";
import {api} from "../../services/api.js"
import {toast} from "react-hot-toast"
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Checkbox from "@mui/material/Checkbox";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from '@mui/material/OutlinedInput';

import MenuItem from '@mui/material/MenuItem';

import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import FullScanResult from "./FullScanResult.jsx";
export default function StockFilters(){
    const [getStocks , setStocks] = useState(null);
    const [checkbox , setCheckbox] = useState(false);
    // const [valueVolume , setVolume] = useState(1.20);
    // const [strength , setStrength] = useState("MEDIUM");
    // const [below52week , setbelow52week] = useState(10);
    const [selectedCategories ,setSelectedCategories] = useState(["Pharma"]);
    const [isLoading ,setIsLoading] = useState(false);
    const [filters , setFilters] = useState({
        sectors : ["Pharma"],
        min_vol: 1.20,
        rsi_min: 30,
        rsi_max: 80 ,
        dist_thr : 4 ,
        min_grade : "D"

    });

    const sx= {fontSize :"22px" , mb:"1px"}

   

    const avail_cat = ["NIFTY50" , "NIFTYNext50" , "NIFTYMidcap150" , "NIFTYSmallcap" , "PSU/Defence" , "IT/Tech" , "Pharma" , "Banking&Finance" , "FMCG/Consumer" , "AUTO" , "Infra/Realty"];
    const handleCategoryChange =(event)=>{
        const {target : {value} } = event ;
        setSelectedCategories(typeof value === 'string' ? value.split(',') : value);
    }
   
    const updateFilterValue = (key ,value)=>{
        setFilters(prev=>({
            ...prev,
            [key] : value

        }));
    };

    async function get_top_stocks(){
        setIsLoading(true);
        setStocks(null);
        await api.post("/fullscan" , filters )
        .then(res => setStocks(res.data))
        .catch(e => {toast.error(e.message)})
        .finally(()=> setIsLoading(false));
    }
    

    return (
        <div>
            <div className="bg-neutral-900 border-0 gap-2 flex flex-col rounded-xl p-4 m-5  text-white">
                <div className="ml-2 font-bold text-gray-200 font-mono text-lg border-b border-gray-600/50 "> Stock filters</div>
                <div className="grid grid-cols-3 m-2 pl-3 gap-8">
                     <div className=" gap-1 w-full  flex flex-col ">

                        <label for="sectors" className="text-gray-200 text-md mb-2 pb-2">Categories / Sectors</label>
                        <Select multiple 
                        key={"sectors"}
                        value={selectedCategories} 
                        onChange={(e )=>{handleCategoryChange(e); updateFilterValue("sectors" , e.target.value)}} 
                        input={<OutlinedInput/>}
                        renderValue={(selected)=>(
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {selected.map((value)=>(
                                    <Chip className="text-white tracking-wider bg-neutral-600" key={value} label={value} sx={{backgroundColor: '#010111' , color:'#ffffff'}}/>
                                ))}
                            </Box>   
                        )}
    
                        className="text-white border-1  border-white/20 bg-neutral-800/40  rounded-md  "
                        >
                            {
                            avail_cat?.map((category)=>(
                                <MenuItem key={category} value={category}>
                                     <Checkbox 
                            checked={selectedCategories.includes(category)} 
                            sx={{ color: 'gray', '&.Mui-checked': { color: '#3b82f6' } }}
                        />
                                   <ListItemText primary={category} />
                                </MenuItem>
                            ))
                        }   
                        </Select> 
                    </div>

                    <div className="text-gray-300 pl-4 ">
                        <label className="" >Volume Ratio </label>
                        <div className="flex  mt-5 rounded-sm flex-row  border border-white/10 bg-neutral-900/30 p-2 pt-3">
                            <span className="text-sm text-gray-300 mt-6 ">.5</span>
                            <Slider min={0.50} max={3} value={filters.min_vol} sx={{color:"gray"}} onChange={(e , val)=>updateFilterValue("min_vol" , val)} defaultValue={1.20} valueLabelDisplay="auto" step={0.10}  marks/>
                            <span className="text-sm text-gray-300 mt-6">3</span>
                        </div>
                    </div>
                    <div className="text-gray-300">
                        <label>Below % than 52 Week High  </label>
                        <div className="flex flex-row pl   mt-5 rounded-sm  border border-white/10 bg-neutral-900/40 p-2 pt-3 mt">
                            <span className="text-sm text-gray-300 mt-6">1%</span>
                            <Slider min={1} max={20} value={filters.dist_thr} sx={{color:"gray"}} onChange={(e , val)=>updateFilterValue("dist_thr" , val)} defaultValue={10} valueLabelDisplay="auto" step={1}  marks/>
                            <span className="text-sm text-gray-300 mt-6">20%</span>
                        </div>
                    </div>

                    <div className="text-gray-300">
                        <label>Min RSI </label>
                        <div className="flex flex-row pl   mt-5 rounded-sm  border border-white/10 bg-neutral-900/40 p-2 pt-3 mt">
                            <span className="text-sm text-gray-300 mt-6">1</span>
                            <Slider min={1} max={50} key={"rsi_min"} value={filters.rsi_min} sx={{color:"gray"}} onChange={(e , val)=>updateFilterValue("rsi_min" , val)} defaultValue={10} valueLabelDisplay="auto" step={1}  marks/>
                            <span className="text-sm text-gray-300 mt-6">50</span>
                        </div>
                    </div>

                    <div className="text-gray-300 pl-4">
                        <label>Max RSI </label>
                        <div className="flex flex-row pl   mt-5 rounded-sm  border border-white/10 bg-neutral-900/40 p-2 pt-3 mt">
                            <span className="text-sm text-gray-300 mt-6">51</span>
                            <Slider min={51} max={100} key={"rsi_max"} value={filters.rsi_max} sx={{color:"gray"}} onChange={(e , val)=>updateFilterValue("rsi_max" , val)} defaultValue={10} valueLabelDisplay="auto" step={1}  marks/>
                            <span className="text-sm text-gray-300 mt-6">100</span>
                        </div>
                    </div> 

                    <div className=" flex text-gray-300 flex-col gap-2">
                        <label className="mb-4 " >Min Grade</label>
                        <select value = {filters.min_grade} onChange={(e)=>updateFilterValue("min_grade" , e.target.value)}  className=" p-2  border-white/20 rounded-md cursor-pointer border-1 ">
                            <option key={"A"} value={"A"} className="cursor-pointer">A</option>
                            <option key={"B"} value={"B"} className="cursor-pointer">B</option>
                            <option key={"C"} value={"C"} className="cursor-pointer">C</option>    
                            <option key={"D"} value={"D"} className="cursor-pointer">D</option>      
                        </select>   
                    </div>

                    <div className="tracking-wider  text-orange-200">
                        <div  className="flex items-center"><span onClick={()=>setCheckbox(!checkbox)} className="cursor-pointer mb-1">{!checkbox ?<CheckBoxOutlineBlankIcon sx={sx}/>:<CheckBoxIcon sx={sx}/>} </span><span className="pl-1">  Add More Indicators</span></div>
                        <div></div>
                    </div>

                    <div>
                    
                   
                </div>
                </div>
                <button  onClick={get_top_stocks } className="bg-blue-500 m-2  cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Apply Filters
                </button>
                
  
            </div>

            {isLoading &&(
            <Box className="mx-10 my-4 p-10 bg-neutral-800 rounded-xl text-white">
            <div className="flex justify-between items-center mb-20 text-sm text-gray-300">
                <span>Running Full Scan Pipeline...</span>
                <span className="text-xs text-blue-400 animate-pulse">Processing Tickers</span>
            </div>
        <LinearProgress 
            sx={{
                backgroundColor: '#404040',
                '& .MuiLinearProgress-bar': {
                    backgroundColor: '#3b82f6' 
                },
                borderRadius: '6px',
                height: '6px'
            }} />
            </Box>
        )}
        <div className="p-4">
             <FullScanResult getStocks={getStocks} />
        </div>
       
            
        </div>
    )
}