const express = require("express")
const router = express.Router()

const {addInWatchlist , getWatchlist} = require("../controller/watchlist")
router.post("/add" ,addInWatchlist )
// router.post("/:id/watchlist/remove" , )
router.get("/all" , getWatchlist)

module.exports = router