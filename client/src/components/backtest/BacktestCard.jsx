export default function BackTestCard({title , value , desc , color , sign =""}){
    return(
        <div className="border border-white/20 min-w-[150px]  bg-neutral-900 p-4 rounded-xl flex flex-col items-center m-2">
            
            <div className="text-[12px] text-gray-400">{title}</div>
            <div className={`text-2xl pt-2 pb-2 font-bold  ${value >= 0 ? "text-green-600" : value <=0 ? "text-red-600" : color}`} >{value}{sign}</div>
            <div className="text-[10px]/5 text-gray-500">{desc}</div>


        </div>
    )
    
    
}