import Tooltip from "@mui/material/Tooltip";
import {useEffect} from "react";
export default function BacktestTradelog({ tradelog, year = 2026  }) {
  let filteredTradeLog = tradelog?.filter(
    (details) => String(details?.year) === String(year)
  ) || [];



  const formatPercent = (val) => {
    if (val === undefined || val === null) return "-";
    return typeof fmtPct === "function" ? fmtPct(val) : `${val}%`;
  };


  const getStatusStyle = (outcome) => {
    if (outcome?.includes("T2_HIT") || outcome?.includes("T1_HIT")) {
      return { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" }; 
    }
    if (outcome?.includes("SL") || outcome?.includes("LOSS")) {
      return { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" }; 
    }
    return { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" };
  };

  return (
    <div className=" p-2">
        
      {filteredTradeLog.length > 0 ? (
        <table className="w-full m-4 text-sm">
          <thead className="border-b border-gray-600">
            <tr className="text-left text-gray-400">
              <th className="py-2 px-2 font-normal">Date</th>
              <th className="py-2 px-2 font-normal text-right">Entry</th>
              <th className="py-2 px-2 font-normal text-right">Exit</th>
              <th className="py-2 px-2 font-normal text-right">Return %</th>
              <th className="py-2 px-2 font-normal text-right">Days Held</th>

              <th className="py-2 px-2 font-normal text-right"><Tooltip title={"The maximum potential profit a trade experiences before it is closed"} placement="top" arrow="true">MFE (%)</Tooltip></th>
              <th className="py-2 px-2 font-normal text-right">MAE (%)</th>
              <th className="py-2 px-2 font-normal text-right">RSI</th>
              <th className="py-2 px-2 font-normal text-right">Fin Grade</th>
              <th className="py-2 px-2 font-normal text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTradeLog.map((details, index) => {
              const statusColor = getStatusStyle(details?.outcome);
              return (
                <tr
                  key={index}
                  className="border-b border-neutral-800 hover:bg-neutral-800"
                >
                 
                  <td className="py-2 px-2 text-neutral-300">{details?.date || "-"}</td>
                  <td className="py-2 px-2 text-right">{details?.entry || "-"}</td>
                  <td className="py-2 px-2 text-right">{details?.exit || "-"}</td>
                  <td className={`py-2 px-2 text-right font-medium ${details?.return_pct >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercent(details?.return_pct)}
                  </td>
                  <td className="py-2 px-2 text-right">{details?.held_days ?? "-"}</td>
                  <td className={`py-2 px-2 text-right font-medium ${details?.mfe_pct >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercent(details?.mfe_pct)}
                  </td>
                  <td className={`py-2 px-2 text-right font-medium ${details?.mae_pct >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercent(details?.mae_pct)}
                  </td>
                  <td className="py-2 px-2 text-right text-neutral-400">
                    {details?.rsi ? Number(details.rsi).toFixed(2) : "-"}
                  </td>
                  <td className="py-2 px-2 text-right text-neutral-400">
                    {details?.grade?(details.grade) : "-"}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ 
                        backgroundColor: statusColor.bg, 
                        color: statusColor.text 
                      }}
                    >
                      {details?.outcome || "PENDING"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-4 text-gray-500 border border-dashed border-neutral-800 rounded">
          No trade data found for the year {year}.
        </div>
      )}
    </div>
  );
}


//       "date": "2026-05-07",
//       "year": "2026",
//       "entry": 1429.59,
//       "exit": 1380.38,
//       "sl": 1380.38,
//       "t1": 1528.01,
//       "t2": 1601.83,
//       "outcome": "SL_HIT",
//       "return_pct": -3.44,
//       "held_days": 2,
//       "score": 10,
//       "grade": "C",
//       "mfe_pct": 0.46,
//       "mae_pct": -3.77,
//       "risk_pct": 3.44,
//       "trade_win": false,
//       "model_win": false,
//       "be_triggered": false,
//       "partial_booked": false,
//       "rsi": 59.411821510029874