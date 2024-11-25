const mongoose =  require("mongoose");
const bannerSchema = new mongoose.Schema({
    image1:String,
    image2:String,
})

const banner = mongoose.model('banner',bannerSchema);
module.exports = banner;