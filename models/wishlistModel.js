const mongoose = require("mongoose");
const wishListSchema  = new mongoose.Schema({
    user:String,
    products:Array,
  
})

const Wishlist = mongoose.model('Wishlist',wishListSchema);

module.exports = Wishlist;