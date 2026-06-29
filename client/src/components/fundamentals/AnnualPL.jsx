import {useState , useEffect} from "react"
export default function AnnualPL({annual , title}){
    const [showTable , setShowTable] = useState(false);

    return(
        <div className="p-4">
             
            <div className="p-2 text-lg font-medium text-amber-200">{title}</div>
            {annual.length == 0 && <div className="text-center text-sm font-light text-cyan-300"> No Recent data Found</div>}

            {annual.length > 0 && 
            <div className="pl-4  flex flex-col  gap-7 pt-2 text-sm font-light"> 
              <div className="flex gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {annual?.map((details) => (
            <div 
            key={details?.year} 
            className="border border-gray-800 text-center flex flex-col bg-sky-900/10 p-4 rounded-lg"
            >
            {/* Year Label */}
            <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                FY {details?.year}
            </div>

            {/* Profit Growth Display */}
            <div className="text-base font-semibold mb-1" style={{ color: details?.pro_g_color }}>
                <span className="text-[10px] font-normal text-gray-400">Profit: </span>
                {details?.prof_growth == null ? "N/A" : `${details.prof_growth}%`}
            </div>

            {/* Revenue Growth Display */}
            <div className="text-sm font-medium" style={{ color: details?.rev_g_color }}>
                <span className="text-[10px] font-normal text-gray-400">Revenue: </span>
                {details?.rev_growth == null ? "N/A" : `${details.rev_growth}%`}
            </div>
            </div>
        ))}
        </div>
              </div>
            {!showTable  && <div className=""> 
            <button onClick ={()=>setShowTable(true)}className="border p-1 rounded-lg text-xs cursor-pointer border-white/20 hover:bg-emerald-400/10   bg-emerald-300/30 ">Show Full Table</button>
            </div> }

          {showTable  && <div className=""> 
            <button onClick ={()=>setShowTable(false)} className="border p-1 rounded-lg text-xs cursor-pointer border-white/20 hover:bg-emerald-800/20 bg-emerald-300/30 ">Hide Table</button>
            </div> }
                
            </div>}

            

            {showTable && (
                <table className="w-full mt-2 border border-white/20 text-sm">
                    <thead className="border-b border-t  border-gray-600">
                    <tr className="text-left text-gray-400">
                        <th className="py-2 px-2 font-normal">Year</th>
                        <th className="py-2 px-2 font-normal text-right">Revenue</th>
                        <th className="py-2 px-2 font-normal text-right">Profit</th>
                        <th className="py-2 px-2 font-normal text-right">EBITDA</th>
                        <th className="py-2 px-2 font-normal text-right">Margin</th>
                        <th className="py-2 px-2 font-normal text-right">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {annual?.map((details) => (
                        <tr key={details.year} className="border-b border-gray-800 hover:bg-gray-900/50">
                        {/* Year */}
                        <td className="py-3 px-2 font-medium text-gray-200">
                            {details.year}
                        </td>
                        
                        {/* Revenue + Growth */}
                        <td className="py-3 px-2 text-right">
                            <div className="text-gray-100">{details.revenue_str}</div>
                            {details.rev_growth !== null && (
                            <div className="text-xs" style={{ color: details.rev_g_color }}>
                                {details.rev_arrow}
                            </div>
                            )}
                        </td>
                        
                        {/* Profit + Growth */}
                        <td className="py-3 px-2 text-right">
                            <div className="text-gray-100">{details.profit_str}</div>
                            {details.prof_growth !== null && (
                            <div className="text-xs" style={{ color: details.pro_g_color }}>
                                {details.prof_arrow}
                            </div>
                            )}
                        </td>
                        
                        {/* EBITDA */}
                        <td className="py-3 px-2 text-right text-gray-300">
                            {details.ebitda_str}
                        </td>
                        
                        {/* Margin % */}
                        <td className="py-3 px-2 text-right text-gray-300">
                            {details.margin_pct}%
                        </td>
                        
                        {/* Status badge */}
                        <td className="py-3 px-2 text-right">
                            <span 
                            className="inline-block text-xs font-semibold px-2 py-0.5 rounded-sm"
                            style={{ 
                                backgroundColor: `${details.profit_color}20`, 
                                color: details.profit_color 
                            }}
                            >
                            {details.is_profit ? "PROFIT" : "LOSS"}
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

           

        </div>
    )
}



//    "quarterly": [],
//   "annual": [
//     {
//       "year": "2026",
//       "revenue": 10572190000000,
//       "revenue_str": "₹10.57L Cr",
//       "profit": 807750000000,
//       "profit_str": "₹808 Cr",
//       "ebitda": 2049060000000,
//       "ebitda_str": "₹2.05L Cr",
//       "margin_pct": 7.6,
//       "rev_growth": null,
//       "prof_growth": null,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#aaaaaa",
//       "pro_g_color": "#aaaaaa",
//       "rev_arrow": "—",
//       "prof_arrow": "—",
//       "is_profit": true
//     },
//   {showTable  && <div className=""> 
//             <button onClick ={()=>setShowTable(false)} className="border p-1 rounded-lg text-xs cursor-pointer border-white/20 hover:bg-emerald-300/20 bg-emerald-300/30 ">Hide Table</button>
//             </div> }

//           { showTable && 
//           <table className="w-full text-sm">
//             <thead className="border-b border-gray-600">
//               <tr className="text-left text-gray-400">
//                 <th className="py-2 px-2 font-normal">Sector</th>
//                 <th className="py-2 px-2 font-normal text-right">20d</th>
//                 <th className="py-2 px-2 font-normal text-right">6m</th>
//                 <th className="py-2 px-2 font-normal text-right">Rel 20d</th>
//                 <th className="py-2 px-2 font-normal text-right">Rel 6m</th>
//                 <th className="py-2 px-2 font-normal text-right">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {getSectorData.sectors &&
//                 Object.entries(getSectorData.sectors)
//                   .sort((a, b) => a[1].rank - b[1].rank)
//                   .map(([sectorName, d]) => {
//                     const colorFor = (v) => (v >= 0 ? "#3dd68c" : "#f75f5f");
//                     return (
//                       <tr
//                         key={sectorName}
//                         className="border-b border-neutral-800 hover:bg-neutral-800"
//                       >
//                         <td className="py-2 px-2">{sectorName}</td>
//                         <td className="py-2 px-2 text-right" style={{ color: colorFor(d.ret_20d) }}>
//                           {fmtPct(d.ret_20d)}
//                         </td>
//                         <td className="py-2 px-2 text-right" style={{ color: colorFor(d.ret_6m) }}>
//                           {fmtPct(d.ret_6m)}
//                         </td>
//                         <td className="py-2 px-2 text-right" style={{ color: colorFor(d.rel_20d) }}>
//                           {fmtPct(d.rel_20d)}
//                         </td>
//                         <td className="py-2 px-2 text-right" style={{ color: colorFor(d.rel_6m) }}>
//                           {fmtPct(d.rel_6m)}
//                         </td>
//                         <td className="py-2 px-2 text-right">
//                           <span
//                             className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
//                             style={{ background: `${d.color}22`, color: d.color }}
//                           >
//                             {d.status}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })}
//             </tbody>
//           </table>}