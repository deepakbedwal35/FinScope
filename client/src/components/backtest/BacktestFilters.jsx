import React from "react";
import { useState , useEffect} from "react";
import BacktestResult from "./BacktestResult";
import {api} from "../../services/api"
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { toast } from "react-hot-toast";
export default function BacktestFilters(){
    const [runBacktest , setRunBacktest] = useState(false);
    const [getBacktestRes , setBacktestRes] = useState("");
    const [isloading ,setloading] = useState(false);
    const [filters , setfilters] = useState({
        symbol : "RELIANCE",
        years_back : 2,
        sl_atr_mult  : 1.5,
        t1_atr_mult:  2.0,
        t2_atr_mult:3.5,
        max_hold_days: 40,
        min_score: 10,    
        min_grade: "C",     
    })

    const updateFiltersValue = (key , value)=>{
        setfilters(prev=>({
            ...prev,
            [key] : value
        }));


    }

    const getBacktestResult = (e)=>{
        e.preventDefault();
        setRunBacktest(!runBacktest);
        setloading(true);
        setBacktestRes("");
        api.post(`/backtest` , filters )
        .then((res)=>{
            
            setBacktestRes(res.data);
            toast.success("Backtest run succesfully");

        })
        .catch((err)=>{
            toast.error("Error" + err);
        })
        .finally(()=>setloading(false))

    } 
   

    return(
        <div>
            <div className="p-2 pl-4 bg-neutral-900 m-2 rounded-lg tracking-wider font-sans">

                <div className="text-lg  font-medium">Filters</div>
                <form onSubmit={getBacktestResult} className="p-2 gap-2 text-normal  grid grid-cols-3 font-normal">
                    
                    <div className="flex gap-2 p-2 col-span-2 flex-col">
                        <label htmlFor="symbol">Name of stock</label>
                        <input value={filters['symbol']}  onChange={(e)=>updateFiltersValue('symbol' , e.target.value)} type="text" key="symbol" placeholder="Enter Stock Name"  className="bg-neutral-800  p-2 border border-white/20 rounded-sm" required/>
                    </div>

                    <div className="flex gap-2 p-2 flex-col">
                        <label htmlFor="history">History</label>
                        <input min={1} max={15} value={filters['years_back']} onChange={(e)=>updateFiltersValue('years_back' , e.target.value)} type="number" key="history" placeholder="Enter Stock Name"  className="bg-neutral-800  p-2 border border-white/20 rounded-sm" required/>
                    </div>

                    <div className="flex gap-2 p-2 flex-col">
                        <label htmlFor="stoploss">Stoploss (multiplier)</label>
                        <input step = {0.1} min={0.1} max={10} value={filters['sl_atr_mult']} onChange={(e)=>updateFiltersValue('sl_atr_mult' , e.target.value)} type="number" key="stoploss" placeholder="Enter Stoploss Value"  className="bg-neutral-800  p-2 border border-white/20 rounded-sm" required/>
                    </div>

                    <div className="flex gap-2 p-2 flex-col">
                        <label htmlFor="target1">Target1 (multiplier)</label>
                        <input step = {0.1} min={0.1} max={10.0}  value={filters['t1_atr_mult']} onChange={(e)=>updateFiltersValue('t1_atr_mult' , e.target.value)}     type="number" key="target1" placeholder="Enter Target1 Value"  className="bg-neutral-800  p-2 border border-white/20 rounded-sm" required/>
                    </div>
                    <div className="flex gap-2 p-2 flex-col">
                        <label htmlFor="target2">Target2 (multiplier)</label>
                        <input step = {0.1} min={1.0} max={10.0} value={filters['t2_atr_mult']} onChange={(e)=>updateFiltersValue('t2_atr_mult' , e.target.value)} type="number" key="target2" placeholder="Enter Target2 Value"  className="bg-neutral-800  p-2 border border-white/20 rounded-sm" required/>
                    </div>

                    <div className="flex gap-2 p-2 flex-col">
                        <label htmlFor="maxholddays">Max Hold Days </label>
                        <input min={10} max={120} value={filters['max_hold_days']} onChange={(e)=>updateFiltersValue('max_hold_days' , e.target.value)} type="number" key="maxholddays" placeholder="Enter Max Hold Days Value"  className="bg-neutral-800  p-2 border border-white/20 rounded-sm" required/>
                    </div>

                    <div className="flex gap-2 p-2 flex-col">
                        <label htmlFor="mingrade">Min Grade </label>
                        <select key="mingrade" value={filters['min_grade']}  onChange={(e)=>updateFiltersValue('min_grade' , e.target.value)} className="bg-neutral-800  p-2 border border-white/20 rounded-sm">
                            <option value='A'>A</option>
                            <option value='B'>B</option>
                            <option value='C'>C</option>
                            <option value='D'>D</option>
                        </select>
                        
                    </div>

                    <div className="flex gap-2 p-2 flex-col">
                        <label htmlFor="scorerange"> Min Score </label>
                        <input min={10} max={30} value={filters['min_score']} onChange={(e)=>updateFiltersValue('min_score' , e.target.value)} type="text" key="scorerange" placeholder="Enter min Score  Value"  className="bg-neutral-800  p-2 border border-white/20 rounded-sm" required/>
                    </div>
                    <div className="flex gap-2 col-span-3 p-2 flex-col">

                        {/* button to submit form and trigger backtest with filters */}
                        <button type="submit"  className="bg-green-600 p-2 rounded-sm text-gray-200 font-medium hover:bg-green-700 transition-colors">Run Backtest</button>
                    </div>      
                </form>

                
                
                {/* <BacktestResult /> */}
            </div>

            {!getBacktestRes && !isloading && <div className="h-50 track-wider flex items-center justify-center text-gray-300 bg-neutral-900 text-center m-4 rounded-lg"> 
                   
                   Run Backtest for Result      
                </div>}
            
            {isloading && getBacktestRes === "" &&
                   
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
               }

            {getBacktestRes && <div className="">
                <BacktestResult tradelog={getBacktestRes}/>  
                        
                </div>}
        </div>

    )
}





   



