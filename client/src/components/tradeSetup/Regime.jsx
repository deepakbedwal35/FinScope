import Block from "../stockOverview/DowBlock"
export default function Regime({regime}){
    return (
        <div className=" pt-6  px-4  bg-neutral-900 rounded-xl text-lg  ">
            <div class>Regime Check</div>
         

            
            
            {!regime?.regime_ok && <div className="text-center h-full w-full  mt-30 text-gray-400 font-medium text-sm ">
                {regime?.summary}
                
             </div>}
       

            {regime?.regime_ok && <div className="text-sm font-medium p-2">
                <Block title={"Volatility"}  value ={regime?.vol_ratio}  desc={regime?.vol_note} color ={regime?.vol_color}/>
                <Block title={"Participation"}  value ={regime?.participation}  desc={regime?.part_note} color ={regime?.part_color}/>
                <Block title={"Trend"}    desc={regime?.trend_note} color ={regime?.trend_color}/>
                
               
             
             
            
            </div>}

        </div>
    )
}