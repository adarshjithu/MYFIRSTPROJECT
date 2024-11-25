const asyncHandler = require('express-async-handler');
const { generateOTP } = require('../middlewares/middleware');
const userCollection = require("../models/userModel")
//-------------------------------------------------------------sigup-------------------------
const signupControler = asyncHandler(async(req,res)=>{
    let user = await userCollection.findOne({email:req.body.email});
    if(user||req.body.email==''){
        res.render("OTP/signup",{err:true})
    }
    else{


    let userData = req.body;
    //creating new date for otp
    var date = Date.now();
    //checking initial signup or not 
    let otpVariable = req.session.otpVariable;
    
    if(otpVariable){
        let index = otpVariable.findIndex((e)=>{
                return e.user.email == req.body.email
        })
        if(index>=0){
            res.redirect(`/user/otp/viewOtp/${index}`)
        }
        else{

            //finding position of last user;
            let length = otpVariable.length;
            //generating otp
              generateOTP(req.body.email).then((OTP)=>{
                  req.session.otpVariable.push({date:date,user:userData,otp:OTP});
                  res.redirect(`/user/otp/viewOtp/${length}`)
              })
        }
       
      
    }
    else{
        generateOTP(req.body.email).then((OTP)=>{

            req.session.otpVariable = [{date:date,otp:OTP,user:userData}];
            res.redirect("/user/otp/viewOtp/0")
        })

    }}
    
})

//-------------------------------------------otpview page------------------------------------------------

const viewOtp = asyncHandler(async(req,res)=>{

    //parsing position to integer
    var position = parseInt(req.params.id)
    //creating date object to pass to the otp page
    let dateObj = {
         date: req.session.otpVariable[position].date,
         position: position,
    };

    let date = JSON.stringify(dateObj);

   
    res.render("OTP/viewOtp",{date})
})

//----------------------------------verifyOpt------------------------------------------

const verifyOtp = asyncHandler(async(req,res)=>{
   let position = parseInt(req.query.position);
   const otp = req.query.otp;
   const info = req.session.otpVariable[position];
   //checking currect otp

   if(info.otp==otp){
    //if otp is equal
    if(req.session.user){
        //checking user already there is a user or not
          res.json({success:true,user:true})
    }
    else{
        let user  =await userCollection.create(info.user)
        req.session.user = user;
        res.json({success:true,user:false})
        //no user found 

    }

   }
   else{
    res.json({success:false})
    //if not equal

   }
})

//--------------------------------------------------------resend--------------------------

const resend = asyncHandler(async(req,res)=>{
    const position =parseInt( req.query.position);
    let dt = Date.now();
    req.session.otpVariable[position].date = dt;
    let email = req.session.otpVariable[position].user.email;
    generateOTP(email).then((OTP)=>{

         req.session.otpVariable[position].otp = OTP
         res.json({success:true})
    
    })
})
module.exports = {signupControler,viewOtp,verifyOtp,resend}