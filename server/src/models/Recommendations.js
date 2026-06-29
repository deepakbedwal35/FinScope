const mongoose = require("mongoose");

const  recommendationSchema = new mongoose.Schema({
    symbol: {
    type: String,
    required: true
  },
  
  entryPrice: {
    type: Number,
    required: true
  },
//   exitPrice: {
//     type: Number
//   },
  
  stopLoss: {
    type: Number
  },
  target1: {
    type: Number
  },

  target2: {
    type: Number
  },

  stopLossHit: {
    type: Boolean ,
    default : false
  },
  target1Hit: {
    type: Boolean ,
    default : false
  },

  target2Hit: {
    type: Boolean ,
    default : false
  },

  confidence :{
    type : Number
  },
  
  tradeDate: {
    type: Date,
    default: Date.now
  },
  isOpen:{
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  }

})




module.exports = mongoose.model("Recommendations", recommendationSchema);