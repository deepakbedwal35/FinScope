const express = require("express");
const router = express.Router();
const { restrictToLoggedIn } = require("../middleware/auth");
const {
    addRecommendations,
    getAllRecommendations,
    handleRecommendations,
    getOpenRecommendations,
    getCloseRecommendations,
} = require("../controller/recommendations");
 
// All routes require a logged-in session — the old per-handler
// `getUser(req.cookies.token)` checks were commented out, leaving every
// one of these public, including the two that write to the DB.
router.get("/add", restrictToLoggedIn, addRecommendations);
router.get("/list", restrictToLoggedIn, getAllRecommendations);
router.get("/handle", restrictToLoggedIn, handleRecommendations);
router.get("/open", restrictToLoggedIn, getOpenRecommendations);
router.get("/close", restrictToLoggedIn, getCloseRecommendations);
 
module.exports = router;