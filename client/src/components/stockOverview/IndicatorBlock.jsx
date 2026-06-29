export default function IndicatorBlock({title , signal ,diverg, desc  , value ,  color = "" , upper , lower , mid , squeeze , sma_50 , sma_100 , sma_20 , sma_200 , dist_200ma ,atr }) {
    return (
        
        <div className="p-4 m-4 flex flex-col bg-neutral-800/50  rounded-lg  text-white transition delay-150 duration-300 ease-in-out hover:-translate-y-1">
            
            <div className="pb-2 text-sm font-light text-amber-500">{title}</div>
            <div className={`pb-2 font-bold text-xl`} style={{ color: color }}>{signal}</div>
            <div className="pb-2 text-lg font-light text-green-400"> {value}</div>
            {desc && <div className="pb-2 text-sm font-light text-gray-400"> Description :  {desc}</div>}
            {diverg && <div className="pb-2 text-sm font-light text-gray-400"> Divergence :  {diverg}</div>} 
            {upper && <div className="flex flex-row text-sm text-gray-400 font-light ">
                Upper : <p className="text-white mr-2"> {upper}</p>
                Lower :<p className="text-white mr-2"> {lower}</p>
                Mid : <p className="text-white mr-2" >{mid} </p>
                {squeeze && <p>Squeeze : <p className="text-white mr-2">{squeeze}</p> </p>}   
            </div> }

            {sma_20 && <div className="flex flex-row text-sm text-gray-400 font-light ">
                SMA20  :<p className="text-white mr-2"> {sma_20}</p>
                SMA50 :<p className="text-white mr-2"> {sma_50}</p>
                SMA200 :<p className="text-white mr-2" >{sma_200} </p>
                DIST200 :<p className="text-white mr-2" >{sma_200} </p>
                ATR :<p className="text-white mr-2" >{atr} </p>
            </div>}

        </div>

       
    )
}