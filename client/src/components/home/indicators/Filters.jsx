import { selectClasses } from "@mui/material";
import { api } from "../../../services/api";
import { useState, useEffect } from "react";

export default function Filters({ ind ,setFilters }) {

  const avail_cat = [
    "NIFTY50", "NIFTYNext50", "NIFTYMidcap150", "NIFTYSmallcap",
    "PSU/Defence", "IT/Tech", "Pharma", "Banking&Finance",
    "FMCG/Consumer", "AUTO", "Infra/Realty",
  ];

  const RSI  = ["Bullish RSI", "Bearish RSI"];
  const MACD = ["MACD > 0", "MACD < 0"];
  const SMA  = ["Golden Cross", "Price > 20SMA", "Price > 200SMA", "Death cross", "Price > 50SMA"];
  const EMA  = ["Price > 10EMA", "Price > 100EMA"];

  const filterMap = { RSI, MACD, SMA, EMA };
  const currFilters = filterMap[ind] || MACD;
  const [selected, setSelected] = useState(currFilters[0]);

  useEffect(() => {
    const defaultVal = currFilters[0];
    setSelected(defaultVal);
    setFilters((prev) => ({ ...prev, indicators: [defaultVal] }));
  }, [ind]);

  function updateFilterValue(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateIndicator(value) {
 
    setFilters((prev) => ({
      ...prev,
      indicators: [value],
    }));
  }

  return (
    <div className="flex flex-row gap-4">
      <div className="border border-white/20 rounded-sm">
        <select
          name="category"
          onChange={(e) => updateFilterValue("category", e.target.value)}
          className="w-full p-1"
        >
          {avail_cat.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="border border-white/20 rounded-sm">
        <select
          name="filters"
          // value={selected}
          onChange={(e) => updateIndicator(e.target.value)}
          className="w-full rounded-sm p-1"
        >
          {currFilters.map((filt) => (
            <option key={filt} value={filt} >{filt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}