const TradeJournal = require("../models/TradeJournal");
const express = require("express");
const router = express.Router();
const {handleOpenTrades , handleAllTrades , handleExitTrades} = require("../controller/trades")
router.post("/open" ,handleOpenTrades );
router.get("/list" , handleAllTrades);
router.get("/exit/:id" , handleExitTrades);

module.exports = router;