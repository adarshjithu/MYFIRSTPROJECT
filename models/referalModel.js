const mongoose = require("mongoose");
const referalSchema  = new mongoose.Schema({
    referalcode:String,
    user:String,
    redeem:{type:Boolean,default:false},
    expired:{type:Boolean,default:false},
    friends:[],
    bonus:[],
    invited:[]
     
})

const referal = mongoose.model('referal',referalSchema);
module.exports = referal;