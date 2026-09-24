export default function TradePerformance({ tradeDetail }) {
    if (tradeDetail?.isOpen) return <></>;

    const entryPrice = tradeDetail?.entryPrice;
    const exitPrice = tradeDetail?.exitPrice;
    const pct =
        entryPrice && exitPrice != null
            ? (((exitPrice - entryPrice) * 100) / entryPrice).toFixed(2)
            : null;

  
    let outcome;
    if (tradeDetail?.target2Hit) {
        outcome = { label: "Target 2 Hit", tone: "win" };
    } else if (tradeDetail?.stopLossHit) {
        outcome = { label: "Stop Loss Hit", tone: "loss" };
    } else if (tradeDetail?.target1Hit) {
        outcome = { label: "Target 1 Hit", tone: "win" };
    } else {
        outcome = { label: "Closed", tone: pct != null && pct >= 0 ? "win" : "loss" };
    }

    const toneClasses =
        outcome.tone === "win"
            ? "bg-green-800/20 font-medium text-green-500"
            : "bg-red-800/20 font-medium text-red-500";

    return (
        <div className="grid grid-cols-2 mt-6 text-xs gap-4">
            <div className={`border-white/10 border text-center p-1 rounded-sm ${toneClasses}`}>
                {pct != null ? `${pct >= 0 ? "+" : ""}${pct}%` : "\u2014"}
            </div>
            <div className={`border-white/10 border text-center p-1 rounded-sm ${toneClasses}`}>
                {outcome.label}
            </div>

            
        </div>
    );
}