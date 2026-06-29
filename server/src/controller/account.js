// const User = require("../models/User");
// const Account = require("../models/Account")
// const {getUser} = require("../services/auth");


// const handleGetAccount = async(req ,res, next)=>{
//     const token = req?.cookies?.token ; 
//      const decodedUser = getUser(token);
//     if(!decodedUser) return res.status(401).json("Access Denied please log in");
     
//     try{

//         const user = await User.findById(decodedUser._id);

//         if(!user) return res.status(404).json({msg : "user not found"})
//         const account = await Account.findOne({user : user._id});

//         return res.status(200).json({
//             msg : "Succesful",
//             user :decodedUser ,
//             account
        
            
//         })

//     }catch(err){
//        return res.status(500).json({
//             success : false ,
//             message : err.message
//         })

//     }
// }

// const handleAcccountBalance = async(req ,res, next)=>{
//     const token = req?.cookies?.token ; 
//      const decodedUser = getUser(token);
//     if(!decodedUser) return res.status(401).json("Access Denied please log in");
     
//     try{

//         const user = await User.findById(decodedUser._id);

//         if(!user) return res.status(404).json({msg : "user not found"})
//         const account = await Account.findOne({user : user._id});

        
// const handleOpenTrades = async(req ,res, next)=>{
//     const token = req?.cookies?.token ; 
//      const decodedUser = getUser(token);
//     if(!decodedUser) return res.status(401).json("Access Denied please log in");
     
//     try{

//         const {symbol , entryPrice , positionSize , isOpen } = req.body;
//         const user = await User.findById(decodedUser._id);

//         if(!user) return res.status(404).json({msg : "user not found"})
//         const newTrade = await TradeJournal.create({
//             user : user._id ,
//             symbol : symbol , 
//             entryPrice : entryPrice,
//             positionSize : positionSize,
//             isOpen : isOpen
    

//         })

//         return res.status(200).json({
//             msg : "Succesful",
//             user :decodedUser ,
//             newTrade
        
            
//         })

//     }catch(err){
//        return res.status(500).json({
//             success : false ,
//             message : err.message
//         })

//     }
    
// }

// const handleAllTrades = async (req ,res)=>{
//     const token = req?.cookies?.token ;
//     const decodedUser = getUser(token);
//     if(!decodedUser) return res.status(401).json("Access Denied please log in");
     
//     const trades = await TradeJournal.find({user:decodedUser._id});

//     return res.status(200).json(
//         // msg : "Succesful",
//         trades

//     )



    


// }

// module.exports = {
//     handleOpenTrades,
//     handleAllTrades
// }



// //   entryPrice: {
// //     type: Number,
// //     required: true
// //   },
// //   exitPrice: {
// //     type: Number
// //   },
// //   positionSize: {
// //     type: Number,
// //     required: true
// //   },
// //   stopLoss: {
// //     type: Number
// //   },
// //   takeProfit: {
// //     type: Number
// //   },
// //   tradeDate: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   isOpen:{
// //     type: Boolean,
// //     default: true
// //   },
