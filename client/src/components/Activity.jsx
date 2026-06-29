export default function Activity({data}){
    return (

        <div className=" border-b-1   py-4 grid grid-cols text-[15px] font-light  border-dashed border-white/20 mx-5"> 
            <div className=" pr-2 border-white/20 border-dashed">
                <div className="font-">Activity</div>
                <div className="text-sm text-center flex flex-row p-2 justify-between ">
                    <div>
                        <div className="text-gray-300 pb-2">Open</div>
                        <div className="font-medium">{data?.Open.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="text-gray-300 pb-2">High</div>
                        <div className="text-green-500 font-medium">{data?.High.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="text-gray-300 pb-2">Low</div>
                        <div className="text-red-500 font-medium">{data?.Low.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="text-gray-300 pb-2">Close</div>
                        <div className="font-medium">{data?.Close.toFixed(2)}</div>
                    </div>

                    <div>
                        <div className="text-gray-300 pb-2">Volume</div>
                        <div className="font-medium">{(data?.Volume/10000000).toFixed(4)} Cr</div>
                    </div>

                    <div>
                        <div className="text-gray-300 pb-2">Volume Ratio</div>
                        <div className="font-medium">{data?.vol_ratio ?? data?.Vol_ratio}</div>
                    </div>

                </div>
            </div>

        </div>


    )

}