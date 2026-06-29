import { api } from "../../services/api.js";
import { useState, useEffect } from "react";
import IndexDesc from "./IndexDesc.jsx";

export default function IndexBlock() {
    const [indicesData, setIndicesData] = useState(null);
    const [indicesTab, setIndicesTab] = useState("");
    const [loading , setLoading ] = useState(true);
    
    useEffect(() => {
        api.get("/indices/data")
            .then((res) => {
                setIndicesData(res.data);
                // Proactively set the first index as the active tab by default
                if (res.data && Object.keys(res.data).length > 0) {
                    setIndicesTab(Object.keys(res.data)[0]);
                }
            })
            .catch((err) => console.log(err))
            .finally(()=>setLoading(false));
    }, []);

    return (
        <div className="m-4 p-2 border-2 bg-neutral-900 border-neutral-900 rounded-xl text-amber-50">

            <div className="pl-4 p-4 font-semibold text-sm tracking-wider text-neutral-200 uppercase">
                        Market Today
             </div>
            {loading && <div className=" ml-5 text-sm flex items-center justify-between text-gray-400 animate-pulse text-center"> Loading... </div>}
            {indicesData && (
                <div className="">
                    

                    <div className="border-white/20 border-1 ml-2 mt-2 grid grid-cols-4 rounded-t-xl overflow-x-auto whitespace-nowrap scroll-smooth md:scroll-auto scrollbar-hide">
                        {Object.entries(indicesData).map(([indexName, detail]) => (
                            <div     
                                key={indexName} 
                                onClick={() => setIndicesTab(indexName)}
                                className={`border-white/20 border-l-1 border-b-1 min-w-[220px] pl-4 pr-4 pt-2 pb-2 hover:bg-blue-900/10 transition-all cursor-pointer ${indicesTab === indexName ? "text-blue-600 border-b-2 border-b-blue-600 bg-neutral-950/40" : ""}`}
                            >
                                <div className="flex flex-row justify-between items-center">
                                    <div className="pt-0.5 pr-3 text-lg font-bold text-amber-50">
                                        {indexName}
                                    </div>
                                    <div className={`pl-2 text-lg font-semibold font-mono ${(detail?.change_percent ?? 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                        {detail?.Price ?? "0.00"}{(detail?.change_percent ?? 0) >= 0 ? "\u25B2" : "\u25BC"}
                                    </div>
                                </div>
                            
                                <div className="flex flex-row justify-between items-center pt-2">
                                    <div className="text-xs font-extralight text-neutral-400"></div>
                                    <div className={`text-sm font-medium font-mono ${(detail?.change_percent ?? 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                        {(detail?.change_percent ?? 0) >= 0 ? '+' : ''}{detail?.change_percent}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Rendered cleanly outside of the grid mapping structure */}
                    {indicesTab && indicesData[indicesTab] && (
                        <div className="mx-2">
                            <IndexDesc data={indicesData[indicesTab]} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
