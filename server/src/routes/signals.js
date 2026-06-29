// server/routes/scan.js
const Watchlist = require("../models/Watchlist")



const express = require("express");
const router = express.Router();
const scanner = require("../services/scannerService");


router.get("/demo", (req, res ) => {
  res.redirect("http://localhost:5173");
});


router.get("/", async (req, res) => {
  const data = await scanner.getSignals();
  res.json(data);
});
router.get("/chart/:symbol", async(req, res)=>{
  const data = await scanner.getChart(req.params.symbol);
  res.json(data);
});

router.get("/analyze/:symbol", async (req, res) => {
  const data = await scanner.getSignalForStock(req.params.symbol);
  
  res.json(data);
});

router.get("/fundamentals/:symbol", async (req, res) => {
  const data = await scanner.getFundamentals(req.params.symbol);
 
  res.json(data);
});
router.get("/ai/:symbol" , async(req ,res)=>{
  const data = await scanner.get_ai_analysis(req.params.symbol);
  res.json(data);
})
router.get("/runfullscan" , async(req ,res)=>{
  const data = await scanner.runFullScanAdmin();
  res.json(data);
})

router.post("/backtest", async (req, res) => {
  try {
    let filters = req.body;
    const data = await scanner.runBacktest(filters);
    return res.json(data);

  } catch (err) {
    console.error("Error in backtest route:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});



router.post("/fullscan" , async(req,res)=>{
  try {
       let filters = req.body;
       const data = await scanner.getTopStocks(filters);
      //  console.log(filters)
       return res.status(200).json(data);
  } catch (error) {
    console.error("Error in /fullscan:", error);

    res.status(500).json({ error: "Backend computation failure"  , details : error.message , filters_received : req.body});
  }
});

router.get("/risks/:symbol" , async (req, res)=>{
  const data = await scanner.getRisks(req.params.symbol);
  res.json(data);
})

router.get("/search" , async (req, res)=>{
  const q = req.query.q;
  const data = await scanner.searchStock(q);
  res.json(data);
})


router.get("/indices/data" , async (req ,res)=>{
  const data = await scanner.getIndicesData();
  res.json(data);
})

router.get("/analysis/sector-rotation" , async(req, res)=>{
  const data = await scanner.getSectorAnalysis();
  res.json(data);
})
  
router.get("/candlesticks/stocks" , async(req, res)=>{
  const data = await scanner.getCandlesticksStock();
  res.json(data);

})
router.get("/reversal/stocks" , async(req, res)=>{
  const data = await scanner.getReversalPatternStock();
  res.json(data);

})

router.get("/continuation/stocks" , async(req, res)=>{
  const data = await scanner.getContPatternStock();
  res.json(data);

})

// Node — log what it receives and what it sends back
router.post("/fetch/price", async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: "symbols must be a non-empty array" });
    }

    const prices = await scanner.fetchCurrPrice(symbols);
    res.json(prices);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/fin/recommends" , async(req, res)=>{
  const data = await scanner.finRecommends();
  res.json(data);

})
router.post("/", async (req, res) => {
  const data = await scanner.customScan(req.body.symbols);
  res.json(data);
});





module.exports = router;