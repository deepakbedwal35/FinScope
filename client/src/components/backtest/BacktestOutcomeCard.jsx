export default function BacktestOutcomeCard({title , value , desc}){
    return(
           
            <div className="border border-white/20 min-w-[150px] border-t-3 border-t-green-500 bg-neutral-900 p-4 rounded-xl flex flex-col items-center ">
            
            
           {value &&  <div className="text-2xl pt-2 pb-2 font-bold text-green-400" >{value}</div>}
           {!value &&  <div className="text-sm pt-2 pb-2 font-bold text-green-400" >Nan</div>}
           <div className="text-[12px] text-gray-200">{title}</div>
            <div className="text-[10px]/5 text-gray-500">{desc}</div>
            </div>
            
       
    )
}