const bcrypt = require("bcrypt")
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username:{type:String},
    email:{type:String},
     password:{type:String}, 
    phonenumber:{type:Number},
    signupAt:{type:String,default:function(){
        return new Date().toDateString()
    }}
    ,isActive:{type:Boolean,default:true}
   
   
})


userSchema.pre('save',async function(){
    const salt = 10 ;
     this.password = await bcrypt.hash(this.password,salt);
})

userSchema.methods.isPasswordMatched= async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password);
}
const User = mongoose.model("User",userSchema);
module.exports=User;   