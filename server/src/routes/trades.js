const TradeJournal = require("../models/TradeJournal");
const express = require("express");
const router = express.Router();
const { restrictToLoggedIn } = require("../middleware/auth");
const { handleOpenTrades, handleAllTrades, handleExitTrades } = require("../controller/trades");

router.post("/open", restrictToLoggedIn, handleOpenTrades);
router.get("/list", restrictToLoggedIn, handleAllTrades);
router.get("/exit/:id", restrictToLoggedIn, handleExitTrades);

module.exports = router;