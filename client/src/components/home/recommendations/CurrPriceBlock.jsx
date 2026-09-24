import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuyButton from "../../../features/BuyButton"
import { useState } from 'react';
import HandleWatchlist from '../../handleWatchlist';

export default function CurrPriceBlock({ symbol, priceData, company = "company Name", isHome = true }) {
    const [orderMode, setOrderMode] = useState(null); // null | "BUY" | "SELL"
    const [watchlistSymbol, setWatchlistSymbol] = useState(null);

    // Safe checks for data properties using Nullish Coalescing fallback values
    const currentPrice = priceData?.price ?? 0;
    const priceChange = priceData?.change ?? 0;
    const changePercent = priceData?.change_percent ?? 0;
    const isPositive = priceChange >= 0;

    return (
        <div className="flex-1 text-sm rounded-lg text-gray-200">
            <div className="flex flex-row justify-between items-center">
                <div className="pr-3 text-sm font-bold">{symbol}</div>
                {!priceData && <div className="text-gray-400 text-sm mr-5 animate-pulse">Loading…</div>}
                {priceData && (
                    <div className={`pt-0.5 text-sm pr-2 font-bold font-mono ${isPositive ? "text-green-400" : "text-red-500"}`}>
                        {currentPrice.toFixed(2)} {isPositive ? "▲" : "▼"}
                    </div>
                )}
            </div>

            {priceData && (
                <div className="flex pt flex-row font-light justify-between text-sm items-center">
                    <div className="pr-3 text-xs text-gray-400"></div>
                    <div className={`pt-0.5 text-sm pr-2 font-medium font-mono ${isPositive ? "text-green-400" : "text-red-500"}`}>
                        {/* was rendering changePercent raw — could be a long
                            unrounded decimal straight from the API */}
                        ₹{priceChange.toFixed(2)} ({changePercent.toFixed(2)}%)
                    </div>
                </div>
            )}

            {priceData && !isHome && (
                <div className="flex justify-between mt-2">
                    <div className="font-light text-sm flex flex-row justify-baseline gap-2 text-gray-300">
                        <div className="flex flex-col hover:text-blue-50 cursor-pointer items-center p-2">
                            <div className="text-blue-200 hover:text-blue-400"><AnalyticsIcon /></div>
                            <div>Option Chain</div>
                        </div>
                        <div className="flex items-center hover:text-blue-50 cursor-pointer flex-col p-2">
                            <div className="text-blue-200 hover:text-blue-400"><CandlestickChartIcon /></div>
                            <div>Charts</div>
                        </div>
                    </div>

                    <div className="flex flex-row justify-end items-center text-lg font-medium gap-4 pr-2">
                        <button onClick={() => setWatchlistSymbol(symbol)} className="text-gray-200 cursor-pointer">
                            <BookmarkAddOutlinedIcon />
                        </button>
                        {watchlistSymbol && <HandleWatchlist symbol={watchlistSymbol} onDone={() => setWatchlistSymbol(null)} />}
                        <button onClick={() => setOrderMode("BUY")} className="cursor-pointer pl-4 pr-4 pt-1 pb-1 rounded-lg bg-green-400 hover:bg-green-500">Buy</button>
                        {/* Was missing an onClick entirely — the Sell button did nothing. */}
                        <button onClick={() => setOrderMode("SELL")} className="cursor-pointer pl-4 pr-4 pt-1 pb-1 rounded-lg bg-red-400 hover:bg-red-500">Sell</button>
                    </div>

                    {orderMode && (
                        <div className="p-4 fixed inset-0 z-50">
                            {/*
                              NOTE: I don't have BuyButton.jsx's source, so I
                              can't confirm it actually branches on a `type`
                              prop to render a sell flow. Passing it through
                              on the assumption BuyButton supports BUY/SELL —
                              if it doesn't, this still opens the buy modal
                              regardless of which button was clicked. Show me
                              BuyButton.jsx and I'll wire this properly.
                            */}
                            <BuyButton data={symbol} type={orderMode} handleIsOpen={() => setOrderMode(null)} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}