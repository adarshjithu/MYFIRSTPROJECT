const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema({
    image:String,
    category:String,
    discount:Number,
    description:String,
    added:{type:String,default:function(){
        return new Date().toDateString()
    }}
})

const Category  = mongoose.model("Category",categorySchema);

module.exports=Category;
