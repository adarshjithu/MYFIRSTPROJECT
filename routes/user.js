const express = require("express");
const { landingControler, signupControler, contactControler, aboutControler, homeControler, loginControler, signupPostControler, otpControler, otpPostControler, loginPostControler, OTPgeneration, otpError, userResetPassword, userResetPasswordPost, resetPasswordUserfound, passwordResetSuccessPost, userProfile, logout, forgotPassword, forgotPasswordPost, forgotPasswordGenerateOtp, forgotPasswordCheckOtp, forgotPasswordCheckOtpPost, userViewProducts, productDetails, changeProductCategory, changed, filterProduct } = require("../Controler/userControler");
const { validationRules, validationRes, otpAuthMiddleware, validationLoginRules, loginValidationRes, verifyLogin, resetPasswordValidationResult, resetPasswordValidationRules, createAdmin } = require("../middlewares/middleware");

const app = express.Router();
 
////routes 
app.get("/", landingControler);
app.get("/user_contact",
verifyLogin,
contactControler) 


app.get("/user_about",
verifyLogin,
aboutControler) 
app.get("/user_home",verifyLogin,homeControler) 
app.get("/user_login",loginControler)  
app.get("/user_logout",logout)
app.get("/userLogin", 

loginPostControler)
app.get("/user_signup",signupControler) 
app.post("/user_signup",
validationRules,validationRes,
signupPostControler)
app.get('/user_otp',otpControler) 
app.post('/user_otp',otpPostControler)

app.get('/user_generate',OTPgeneration)
app.get("/user_otpError" ,otpError) ;

app.get("/user_resetpassword",userResetPassword)
app.post("/user_resetpassword",userResetPasswordPost); 
app.post("/password-reset-success",
 resetPasswordValidationRules,resetPasswordValidationResult,
 passwordResetSuccessPost);
 
 app.get("/user_profile",verifyLogin,userProfile); 

 app.get('/user_forgotpassword',forgotPassword);
 app.post('/user_forgotpassword',forgotPasswordPost);
 app.get('/forgot-password-generate-otp',forgotPasswordGenerateOtp);
 app.get('/forgot-password-check-otp',forgotPasswordCheckOtp),
 app.post("/forgot-password-check-otp",forgotPasswordCheckOtpPost);
 app.get("/sample",(req,res)=>{
    res.render("user/password-change-success-page")
 }) 
app.get("/user_products",
verifyLogin
,userViewProducts) ;
app.get("/user-product-details",verifyLogin,productDetails);
app.get('/change/:id',verifyLogin,changeProductCategory);
app.get('/changed',verifyLogin,changed);
app.get('/filterProduct',filterProduct);

module.exports = app; 
