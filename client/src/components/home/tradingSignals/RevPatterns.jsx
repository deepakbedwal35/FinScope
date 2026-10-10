import { api } from "../../../services/api";
import { useState, useEffect, useCallback } from "react";
import InlineErrorState from "../../common/InlineErrorState";
import { notify } from "../../../services/notify";
import SignalCard from "./SignalCard";

export default function RevPatterns({ isHome = true }) {
    const [reversalStocks, setReversalStocks] = useState(null);
    const [error, setError] = useState(false);

    const fetchReversals = useCallback(() => {
        setError(false);
        api.get("/reversal/stocks")
            .then((res) => {
                setReversalStocks(res.data);
                setError(false);
                notify.clearPanelFailure("reversals");
            })
            .catch((e) => {
                console.error("Error occurred in Reversals", e);
                setError(true);
                notify.aggregatedError("reversals", fetchReversals);
            });
    }, []);

    useEffect(() => {
        fetchReversals();
    }, [fetchReversals]);

    return (
        <div className="p-4">
            {error && (
                <InlineErrorState 
                    title="Reversal Patterns Unavailable" 
                    message="Could not load reversal pattern signals." 
                    onRetry={fetchReversals} 
                />
            )}
            {!error && !reversalStocks?.success && (
                <div className="h-[100px] text-center flex items-center text-sm justify-center text-gray-400">
                    There are no signals available at the moment
                </div>
            )}
            {!error && reversalStocks?.total > 0 && (
                <div className={isHome ? "flex gap-4" : "flex gap-3 flex-wrap"}>
                    {reversalStocks?.results?.map((details) => (
                        <div key={details?.symbol || Math.random()} className="w-[450px] flex-shrink-0">
                            <SignalCard details={details} patterns={details?.reversal} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

