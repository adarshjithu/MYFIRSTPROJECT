const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    user:String,
    products:Array
})

const Cart = mongoose.model('Cart',cartSchema);
module.exports = Cart;