import { useState } from "react";

export default function ReversalPattern({ reversal }) {
  const [expanded, setExpanded] = useState(false);
  const best = reversal?.best;

  const formatName = (candleName) => {
    if (!candleName) return "";
    return candleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="">
      {!reversal?.found && <div className="text-center mt-2">No Reversal Pattern Found </div>}

      {reversal?.found && (
        <div className=" mt-2">
          <div className=" text-lg font-sans trackingn-wider font-semibold">Reversal</div>

          <div
            onClick={() => setExpanded((prev) => !prev)}
            className="m-4 p-2 rounded-lg bg-gray-600 cursor-pointer transition-colors hover:bg-gray-500/80"
          >
            {/* Summary row - always visible, click target */}
            <div className="flex font-stretch-90% flex-row justify-between items-center">
              <div className="tracking-wider">{formatName(best?.name)}</div>
              <div className="flex flex-row gap-2 items-center">
                <div
                  className="border-[0.5px] text-xs mr-6 rounded-2xl p-2"
                  style={{
                    background: best?.direction === "BULLISH" ? "#10b98133" : "#57534e",
                  }}
                >
                  {best?.direction}
                </div>
                {best?.confirmed ? (
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-500/30">
                    ⚡ Active Signal
                  </span>
                ) : (
                  <span className="bg-stone-600 text-stone-300 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    ⏳ Watching
                  </span>
                )}
                {/* Chevron indicates expand/collapse affordance */}
                <svg
                  className={`w-4 h-4 ml-2 text-gray-300 transition-transform duration-200 ${
                    expanded ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div
              className=" text-sm font-md mr-6 p-2"
              style={{ color: best?.direction === "BULLISH" ? "#03fc07" : "#fc0320" }}
            >
              {best?.desc || best?.description}
            </div>

            {/* Expandable detail section */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className=" pl-2  text-sm pb-2 font-light text-gray-200 ">
                {best?.trade_note}
              </div>
              <div className="flex flex-row p-2 gap-3 flex-wrap">
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">Confidence</span>
                  {best?.confidence}%
                </div>
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">Bars</span>
                  {best?.bars_formed}
                </div>
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">LS</span>
                  &#8377;{best?.ls_price || "N/A"}
                </div>
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">Head</span>
                  &#8377;{best?.head_price || "N/A"}
                </div>
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">Neckline</span>
                  &#8377;{best?.neckline || "N/A"}
                </div>
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">Target</span>
                  &#8377;{best?.price_target}
                </div>
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">RS</span>
                  &#8377;{best?.rs_price || "N/A"}
                </div>
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">Trough1</span>
                  &#8377;{best?.trough1 || "N/A"}
                </div>
                <div className="text-sm text-white">
                  <span className="font-light text-sm text-gray-400 ">Trough2</span>
                  &#8377;{best?.trough2 || "N/A"}
                </div>
                {best?.vol_ok !== undefined && (
                  <div className="text-sm text-white">
                    <span className="font-light text-sm text-gray-400 ">Vol OK</span>
                    {best?.vol_ok ? "Yes" : "No"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}