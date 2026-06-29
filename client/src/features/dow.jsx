import Block from "../components/stockOverview/DowBlock"
export default function dow({stockData}){

    return (
        <div className="text-2xl font-bold font-nova tracking-wider mt-5">
            <h1 className="p-2 text-lg text-amber-200 ">Mutitime Frame Analysis</h1>
                <Block title= "THE TIDE (PRIMARY >  1Y)" value={stockData?.dow?.primary.trend} desc={stockData?.dow?.primary?.description} color = {stockData?.dow?.primary?.color} />
                <Block title= "THE WAVES (SECONDARY - 3W TO 3MO)" value={stockData?.dow?.secondary.trend} desc={stockData?.dow?.secondary?.description } color = {stockData?.dow?.secondary?.color} />
                <Block title= "THE RIPPLES (MINOR < 3W)" value={stockData?.dow?.minor.trend} desc={stockData?.dow?.minor?.description} color = {stockData?.dow?.minor?.color} />
                <div style={{borderColor : stockData?.dow?.signal_color}} className="p-2 m-4 flex border flex-col items-center justify-center  text-white rounded-xl bg-neutral-800/50">
                    <div style = {{color : stockData?.dow?.signal_color}}>{stockData?.dow?.signal}</div>
                    <div className="p-2 font-light text-sm">{stockData?.dow?.signal_desc}</div>
                </div>
        </div>
        
    )

}