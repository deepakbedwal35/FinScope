import Indicators from "../../features/Indicators";

export default function Technicals({stockData}){

    return (
        <div>
            <div className="text-amber-200 p-1 text-lg">Technicals</div>
            <div> <Indicators indicators = {stockData?.indicators}/></div>
           
            </div>
    )


}