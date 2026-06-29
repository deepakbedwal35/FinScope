const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./User")
const watchlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    symbol: {type : String , required : true},
    company_name :{type : String },
    priceAddInWatchlist : {type : Number},
    

    addedAt: {type: Date , default : Date.now}
})

const Watchlist = mongoose.model('Watchlist' , watchlistSchema);
module.exports =  Watchlist;
