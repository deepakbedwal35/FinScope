
const express = require("express");
const router = express.Router();
const {addRecommendations , getAllRecommendations , 
    handleRecommendations , getOpenRecommendations ,
    getCloseRecommendations} = require("../controller/recommendations")

router.get("/add" ,addRecommendations );
router.get("/list" , getAllRecommendations);
router.get("/handle" , handleRecommendations);
router.get("/open" , getOpenRecommendations);
router.get("/close" , getCloseRecommendations)
// router.get("/exit/:id" , handleExitTrades);

module.exports = router;