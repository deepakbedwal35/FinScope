

const User = require("../models/User")
const {restrictToLoggedIn} = require("../middleware/auth")

const express = require("express");
const router = express.Router();
const  {handleUserSignup, handleUserLogin} = require("../controller/user")

router.post("/signup", handleUserSignup)

router.post("/login" , handleUserLogin)
router.get("/check-auth" , restrictToLoggedIn , (req , res)=>{
    res.json({isAuthenticated: true, user:req.user})
})

router.post("/logout" , (req , res)=>{
    res.clearCookie("token" , {
        httpOnly: true,secure:false, sameSite: "lax"

    })
    res.json({success : true , message: "Logged out successfully"})
})

module.exports = router;