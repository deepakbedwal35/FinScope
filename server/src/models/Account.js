const mongoose = require('mongoose');
const User = require('./User');

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  TotalBalance: {
    type: Number,
    default: 100000 // Default starting balance for new accounts
  },
  RemainingBalance: {
    type: Number,
    default: 100000 // Initially, remaining balance is the same as total balance
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', accountSchema);