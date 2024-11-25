const { array } = require("i/lib/util");
const mongoose = require("mongoose");
const offerSchema = new mongoose.Schema({
    productOffers:{type:Array},
    referalOffer:Number

})

const Offers = mongoose.model('Offers',offerSchema);
module.exports = Offers