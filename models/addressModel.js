const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    user:String,
    firstname:String,
    lastname:String,
    address:String,
    country:String,
    state:String,
    email:String,
    city:String,
    zipcode:Number,
    phonenumber:Number,
    addresstype:String
    ,home:{type:Boolean,default:false}

})

const Address = mongoose.model('Address',addressSchema);
module.exports= Address;