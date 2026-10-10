import { useState, useEffect, useCallback } from "react";
import Filters from "./Filters";
import { api } from "../../../services/api";
import InlineErrorState from "../../common/InlineErrorState";
import { notify } from "../../../services/notify";
import FullScanResult from "../../fullscan/FullScanResult";

export default function Indicators() {
  const tabs = ["RSI", "MACD", "SMA", "EMA"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [filters, setFilters] = useState({
    category:   "NIFTY50",
    indicators: ["Bullish RSI"],  
    limit:      5,
  });

  const fetchScan = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .post("/fullscan", filters, { withCredentials: true })
      .then((res) => {
        setStockData(res.data);
        setError(false);
        notify.clearPanelFailure("indicators");
      })
      .catch((err) => {
        console.error("Indicators fetch error:", err);
        setError(true);
        notify.aggregatedError("indicators", fetchScan);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setFilters((prev) => ({ ...prev, indicators: [] }));
  }

  return (
    <div className="bg-neutral-900 m-4 tracking-wider pt-8 pl-8 p-2 rounded-xl text-gray-200">
      <div className="font-medium text-normal tracking-wider text-neutral-200">
        Technical indicators
      </div>

      <div className="flex relative gap-4 text-sm py-4">
        {tabs.map((tab) => (
          <div key={tab} className="flex items-center flex-row justify-end">
            <div
              onClick={() => handleTabChange(tab)}
              className={`p-1 w-[120px] rounded-lg text-center hover:text-blue-500 hover:bg-blue-400/10 cursor-pointer border border-white/20 ${
                activeTab === tab ? "bg-blue-400/10 text-blue-500" : ""
              }`}
            >
              {tab}
            </div>

            {activeTab === tab && (
              <div className="absolute right-4 cursor-pointer">
                <Filters ind={tab} setFilters={setFilters} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        {loading && <div className="text-gray-400  pt-38  mt-20 text-sm py-4"></div>}

        {error && !loading && (
          <InlineErrorState 
            title="Indicators Unavailable" 
            message="Could not load technical indicator scan results." 
            onRetry={fetchScan} 
          />
        )}

        {!loading && !error && stockData && (
          <div className="   "><FullScanResult getStocks={stockData} isHome = {true}/></div>
        )}

        {!loading && !error && !stockData && (
          <div className="text-gray-400   text-center p-20  mt-10 text-sm py-4">No results for {activeTab}</div>
        )}
      </div>
    </div>
  );
}