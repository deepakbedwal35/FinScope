
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
      
        const allRecommedStocks = await Recommendations.find({ isOpen: { $ne: false } });
        
   
        const symbols = allRecommedStocks.map((r) => r.symbol);
     
        if (symbols.length === 0) {
            return res.json({ success: true, message: "No active recommendations to update." });
        }

    
        const allStocksPrice = await scanner.fetchCurrPrice(symbols);
        
   
        const bulkOperations = [];

     
        allRecommedStocks.forEach((stock) => {
            const stockPriceData = allStocksPrice[stock.symbol];
            
           
            if (!stockPriceData || typeof stockPriceData.price === 'undefined') return;

            const currentPrice = stockPriceData.price;
       
            const updateFields = {};

            if (currentPrice <= stock.stopLoss) {
                updateFields.stopLossHit = true;
                updateFields.isOpen = false;
                updateFields.exitPrice =stock.stopLoss ;
            } 
            
            
            if (currentPrice >= stock.target1 && !stock.target1Hit) {
                updateFields.target1Hit = true;
                
            }
            // close trade when target1 hit but then price goes down to less than 1% fron taerget 1
            if(stock.isOpen && stock.target1Hit && currentPrice <= stock.target1 ){
                updateFields.isOpen = false; 
                updateFields.exitPrice =stock.target1;
                

            }
           
            if (currentPrice >= stock.target2 && !stock.target2Hit) {
                updateFields.target2Hit = true;
                updateFields.isOpen = false; 
                updateFields.exitPrice =stock.target2Hit ;
            }

          
            if (Object.keys(updateFields).length > 0) {
                bulkOperations.push({
                    updateOne: {
                        filter: { _id: stock._id },
                        update: { $set: updateFields }
                    }
                });
            }
        });

      
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
