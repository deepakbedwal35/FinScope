
const  Recommendations = require("../models/Recommendations")
const {getUser} = require("../services/auth");
const scanner = require("../services/scannerService");


// reason to use this If recommendedStocks contains a large array
//  (e.g., more than 20-30 stocks), processing them one by one in a loop 
// can make your API response slow.If you are dealing with large datasets, 
// I can show you how to use Promise.all() with the Atomic Upsert method to 
// process all stocks concurrently in parallel. 

const addRecommendations = async (req, res) => {
    //  const token = req?.cookies?.token ; 
//     const decodedUser = getUser(token);
//     if(!decodedUser) return res.status(401).json("Access Denied please log in");
    try {
        const data = await scanner.finRecommends();
        const recommendedStocks = data.recommendations || [];
        
        // 1. Map each stock to a background Promise operation
        const promises = recommendedStocks.map(async (stock) => {
            try {
                // Atomic operation: finds and inserts ONLY if it doesn't exist
                const result = await Recommendations.findOneAndUpdate(
                    { symbol: stock?.symbol },
                    {
                        $setOnInsert: {
                            symbol: stock?.symbol,
                            entryPrice: stock?.entry?.entry,
                            stopLoss: stock?.entry?.sl,
                            target1: stock?.entry?.t1,
                            target2: stock?.entry?.t2,
                            confidence: stock?.entry?.confidence
                        }
                    },
                    { upsert: true, new: false } // new: false returns null if a new doc was created
                );

                // If result is null, it means it's a freshly inserted unique stock
                return result === null ? 1 : 0;
            } catch (err) {
                console.error(`Failed to process ${stock?.symbol}:`, err.message);
                return 0; // Return 0 so one failing stock doesn't ruin the whole batch
            }
        });

        // 2. Execute all database requests simultaneously in parallel
        const results = await Promise.all(promises);

        // 3. Count how many 1s (new insertions) we got back
        const count = results.reduce((total, num) => total + num, 0);

        return res.status(200).json({
            success: true,
            count
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


// it read all existing rec. and then check if curr price touch sl or t1 or t2 


const handleRecommendations = async (req, res) => {
    // const token = req?.cookies?.token ; 
    // const decodedUser = getUser(token);
    // if(!decodedUser) return res.status(401).json("Access Denied please log in");
    
    try {
        // 1. Fetch only open active trades from the database to save memory
        const allRecommedStocks = await Recommendations.find({ isOpen: { $ne: false } });
        
        // 2. Extract just the symbols to send to your price scanner
        const symbols = allRecommedStocks.map((r) => r.symbol);
        
        // Guard clause: If no open stocks exist, return early
        if (symbols.length === 0) {
            return res.json({ success: true, message: "No active recommendations to update." });
        }

        // 3. Fetch live current prices for all extracted symbols
        const allStocksPrice = await scanner.fetchCurrPrice(symbols);
        
        // 4. Initialize an array to collect our batch database update operations
        const bulkOperations = [];

        // 5. Use a regular loop (or forEach) to prepare update operations
        allRecommedStocks.forEach((stock) => {
            const stockPriceData = allStocksPrice[stock.symbol];
            
            // Safety check: Skip if the scanner didn't return price data for this symbol
            if (!stockPriceData || typeof stockPriceData.price === 'undefined') return;

            const currentPrice = stockPriceData.price;
            
            // Create an object to collect changes for this specific document
            const updateFields = {};

            // CONDITION A: Current price drops to or below Stop Loss
            if (currentPrice <= stock.stopLoss) {
                updateFields.stopLossHit = true;
                updateFields.isOpen = false; // Trade is now dead/closed
            } 
            
            // CONDITION B: Current price rises to or hits Target 1
            if (currentPrice >= stock.target1 && !stock.target1Hit) {
                updateFields.target1Hit = true;
            }

            // CONDITION C: Current price rises to or hits Target 2
            if (currentPrice >= stock.target2 && !stock.target2Hit) {
                updateFields.target2Hit = true;
                updateFields.isOpen = false; // Max target reached, close trade
            }

            // 6. If any targets or stop loss conditions matched, queue up a Mongoose update instruction
            if (Object.keys(updateFields).length > 0) {
                bulkOperations.push({
                    updateOne: {
                        filter: { _id: stock._id }, // Find by unique document ID
                        update: { $set: updateFields } // Apply changes
                    }
                });
            }
        });

        // 7. Execute all database updates concurrently in one single roundtrip
        if (bulkOperations.length > 0) {
            await Recommendations.bulkWrite(bulkOperations);
        }

        // 8. Return successful response with tracking statistics
        return res.json({
            success: true,
            message: `Processed ${allRecommedStocks.length} stocks. Updated ${bulkOperations.length} items.`,
            updatesTriggered: bulkOperations.length
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


const getOpenRecommendations = async (req ,res)=>{
    // const token = req?.cookies?.token ; 
    // const decodedUser = getUser(token);
    // if(!decodedUser) return res.status(401).json("Access Denied please log in");

    try{
        // const {symbol , entryPrice  , isOpen  } = req.body;
        const allRecommends = await Recommendations.find({isOpen : true});
        return res.status(200).json({
           success : true ,
           allRecommends
        })

    }catch(err){
       return res.status(500).json({
            success : false ,
            message : err.message
        })

    }
     
}


const getCloseRecommendations = async (req ,res)=>{
    // const token = req?.cookies?.token ; 
    // const decodedUser = getUser(token);
    // if(!decodedUser) return res.status(401).json("Access Denied please log in");

    try{

        // const {symbol , entryPrice  , isOpen  } = req.body;
        const allRecommends = await Recommendations.find({isOpen : false});
        
        return res.status(200).json({
           success : true ,
           allRecommends
        })

    }catch(err){
       return res.status(500).json({
            success : false ,
            message : err.message
        })

    }
     
}
const getAllRecommendations = async (req ,res)=>{
    // const token = req?.cookies?.token ; 
    // const decodedUser = getUser(token);
    // if(!decodedUser) return res.status(401).json("Access Denied please log in");

    try{

      
        const allRecommends = await Recommendations.find();
        
        return res.status(200).json({
           success : true ,
           allRecommends
        })

    }catch(err){
       return res.status(500).json({
            success : false ,
            message : err.message
        })

    }
     
}

// const deleteRecommendation = async (req , res)=>{
//     const token = req?.cookies?.token ; 
//     const decodedUser = getUser(token);
//     if(!decodedUser) return res.status(401).json("Access Denied please log in");

//     try{

      
//         const allRecommends = await Recommendations.find();
        
//         return res.status(200).json({
//            success : true ,
//            allRecommends
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

// const handleExitTrades = async  (req , res)=>{
//     const token = req?.cookies?.token;
//     const decodedUser = getUser(token);
//     if(!decodedUser) return res.status(401).json("Access Denied please log in");
    
//     try{
//         const _id = req.params;
//         const trade = TradeJournal.findOneAndDelete({id : _id});
//         console.log("Exit succesfully");

//         return res.status((200)).json({
//             "success" : true,
//         })


//     }
//     catch(e){

//         return res.json({
//             "success" : false ,
//             "errror" : e
//         })

//     }




// }

module.exports = {
    addRecommendations,
    getAllRecommendations,
    getOpenRecommendations,
    getCloseRecommendations,
    handleRecommendations
    
}


//  symbol: {
//     type: String,
//     required: true
//   },
//   entryPrice: {
//     type: Number,
//     required: true
//   },
// //   exitPrice: {
// //     type: Number
// //   },
  
//   stopLoss: {
//     type: Number
//   },
//   target1: {
//     type: Number
//   },

//   target2: {
//     type: Number
//   },
  
//   tradeDate: {
//     type: Date,
//     default: Date.now
//   },
//   isOpen:{
//     type: Boolean,
//     default: true
//   },
//   notes: {
//     type: String
//   }

// })
