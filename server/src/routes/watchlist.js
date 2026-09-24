const express = require("express");
const router = express.Router();
const { restrictToLoggedIn } = require("../middleware/auth");
const { addInWatchlist, getWatchlist } = require("../controller/watchlist");

router.post("/add", restrictToLoggedIn, addInWatchlist);
// router.post("/:id/watchlist/remove", restrictToLoggedIn, ...);
router.get("/all", restrictToLoggedIn, getWatchlist);

module.exports = router;