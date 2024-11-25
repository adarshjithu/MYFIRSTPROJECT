const mongoose  = require('mongoose');
const paymentSchema = new mongoose.Schema({
    order:Object,
    type:String,
    orderDetails:String,
    payedAt:{type:String,default:function(){
        return new Date().toDateString()
    }}
}) 

const Payment = mongoose.model("Payment",paymentSchema);
module.exports = Payment;