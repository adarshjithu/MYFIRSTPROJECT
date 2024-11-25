const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    user:String,
    address:Object,
    payment:String,
    total:Number,
    subtotal:Number,
    discount:Number,
    couponId:String,
    offers:Number,
    couponCode:String,
    coupon:String,
    referalCode:String,
    referalDiscount:Number,
    deliveryCharge:Number,
    products:Array,
    orderedAt:{type:String,default:function(){
        return new Date().toDateString()
    }},
    status:{type:String,default:"Placed"},
    productsCount:Number,

})


const Order = mongoose.model("Order",orderSchema);

module.exports = Order;