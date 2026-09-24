import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { toast } from "react-hot-toast";
import TradePerformance from "./TradePerformance";

export default function Action({ stock, currPrice }) {

    const findLeftShift = (price) => {
        const range = (stock?.target2 ?? 0) - (stock?.stopLoss ?? 0);
        if (!range) return 0;
        const pct = ((price - stock?.stopLoss) / range) * 100;
        return Math.min(100, Math.max(0, pct));
    };

    const slPct = findLeftShift(stock?.stopLoss);
    const entryPct = findLeftShift(stock?.entryPrice);
    const t1Pct = findLeftShift(stock?.target1);
    const t2Pct = findLeftShift(stock?.target2);
    const exitPct = stock?.exitPrice != null ? findLeftShift(stock.exitPrice) : null;

    // Added dynamic zIndexClass prop to cleanly control hover popup layers
    const Marker = ({ pct, label, chipColor, title, value, zIndexClass = "z-20" }) => (
        <div
            style={{ left: `${pct}%`, transform: "translateX(-50%)" }} 
            className="group absolute top-0 cursor-pointer"
        >
            <div className="-top-3 z-20  pt-0.5 absolute">
                <span className={`border-white/10 border rounded-4xl p-1 ${chipColor}`}>{label}</span>
            </div>
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-neutral-900 border border-neutral-800 rounded-md shadow-lg p-2 ${zIndexClass}`}>
                <div className="whitespace-nowrap text-gray-400 text-sm">{title}</div>
                <div className="text-gray-300 pt-1 font-medium whitespace-nowrap">{"\u20B9"}{value}</div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex text-gray-300 pb-2 justify-between text-xs">
                <div className="text-xs text-gray-300">
                    <div className="text-gray-400">Recommended Price</div>
                    <div>{"\u20B9"}{stock?.entryPrice}</div>
                </div>
                <div>
                    <div className="text-gray-400">Confidence</div>
                    <div className={`text-center ${stock?.confidence > 65 ? "text-green-400" : "text-orange-300"}`}>
                        {stock?.confidence || "0.00"}%
                    </div>
                </div>
            </div>

            <div className="text-xs relative pb-12 mr-6 ml-2 mt-6 h-1">
                {/* stopLoss to entry: red dashed */}
                <div
                    className="absolute top-0 border-t border-dashed border-red-500"
                    style={{ left: `${slPct}%`, width: `${entryPct - slPct}%` }}
                />
                {/* entry to target1: green dashed */}
                <div
                    className="absolute top-0 border-t border-dashed border-green-500"
                    style={{ left: `${entryPct}%`, width: `${t1Pct - entryPct}%` }}
                />
                {/* target1 to target2: green dashed */}
                <div
                    className="absolute top-0 border-t border-dashed border-green-500"
                    style={{ left: `${t1Pct}%`, width: `${t2Pct - t1Pct}%` }}
                />

                {/* Open trade: solid line from entry to current price */}
                {!stock?.exitPrice && currPrice != null && (
                    <>
                        {currPrice > stock?.entryPrice && (
                            <div
                                className="absolute top-0 border-t border-solid border-green-500 "
                                style={{
                                    left: `${entryPct}%`,
                                    width: `${Math.min(findLeftShift(currPrice), t2Pct) - entryPct}%`,
                                }}
                            />
                        )}
                        {currPrice < stock?.entryPrice && (
                            <div
                                className="absolute top-0 border-t-2 border-solid border-red-500 z-10"
                                style={{
                                    left: `${Math.max(findLeftShift(currPrice), slPct)}%`,
                                    width: `${entryPct - Math.max(findLeftShift(currPrice), slPct)}%`,
                                }}
                            />
                        )}
                    </>
                )}

                {/* Closed trade: solid line from entry to exit price. */}
                {stock?.exitPrice != null && (
                    <>
                        {stock.exitPrice > stock?.entryPrice && (
                            <div
                                className="absolute top-0 border-t border-solid border-green-500 z-10"
                                style={{
                                    left: `${entryPct}%`,
                                    width: `${Math.min(exitPct, t2Pct) - entryPct}%`,
                                }}
                            />
                        )}
                        {stock.exitPrice < stock?.entryPrice && (
                            <div
                                className="absolute top-0 border-t-2 border-solid border-red-500 z-10"
                                style={{
                                    left: `${Math.max(exitPct, slPct)}%`,
                                    width: `${entryPct - Math.max(exitPct, slPct)}%`,
                                }}
                            />
                        )}
                    </>
                )}

                {/* Added z-50 to SL, T1, T2 and Exit markers */}
                <Marker pct={slPct} label="SL" chipColor="text-red-700 bg-red-900/10" title="Stop Loss" value={stock?.stopLoss} zIndexClass="z-50" />
                <Marker pct={entryPct} label="B" chipColor="text-green-700 bg-green-900/20" title="Entry Price" value={stock?.entryPrice} zIndexClass="z-60" />
                <Marker pct={t1Pct} label="T1" chipColor="text-amber-600 bg-amber-700/20" title="Target 1" value={stock?.target1} zIndexClass="z-50" />
                <Marker pct={t2Pct} label="T2" chipColor="text-amber-600 bg-amber-700/20" title="Target 2" value={stock?.target2} zIndexClass="z-50" />

                {stock?.exitPrice != null && (
                    <Marker
                        pct={Math.max(0, exitPct - 1)}
                        label="S"
                        chipColor="text-red-600 bg-orange-700/20 border-red-600/10"
                        title="Exit Price"
                        value={stock.exitPrice}
                        zIndexClass="z-50"
                    />
                )}
            </div>

            {stock?.isOpen && currPrice != null && (
                <div className="grid grid-cols-2 mt-6 text-xs gap-4">
                    <div
                        className={`border-white/10 p-1 border text-center rounded-sm ${
                            currPrice > stock?.entryPrice
                                ? "bg-green-800/20 font-medium text-green-500"
                                : "text-red-500 bg-red-800/20"
                        }`}
                    >
                        ACHIEVED {(((currPrice - stock?.entryPrice) * 100) / stock?.entryPrice).toFixed(2)}%
                    </div>
                    <div className="border-white/10 p-1 border text-center rounded-sm bg-amber-800/10 text-amber-500">
                        {(((stock?.target1 - currPrice) * 100) / stock?.entryPrice).toFixed(2)}% POTENTIAL LEFT
                    </div>
                </div>
            )}

            {!stock?.isOpen && <TradePerformance tradeDetail={stock} />}
        </div>
    );
}
