
const mongoose = require("mongoose");
const User = require("./User");
const tradeJournalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  exitPrice: {
    type: Number
  },
  positionSize: {
    type: Number,
    required: true
  },
  stopLoss: {
    type: Number
  },
  takeProfit: {
    type: Number
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

});

module.exports = mongoose.model("TradeJournal", tradeJournalSchema);