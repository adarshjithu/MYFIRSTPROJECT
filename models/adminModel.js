const bcrypt = require("bcrypt")
const { string } = require("i/lib/util");
const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
adminSchema.pre('save',async function(){
    const salt = 10 ;
     this.password = await bcrypt.hash(this.password,salt);
})
  
adminSchema.methods.isPasswordMatched= async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password);
}
 
const Admin = mongoose.model('Admin',adminSchema);

module.exports = Admin;