//     async function get_top_stocks(){
//         setIsLoading(true);
//         setStocks(null);
//         await api.get("/fullscan" , {
//             params:{

//                 min_str: strength ,
//                 filters: JSON.stringify(filters),
//                 sel_cats: JSON.stringify(selectedCategories)

//             }
//         })
//         .then(res => setStocks(res.data))
//         .catch(e => toast.error(e.message))
//         .finally(()=> setIsLoading(false));
//     }
    


//     return (
//         <div>
//             <div className="bg-neutral-800 border-0 gap-2 flex flex-col rounded-xl p-4 m-10  text-white">
//                 <div className="ml-2 font-bold  font-mono text-xl "> Stock filters</div>
//                 <div className="flex flex-col m-2 pl-3 gap-6">
//                      <div className="w-1/3 gap-1 flex flex-col">
//                         <label  className="text-white text-md mb-2 pb-2">Categories / Sectors</label>

//                         <Select multiple 
//                         value={selectedCategories} 
//                         onChange={handleCategoryChange} 
//                         input={<OutlinedInput/>}
//                         renderValue={(selected)=>(
//                             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                                 {selected.map((value)=>(
//                                     <Chip className="text-white" key={value} label={value} sx={{backgroundColor: '#1573ec' , color:'#ffffff'}}/>
//                                 ))}
//                             </Box>   
//                         )}
    
//                         className="text-white border-2  border-white bg-gray-900/10 rounded-md p-2 "
//                         >
//                             {
//                             avail_cat?.map((category)=>(
//                                 <MenuItem key={category} value={category}>
//                                      <Checkbox 
//                             checked={selectedCategories.includes(category)} 
//                             sx={{ color: 'gray', '&.Mui-checked': { color: '#3b82f6' } }}
//                         />
//                                    <ListItemText primary={category} />
//                                 </MenuItem>
//                             ))
//                         }   
//                         </Select> 
//                     </div>
//                     <div className="w-1/3">
//                         <label className="" >Volume Ratio </label>
//                         <div className="flex flex-row mt">
//                             <span className="text-sm text-gray-300 mt-6 ">.5</span>
//                             <Slider min={0.50} max={3} value={filters.min_vol} onChange={(e , val)=>updateFilterValue("min_vol" , val)} defaultValue={1.20} valueLabelDisplay="auto" step={0.10}  marks/>
//                             <span className="text-sm text-gray-300 mt-6">3</span>
//                         </div>
//                     </div>
//                     <div className="w-1/3">
//                         <label>Below % than 52 Week High  </label>
//                         <div className="flex flex-row pl mt">
//                             <span className="text-sm text-gray-300 mt-6">1%</span>
//                             <Slider min={1} max={20} value={filters.dist_thr} onChange={(e , val)=>updateFilterValue("dist_thr" , val)} defaultValue={10} valueLabelDisplay="auto" step={1}  marks/>
//                             <span className="text-sm text-gray-300 mt-6">20%</span>
//                         </div>
//                     </div>
//                     <div className="w-1/3 flex flex-col gap-2">
//                         <label  >Strength</label>
//                         <select value = {strength} onChange={(e)=>setStrength(e.target.value)}  className=" p-2  rounded-md cursor-pointer border-1 w-1/3">
//                             <option key={"WEAK"} value={"WEAK"} className="cursor-pointer">WEAK</option>
//                             <option key={"MEDIUM"} value={"MEDIUM"} className="cursor-pointer">MEDIUM</option>
//                             <option key={"STRONG"} value={"STRONG"} className="cursor-pointer">STRONG</option>      
//                         </select>   
//                     </div>

