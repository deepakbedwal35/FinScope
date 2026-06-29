const User = require("../models/User");
const Watchlist = require("../models/Watchlist");
const {getUser} = require("../services/auth")
const scanner = require("../services/scannerService");
const addInWatchlist = async (req, res , next) => {
    const token = req.cookies?.token;
    const decodedUser = getUser(token);
    if(!decodedUser) return res.status(401).json({ message: "Access denied. Please log in." });
   
    try {
        const { symbol } = req.body;
        if (!symbol ) {
            return res.status(400).json({ message: "Stock symbol is required" });
        }
        const userExists = await User.exists({ _id: decodedUser._id });
        if (!userExists)   return res.status(404).json({ message: "User account not found" });
        const existSymbol = await Watchlist.findOne({ symbol: symbol, user: decodedUser._id });
        if (existSymbol) {
            return res.status(400).json({ message: `${symbol} is already in your watchlist.` });
        } 
        const currPrice = await scanner.fetchCurrPrice([symbol]);
        const price = currPrice?.price;
     
        const newWatchlistItem = await Watchlist.create({
            symbol: symbol,
            user: decodedUser._id,
            priceAddInWatchlist : price ? Number(price) : null
        });
   
        return res.status(200).json({
            success: true,
            
            user: decodedUser._id,
            data: newWatchlistItem                    
        });

    } catch (err) {

        console.error("addInWatchlist error:", err);
        return res.status(500).json({
            success: false, 
            error: err.message
        });
    }
};

const getWatchlist = async (req , res , next)=>{
    const token = req.cookies?.token;
    const decodedUser = getUser(token);
    if(!decodedUser) return res.status(401).json({ message: "Access denied. Please log in." });
   

    try{
        const allListSymbols = await Watchlist.find({user : decodedUser._id});
        if(!allListSymbols){
            return res.json({
                message : "Watchlist is Empty"
            })
        }

        return res.status(200).json({
            success : true ,
            allSymbols : allListSymbols
        })

    }catch(err){
        return res.status(500).json({
            success : false ,
            message : err.message
        })
    }
}

module.exports = { addInWatchlist , getWatchlist};
