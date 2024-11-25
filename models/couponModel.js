const mongoose = require("mongoose");
const couponSchama = new mongoose.Schema({
     minimumpurchase: Number,
     isActive: { type:Boolean,default:true},
     
     discount: Number,
 
     startdate: String,
     expirydate: String,
     couponcode: String,

     createdAt: {
          type: String,
          default: function () {
               return new Date().toLocaleDateString();
          },
     },
     users:Array
});

const Coupon = mongoose.model("Coupon", couponSchama);
module.exports = Coupon;
