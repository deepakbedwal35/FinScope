const Recommendations = require("../models/Recommendations");
const scanner = require("../services/scannerService");

// Pulls fresh picks from the Python scanner's fin_recommendations and
// inserts any symbol not already tracked. Uses an atomic upsert
// ($setOnInsert + upsert:true) so concurrent calls can't create duplicates,
// and runs the per-stock writes in parallel via Promise.all rather than a
// sequential loop, since recommendedStocks can be 20-30+ entries.
const addRecommendations = async (req, res) => {
    try {
        const data = await scanner.finRecommends();
        const recommendedStocks = data.recommendations || [];

        const promises = recommendedStocks.map(async (stock) => {
            try {
                const result = await Recommendations.findOneAndUpdate(
                    { symbol: stock?.symbol },
                    {
                        $setOnInsert: {
                            symbol: stock?.symbol,
                            entryPrice: stock?.entry?.entry,
                            stopLoss: stock?.entry?.sl,
                            target1: stock?.entry?.t1,
                            target2: stock?.entry?.t2,
                            confidence: stock?.entry?.confidence,
                        },
                    },
                    { upsert: true, new: false } // new:false -> null means it was freshly inserted
                );
                return result === null ? 1 : 0;
            } catch (err) {
                console.error(`Failed to process ${stock?.symbol}:`, err.message);
                return 0; // one bad symbol shouldn't fail the whole batch
            }
        });

        const results = await Promise.all(promises);
        const count = results.reduce((total, num) => total + num, 0);

        return res.status(200).json({ success: true, count });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Reads every open recommendation, checks current price against its
// SL/T1/T2 levels, and bulk-writes only the ones that actually changed.
const handleRecommendations = async (req, res) => {
    try {
        const allRecommendedStocks = await Recommendations.find({ isOpen: { $ne: false } });
        const symbols = allRecommendedStocks.map((r) => r.symbol);

        if (symbols.length === 0) {
            return res.json({ success: true, message: "No active recommendations to update." });
        }

        const allStocksPrice = await scanner.fetchCurrPrice(symbols);
        const bulkOperations = [];

        allRecommendedStocks.forEach((stock) => {
            const stockPriceData = allStocksPrice[stock.symbol];
            if (!stockPriceData || typeof stockPriceData.price === "undefined") return;

            const currentPrice = stockPriceData.price;
            const updateFields = {};

            // SL takes priority — if it's hit, the position is closed and
            // nothing else about T1/T2 status matters for this tick.
            if (currentPrice <= stock.stopLoss) {
                updateFields.stopLossHit = true;
                updateFields.isOpen = false;
                updateFields.exitPrice = stock.stopLoss;
            } else {
                if (currentPrice >= stock.target1 && !stock.target1Hit) {
                    updateFields.target1Hit = true;
                }

                // Price hit T1 earlier, has since pulled back to T1 -> lock the exit there.
                if (stock.isOpen && stock.target1Hit && currentPrice <= stock.target1) {
                    updateFields.isOpen = false;
                    updateFields.exitPrice = stock.target1;
                }

                if (currentPrice >= stock.target2 && !stock.target2Hit) {
                    updateFields.target2Hit = true;
                    updateFields.isOpen = false;
                    updateFields.exitPrice = stock.target2; // was `stock.target2Hit` (a bool) — fixed
                }
            }

            if (Object.keys(updateFields).length > 0) {
                bulkOperations.push({
                    updateOne: { filter: { _id: stock._id }, update: { $set: updateFields } },
                });
            }
        });

        if (bulkOperations.length > 0) {
            await Recommendations.bulkWrite(bulkOperations);
        }

        return res.json({
            success: true,
            message: `Processed ${allRecommendedStocks.length} stocks. Updated ${bulkOperations.length} items.`,
            updatesTriggered: bulkOperations.length,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getOpenRecommendations = async (req, res) => {
    try {
        const allRecommends = await Recommendations.find({ isOpen: true });
        return res.status(200).json({ success: true, allRecommends });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getCloseRecommendations = async (req, res) => {
    try {
        const allRecommends = await Recommendations.find({ isOpen: false });
        return res.status(200).json({ success: true, allRecommends });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getAllRecommendations = async (req, res) => {
    try {
        const allRecommends = await Recommendations.find();
        return res.status(200).json({ success: true, allRecommends });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    addRecommendations,
    getAllRecommendations,
    getOpenRecommendations,
    getCloseRecommendations,
    handleRecommendations,
};