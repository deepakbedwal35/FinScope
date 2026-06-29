import {api} from "../../services/api"
import {useState , useEffect} from "react"
import {toast} from "react-hot-toast"
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function SectorsFullScan(){
  const [getSectorData , setSectorData] = useState(null);
  const [isLoading , setLoading] = useState(false);
  const [showTable , setShowTable] = useState(false);

 

function fmtPct(v) {
  if (v === null || v === undefined) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

// Heat background scaled by rel_6m, clamped ±35%
function heatBg(val, scale = 35) {
  const t = Math.max(-1, Math.min(1, val / scale));
  if (t >= 0) {
    const c = Math.round(210 - t * 110);
    return `rgb(${c}, ${Math.round(210 + t * 35)}, ${c})`;
  }
  const c = Math.round(210 + t * 110);
  return `rgb(${Math.round(210 - t * 35)}, ${c}, ${c})`;
}
  

  function fetchSectorData() {
    setLoading(true);
    api
      .get("/analysis/sector-rotation")
      .then((res) => {
        setSectorData(res.data);
        // toast.success("Sector rotation analysis fetched");
      })
      .catch((e) => toast.error("Error fetching sector data"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchSectorData();
  }, []);

  return(
    <div className="dark:bg-neutral-900 bg-neutral-900 p-4 m-5 text-white rounded-2xl">
      <div className="flex items-center justify-between mb-1">
        <div className="font-sans tracking-wider  text-lg font-bold">Sector Heatmap</div>
        <button
          onClick={fetchSectorData}
          // disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-neutral-700 rounded-lg px-3 py-1.5 disabled:opacity-50 transition-colors"
        >
          <div className={`${isLoading == true ?"animate-spin":""}`}> <RefreshIcon size={10} sx={{fontSize : "20px"}} className={isLoading ? "animate-spin" : ""} />
          </div>
          Refresh
        </button> 
      </div>

      {isLoading && (
        <div className="text-center text-gray-300 py-10">Loading…</div>
      )}

      {!isLoading && getSectorData && (
        <div>
          <div className="text-sm text-gray-400 pl-1 mb-3">
            {/* Tips to choose sectors to invest in */}
          </div>

          {/* Nifty reference cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-neutral-800 rounded-xl p-4">
              <div className="text-xs text-gray-400">Nifty 20d return</div>
              <div
                className="text-2xl font-medium mt-1"
                style={{ color: getSectorData.nifty_20d >= 0 ? "#3dd68c" : "#f75f5f" }}
              >
                {(getSectorData.nifty_20d)}%
              </div>
            </div>
            <div className="bg-neutral-800 rounded-xl p-4">
              <div className="text-xs text-gray-400">Nifty 6m return</div>
              <div
                className="text-2xl font-medium mt-1"
                style={{ color: getSectorData.nifty_6m >= 0 ? "#3dd68c" : "#f75f5f" }}
              >
                {(getSectorData.nifty_6m)}%
              </div>
            </div>
          </div>

          {/* Heatmap grid — ranked, color by rel_6m intensity */}
          <div
            className="grid grid-cols-5 gap-4 mb-6"
            // style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
          >
            {getSectorData.sectors &&
              Object.entries(getSectorData.sectors)
                .sort((a, b) => a[1].rank - b[1].rank)
                .map(([sectorName, d]) => {
                  // const Icon = STATUS_ICON[d.status] || IconSnowflake;
                  return (
                    <div
                      key={sectorName}
                      className="rounded-xl p-3 cursor-pointer transition-transform hover:scale-[1.03]"
                      style={{ background: heatBg(d.rel_6m) }}
                      onClick={() => {
                        // navigate to sector-filtered scan
                        // e.g. navigate(`/scan?sector=${sectorName}`)
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-sm font-medium text-neutral-900">
                          #{d.rank} {sectorName}
                        </div>
                        {/* <Icon size={16} color={d.color} className="shrink-0" /> */}
                      </div>
                      <div className="text-xl font-medium text-neutral-900 mt-1.5">
                        {fmtPct(d.rel_6m)}
                      </div>
                      <div className="text-[11px] text-neutral-700 mt-0.5">
                        6m vs Nifty · score {d.score}
                      </div>
                    </div>
                  );
                })}
          </div>

          {!showTable  && <div className=""> 
            <button onClick ={()=>setShowTable(true)}className="border p-1 rounded-lg text-xs cursor-pointer border-white/20 hover:bg-emerald-300/20 text-center bg-emerald-300/30 ">Show Full Table</button>
            </div> }

          {showTable  && <div className=""> 
            <button onClick ={()=>setShowTable(false)} className="border p-1 rounded-lg text-xs cursor-pointer border-white/20 hover:bg-emerald-300/20 bg-emerald-300/30 ">Hide Table</button>
            </div> }

          { showTable && 
          <table className="w-full text-sm">
            <thead className="border-b border-gray-600">
              <tr className="text-left text-gray-400">
                <th className="py-2 px-2 font-normal">Sector</th>
                <th className="py-2 px-2 font-normal text-right">20d</th>
                <th className="py-2 px-2 font-normal text-right">6m</th>
                <th className="py-2 px-2 font-normal text-right">Rel 20d</th>
                <th className="py-2 px-2 font-normal text-right">Rel 6m</th>
                <th className="py-2 px-2 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {getSectorData.sectors &&
                Object.entries(getSectorData.sectors)
                  .sort((a, b) => a[1].rank - b[1].rank)
                  .map(([sectorName, d]) => {
                    const colorFor = (v) => (v >= 0 ? "#3dd68c" : "#f75f5f");
                    return (
                      <tr
                        key={sectorName}
                        className="border-b border-neutral-800 hover:bg-neutral-800"
                      >
                        <td className="py-2 px-2">{sectorName}</td>
                        <td className="py-2 px-2 text-right" style={{ color: colorFor(d.ret_20d) }}>
                          {fmtPct(d.ret_20d)}
                        </td>
                        <td className="py-2 px-2 text-right" style={{ color: colorFor(d.ret_6m) }}>
                          {fmtPct(d.ret_6m)}
                        </td>
                        <td className="py-2 px-2 text-right" style={{ color: colorFor(d.rel_20d) }}>
                          {fmtPct(d.rel_20d)}
                        </td>
                        <td className="py-2 px-2 text-right" style={{ color: colorFor(d.rel_6m) }}>
                          {fmtPct(d.rel_6m)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${d.color}22`, color: d.color }}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>}

          <div className="text-[11px] text-gray-500 text-right mt-3">
            Updated {getSectorData.timestamp}
          </div>
        </div>
      )}

    </div>
  )


    

}
