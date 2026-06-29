const jwt = require("jsonwebtoken")
const {getUser} = require("../services/auth")
const restrictToLoggedIn = (req ,res, next)=>{
    const token = req.cookies?.token;
    const decodedUser = getUser(token);
    if(!decodedUser) return res.status(401).json({ message: "Access denied. Please log in." });

    try{
        req.user = decodedUser
        next()
    } catch(error){
        res.clearCookie("token")
        return res.status(403).json({ message: "Invalid or expired session token." });
    }
};

module.exports = {
    restrictToLoggedIn
}