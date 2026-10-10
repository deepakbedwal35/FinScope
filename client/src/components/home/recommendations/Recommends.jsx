import { api } from "../../../services/api";
import { useState, useEffect, Fragment, useCallback } from "react";
import CurrPriceBlock from "./CurrPriceBlock";
import Footer from "./Footer";
import Action from "./Action";
import InlineErrorState from "../../common/InlineErrorState";
import { notify } from "../../../services/notify";
import demoRecommendations from "../../../demo/demoRecommendations.json";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from "react-router-dom";

export default function Recommends({ isHome = false, isOpen = true, isDemo = false }) {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [stockPrices, setStockPrices] = useState({});
    const sliderStyle = " flex flex-row  gap-4  min-w-[500px]  overflow-x-auto whitespace-nowrap scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out";

    const fetchRecommendations = useCallback(() => {
        if (isDemo) {
            setRecommendations(demoRecommendations.allRecommends || []);
            setStockPrices(demoRecommendations.prices || {});
            setLoading(false);
            setError(false);
            return;
        }

        setLoading(true);
        setError(false);
        api.get("/recommends/list")
            .then((res) => {
                setRecommendations(res.data.allRecommends || []);
                notify.clearPanelFailure("recommendations");
            })
            .catch((err) => {
                console.error(err);
                setError(true);
                notify.aggregatedError("recommendations", fetchRecommendations);
            })
            .finally(() => setLoading(false));
    }, [isDemo]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    useEffect(() => {
        if (isDemo || !recommendations.length) return;
        const symbols = recommendations.map((r) => r.symbol);
        api.post("/fetch/price", { symbols })
            .then((res) => setStockPrices(res.data || {}))
            .catch((err) => {
                console.error("Could not fetch recommendation prices:", err);
            });
    }, [isDemo, recommendations]);

    return (
        <div className="bg-neutral-900 m-4  tracking-wider pt-8 pl-8  p-6 rounded-xl text-gray-200">
            <div className="flex justify-between mb-3">
                <div className="font-medium text-normal  tracking-wider text-neutral-200 ">Fin Recommendations</div>
                {isHome && (
                    <div 
                        onClick={() => navigate(isDemo ? "/demo/recommendations" : "/recommendations")} 
                        className="text-blue-500 mr-2 py-1 px-2 rounded-lg cursor-pointer font-medium hover:bg-indigo-800/20"
                    >
                        VIEW ALL <span className="mb-1"><ArrowForwardIosIcon sx={{ fontSize: "18px", pb: "2px" }} /></span>
                    </div>
                )}
            </div>

            {loading && <div className="text-gray-400">Loading…</div>}

            {error && !loading && (
                <InlineErrorState 
                    title="Recommendations Unavailable" 
                    message="Could not load recommendations from the server." 
                    onRetry={fetchRecommendations} 
                />
            )}

            {!loading && !error && recommendations.length === 0 && <div>No current recommendation</div>}

            {!loading && !error && recommendations.length > 0 && (
                <div className="gap-2">
                    <div className={isHome ? sliderStyle : "grid grid-cols-2 gap-4"}>
                        {recommendations.map((stock) => (
                            <Fragment key={stock._id || stock.symbol}>
                                {stock?.isOpen === isOpen && (
                                    <div className={`border border-white/20 p-4 rounded-lg ${isHome ? "min-w-115" : ""}`}>
                                        <CurrPriceBlock symbol={stock?.symbol} priceData={stockPrices[stock.symbol]} />
                                        <div className="border-b mb-2 border-white/20 pb-3 border-dashed "></div>
                                        <Action stock={stock} currPrice={stockPrices[stock.symbol]?.price} />
                                        <Footer stock={stock?.symbol} />
                                    </div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}