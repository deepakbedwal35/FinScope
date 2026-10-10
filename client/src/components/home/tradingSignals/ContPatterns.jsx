import { api } from "../../../services/api";
import { useState, useEffect, useCallback } from "react";
import InlineErrorState from "../../common/InlineErrorState";
import { notify } from "../../../services/notify";
import SignalCard from "./SignalCard";

export default function ContPatterns({ isHome = true }) {
    const [contStocks, setContStocks] = useState(null);
    const [error, setError] = useState(false);

    const fetchContinuations = useCallback(() => {
        setError(false);
        api.get("/continuation/stocks")
            .then((res) => {
                setContStocks(res.data);
                setError(false);
                notify.clearPanelFailure("continuations");
            })
            .catch((e) => {
                console.error("Error occurred in Continuations", e);
                setError(true);
                notify.aggregatedError("continuations", fetchContinuations);
            });
    }, []);

    useEffect(() => {
        fetchContinuations();
    }, [fetchContinuations]);
    
    return (
        <div className="p-4">
            {error && (
                <InlineErrorState 
                    title="Continuation Patterns Unavailable" 
                    message="Could not load continuation pattern signals." 
                    onRetry={fetchContinuations} 
                />
            )}
            {!error && !contStocks?.success && (
                <div className="min-h-[100px] flex items-center justify-center text-center text-sm text-gray-400">
                    There are no signals available at the moment
                </div>
            )}
            {!error && contStocks?.total > 0 && (
                <div className={isHome ? "flex flex-row gap-4 min-w-[500px] overflow-x-auto scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out" : "flex flex-wrap gap-3"}>
                    {contStocks?.results?.map((details) => (
                        <div key={details?.symbol || Math.random()} className="w-[450px] flex-shrink-0">
                            <SignalCard details={details} patterns={details?.cont} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

