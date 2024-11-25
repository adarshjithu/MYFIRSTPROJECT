const mongoose = require('mongoose');
const accountShema = new mongoose.Schema({
    user:String,
    firstname:String,
    lastname:String,
    username:String,
    email:String,
    secondaryphonenumber:String,
    phonenumber:Number,
    country:{type:String,default:'India'},
    state:String,
    pincode:String,
    image:{type:String,default:''}
    
})

const Account = mongoose.model("Account",accountShema);
module.exports = Account;