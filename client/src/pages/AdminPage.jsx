import { useState, useEffect } from "react"
import { api } from "../services/api"
import { toast } from "react-hot-toast";

export default function AdminPage() {
    const [scanResult, setScanResult] = useState(null);
    const [addResult, setAddResult] = useState(null);
    const [handleResult, setHandleResult] = useState(null);

    const [scanLoading, setScanLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [handleLoading, setHandleLoading] = useState(false);

    const [recommendations, setRecommendations] = useState([]);
    const [listLoading, setListLoading] = useState(true);

    const loadRecommendations = () => {
        setListLoading(true);
        api.get("/recommends/list")
            .then((res) => setRecommendations(res.data.allRecommends || []))
            .catch((err) => toast.error("Failed to load recommendations: " + err.message))
            .finally(() => setListLoading(false));
    };

    useEffect(() => {
        loadRecommendations();
    }, []);

    const handleFullscan = () => {
        setScanLoading(true);
        setScanResult(null);
        api.get("/runfullscan")
            .then((res) => {
                setScanResult(res.data);
                toast.success("Full scan complete");
            })
            .catch((e) => toast.error("Error: " + e.message))
            .finally(() => setScanLoading(false));
    };

    const addRecommendationInDB = () => {
        setAddLoading(true);
        setAddResult(null);
        api.get("/recommends/add")
            .then((res) => {
                setAddResult(res.data);
                toast.success(`Added ${res.data?.count ?? 0} new recommendation(s)`);
                loadRecommendations();
            })
            .catch((err) => toast.error("Error adding recommendations: " + err.message))
            .finally(() => setAddLoading(false));
    };

    const handleRecommendInDB = () => {
        setHandleLoading(true);
        setHandleResult(null);
        api.get("/recommends/handle")
            .then((res) => {
                setHandleResult(res.data);
                toast.success(res.data?.message || "Recommendations updated");
                loadRecommendations();
            })
            .catch((err) => toast.error("Error handling recommendations: " + err.message))
            .finally(() => setHandleLoading(false));
    };

    const outcomeLabel = (r) => {
        if (r.isOpen) return { text: "Open", tone: "text-blue-400" };
        if (r.target2Hit) return { text: "Target 2 Hit", tone: "text-green-400" };
        if (r.stopLossHit) return { text: "Stop Loss Hit", tone: "text-red-400" };
        if (r.target1Hit) return { text: "Target 1 Hit", tone: "text-green-400" };
        return { text: "Closed", tone: "text-gray-400" };
    };

    return (
        <div className="text-white flex flex-col gap-6 p-6 max-w-5xl mx-auto">
            <h1 className="text-xl font-semibold">Admin Page</h1>

            {/* Actions */}
            <div className="flex flex-col gap-4">
                {/* Full scan */}
                <div className="border border-white/20 rounded-lg p-4">
                    <button
                        onClick={handleFullscan}
                        disabled={scanLoading}
                        className="border-white/40 border cursor-pointer p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {scanLoading ? "Scanning…" : "Run Full Scan"}
                    </button>
                    {scanResult && (
                        <div className="mt-3 text-sm text-gray-300 grid grid-cols-3 gap-4">
                            {/* total_scanned is only a count — the backend doesn't
                                return the full scanned-symbol list, only `results`
                                (the ones that passed filters) */}
                            <div><span className="text-gray-500">Scanned</span><div>{scanResult.total_scanned}</div></div>
                            <div><span className="text-gray-500">Found</span><div>{scanResult.total_found}</div></div>
                            <div><span className="text-gray-500">At</span><div>{scanResult.scanned_at}</div></div>
                        </div>
                    )}
                </div>

                {/* Scan results table */}
                {scanResult?.results?.length > 0 && (
                    <div className="border border-white/20 rounded-lg p-4">
                        <div className="font-medium mb-3">
                            Scan Results ({scanResult.results.length} found of {scanResult.total_scanned} scanned)
                        </div>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="sticky top-0 bg-neutral-900">
                                    <tr className="text-gray-500 border-b border-white/10">
                                        <th className="py-2 pr-4">Symbol</th>
                                        <th className="py-2 pr-4">Price</th>
                                        <th className="py-2 pr-4">Change %</th>
                                        <th className="py-2 pr-4">Score</th>
                                        <th className="py-2 pr-4">Grade</th>
                                        <th className="py-2 pr-4">Strength</th>
                                        <th className="py-2 pr-4">RSI</th>
                                        <th className="py-2 pr-4">Vol Ratio</th>
                                        <th className="py-2 pr-4">SL</th>
                                        <th className="py-2 pr-4">T1</th>
                                        <th className="py-2 pr-4">T2</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scanResult.results.map((s) => (
                                        <tr key={s.symbol} className="border-b border-white/5">
                                            <td className="py-2 pr-4 font-medium">{s.symbol}</td>
                                            <td className="py-2 pr-4">₹{s.price}</td>
                                            <td className={`py-2 pr-4 ${s.change_percent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                {s.change_percent}%
                                            </td>
                                            <td className="py-2 pr-4">{s.score}</td>
                                            <td className="py-2 pr-4" style={{ color: s.grade_color }}>{s.grade}</td>
                                            <td className="py-2 pr-4">{s.strength}</td>
                                            <td className="py-2 pr-4">{s.rsi}</td>
                                            <td className="py-2 pr-4">{s.vol_ratio}</td>
                                            <td className="py-2 pr-4 text-red-400">{s.sl != null ? `₹${s.sl}` : "—"}</td>
                                            <td className="py-2 pr-4 text-amber-400">{s.t1 != null ? `₹${s.t1}` : "—"}</td>
                                            <td className="py-2 pr-4 text-amber-400">{s.t2 != null ? `₹${s.t2}` : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add recommendations */}
                <div className="border border-white/20 rounded-lg p-4">
                    <button
                        onClick={addRecommendationInDB}
                        disabled={addLoading}
                        className="cursor-pointer p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {addLoading ? "Adding…" : "Add Recommendations"}
                    </button>
                    {addResult && (
                        <div className="mt-3 text-sm text-gray-300">
                            Inserted <span className="text-green-400 font-medium">{addResult.count}</span> new recommendation(s)
                        </div>
                    )}
                </div>

                {/* Handle recommendations */}
                <div className="border border-white/20 rounded-lg p-4">
                    <button
                        onClick={handleRecommendInDB}
                        disabled={handleLoading}
                        className="cursor-pointer p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {handleLoading ? "Updating…" : "Handle Recommendations"}
                    </button>
                    {handleResult && (
                        <div className="mt-3 text-sm text-gray-300">
                            {handleResult.message}
                            {typeof handleResult.updatesTriggered === "number" && (
                                <span className="text-amber-400"> ({handleResult.updatesTriggered} updated)</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Recommendations table */}
            <div className="border border-white/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="font-medium">All Recommendations ({recommendations.length})</div>
                    <button onClick={loadRecommendations} className="text-xs text-blue-400 hover:underline cursor-pointer">
                        Refresh
                    </button>
                </div>

                {listLoading && <div className="text-gray-400 text-sm">Loading…</div>}

                {!listLoading && recommendations.length === 0 && (
                    <div className="text-gray-400 text-sm">No recommendations yet.</div>
                )}

                {!listLoading && recommendations.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-gray-500 border-b border-white/10">
                                    <th className="py-2 pr-4">Symbol</th>
                                    <th className="py-2 pr-4">Entry</th>
                                    <th className="py-2 pr-4">SL</th>
                                    <th className="py-2 pr-4">T1</th>
                                    <th className="py-2 pr-4">T2</th>
                                    <th className="py-2 pr-4">Confidence</th>
                                    <th className="py-2 pr-4">Exit</th>
                                    <th className="py-2 pr-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recommendations.map((r) => {
                                    const outcome = outcomeLabel(r);
                                    return (
                                        <tr key={r._id} className="border-b border-white/5">
                                            <td className="py-2 pr-4 font-medium">{r.symbol}</td>
                                            <td className="py-2 pr-4">₹{r.entryPrice}</td>
                                            <td className="py-2 pr-4 text-red-400">₹{r.stopLoss}</td>
                                            <td className="py-2 pr-4 text-amber-400">₹{r.target1}</td>
                                            <td className="py-2 pr-4 text-amber-400">₹{r.target2}</td>
                                            <td className="py-2 pr-4">{r.confidence ?? "—"}%</td>
                                            <td className="py-2 pr-4">{r.exitPrice != null ? `₹${r.exitPrice}` : "—"}</td>
                                            <td className={`py-2 pr-4 font-medium ${outcome.tone}`}>{outcome.text}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}