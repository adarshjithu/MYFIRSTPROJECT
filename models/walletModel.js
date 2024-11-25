const { array } = require('i/lib/util');
const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({
    user:String,
    amount:Number,
    transactions:{type:Array}
})

const Wallet = mongoose.model('Wallet',walletSchema);
module.exports = Wallet; 