//                     <div>
//                     <button  onClick={get_top_stocks } className="bg-blue-500 m-2 cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//                         Apply Filters
//                     </button>
                   
//                 </div>
//                 </div>
                
  
//             </div>

//             {isLoading &&(
//             <Box className="mx-10 my-4 p-10 bg-neutral-800 rounded-xl text-white">
//             <div className="flex justify-between items-center mb-20 text-sm text-gray-300">
//                 <span>Running Full Scan Pipeline...</span>
//                 <span className="text-xs text-blue-400 animate-pulse">Processing Tickers</span>
//             </div>
//         <LinearProgress 
//             sx={{
//                 backgroundColor: '#404040',
//                 '& .MuiLinearProgress-bar': {
//                     backgroundColor: '#3b82f6' 
//                 },
//                 borderRadius: '6px',
//                 height: '6px'
//             }} />
//             </Box>
//         )}
//         <FullScanResult getStocks={getStocks} />
            
            
//         </div>
//     )
// }

// const res = {
//   "total_trades": 63,
//   "win_rate": 47.6,
//   "avg_return": 0.76,
//   "avg_win": 5,
//   "avg_loss": -3.09,
//   "profit_factor": 1.47,
//   "expectancy": 0.76,
//   "sharpe": 0.81,
//   "max_drawdown": 36.38,
//   "avg_hold": 9.4,
//   "total_return": 47.9,
//   "t1_rate": 0,
//   "t2_rate": 4.8,
//   "sl_rate": 46,
//   "breakeven_rate": 3.2,
//   "trailing_rate": 33.3,
//   "partial_rally": 3.2,
//   "time_exit_rate": 9.5,
//   "outcomes": {
//     "SL_HIT": 29,
//     "T2_HIT": 3,
//     "BREAKEVEN_EXIT": 2,
//     "TRAILING_SL": 21,
//     "TIME_EXIT": 6,
//     "PARTIAL_RALLY": 2
//   },
//   "by_grade": {
//     "A": {
//       "total": 5,
//       "win_rate": 40,
//       "avg_return": 0.41,
//       "avg_mfe": 3.95,
//       "avg_mae": -3.79,
//       "t1_rate": 0,
//       "t2_rate": 60,
//       "sl_rate": 580
//     },
//     "B": {
//       "total": 20,
//       "win_rate": 40,
//       "avg_return": 0.84,
//       "avg_mfe": 5.23,
//       "avg_mae": -4.11,
//       "t1_rate": 0,
//       "t2_rate": 15,
//       "sl_rate": 145
//     },
//     "C": {
//       "total": 38,
//       "win_rate": 52.6,
//       "avg_return": 0.76,
//       "avg_mfe": 6.02,
//       "avg_mae": -3.21,
//       "t1_rate": 0,
//       "t2_rate": 7.9,
//       "sl_rate": 76.3
//     }
//   },
//   "by_score_band": {
//     "10-14": {
//       "total": 38,
//       "win_rate": 52.6,
//       "avg_return": 0.76
//     },
//     "15-19": {
//       "total": 20,
//       "win_rate": 40,
//       "avg_return": 0.84
//     },
//     "20-24": {
//       "total": 5,
//       "win_rate": 40,
//       "avg_return": 0.41
//     }
//   },
//   "symbol": "BEL",
//   "years_back": 2,
//   "fundamentals": {
//     "pe": 52.98,
//     "pb": 14.65,
//     "roe": 0,
//     "profit_margin": 22.5,
//     "debt_equity": 0.27,
//     "eps": 8.15,
//     "market_cap": "₹3.16L Cr",
//     "dividend_yield": null
//   }
// };

//  symbol: str,
//     years_back: int = 2,
//     # Exit params
//     sl_atr_mult: float  = 1.5,
//     t1_atr_mult: float  = 2.0,
//     t2_atr_mult: float  = 3.5,
//     max_hold_days: int  = 30,
//     min_score: int      = 10,    
//     min_grade: str      = "C",    
//     # Exit intelligence
//     use_breakeven: bool       = True,
//     be_trigger_pct: float     = 5.0,
//     use_trailing: bool        = True,
//     trail_offset_pct: float   = 5.0,
//     use_partial: bool         = True,
//     pp_trigger_pct: float     = 10.0,
//     pp_size_pct: float        = 50.0,
//     use_time_exit: bool       = True,
//     time_exit_days: int       = 20,
//     time_profit_min_pct: float= 5.0,
// )