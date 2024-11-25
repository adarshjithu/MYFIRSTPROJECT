const { check, validationResult, body } = require("express-validator");
var nodemailer = require('nodemailer');
const adminCollection  = require("../models/adminModel")
const userCollection  = require("../models/userModel");
const addressCollection  = require("../models/addressModel");
const cartCollection  = require("../models/cartModel");
const accountCollection  = require("../models/accountModel");
const walletCollection  = require("../models/walletModel");
const wishlistCollection  = require("../models/wishlistModel");
const orderCollection  = require("../models/orderModel");
const expressAsyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs")
const sharp  = require('sharp')
////validationmiddlewares signup
const validationRules = [
     body("username")
          .isAlpha()
          .not()
          .isEmpty()
          .isLength({ min: 4 })
          .withMessage("userName Must be minimim 4 characters ")
          .isLength({ max: 10 })
          .withMessage("Username should not be more than 10 characteres")
          .matches(/^[a-zA-Z0-9 ]+$/)
          .withMessage("Special charectors not allowed"),
     body("email").isEmail().withMessage("Enter a valid email address").not().isEmpty(),
     body("password")
          .not()
          .isEmpty()
          .withMessage("Password required")
          .isLength({ min: 6 })
          .withMessage("Password must be atleast 6 charectors long").
          custom((value)=>{
               if(/\s/.test(value)){
                    throw new Error("Spaces are not allowed")
               }
               return true;
          })
          .custom((value) => {
               // Check the password contains at least one special character or not
               if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                 throw new Error('Password must contain at least one special character');
               }
               return true;
             }),
        
     body("confirmpassword").custom((value, { req }) => {
          if (value !== req.body.password) {
               throw new Error("Password donot match");
          }
          return true;
     }),
     body("phonenumber")
          .not()
          .isEmpty()
          .withMessage("Phone number required")
          .isNumeric()
          .isLength({ min: 10, max: 10 })
          .withMessage("Phone number must be 10 digit")
          .custom((value)=>{
               if(value<0){
                    throw new Error("Number must be not negetive")
               }
               return true;
          }),
];

//validation middleware signup
const validationRes = (req, res, next) => {
     const error = validationResult(req);
 
     if (!error.isEmpty()) {
          res.render("user/signup", { err: error.mapped() });
     } else {
          next();
     }
};


//validation middleware for login


const validationLoginRules =[
     body("email").isEmail().withMessage("Enter a valid email address").not().isEmpty(),
     body("password")
     .not()
     .isEmpty()
     .withMessage("Password required")
     .isLength({ min: 6 })
     .withMessage("Password must be atleast 6 charectors long").
     custom((value)=>{
          if(/\s/.test(value)){
               throw new Error("Spaces are not allowed")
          }
     })

     .custom((value) => {
          // Check if the password contains at least one special character
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            throw new Error('Password must contain at least one special character');
          }
          return true;
        }),
   

]

const  loginValidationRes = (req,res,next)=>{
     const error = validationResult(req);

     if (!error.isEmpty()) {
          res.render("user/login", { err: error.mapped() });
     } else {
          next();
     }
}
//otp authenticaion middleware

const generateOTP =(email)=>{

     return new Promise((resolve,reject)=>{


          const random = Math.floor(Math.random()*1000000);


          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'adarshjithu10@gmail.com',
              pass: 'yivy bwuz yhgm herfnp'
            }
          });
          
          var mailOptions = {
            from: 'adarshjithu10@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            text: `Your one time verification code is ${random}`
          }; 
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('success')
              console.log('Email sent: ' + info.response);
              resolve( random);
            }
          });
          

     })



}


//create admin
const createAdmin = async(user,e,pass)=>{
  

     const admin ={name:user,email:e,password:pass}
     const data = await adminCollection.findOne({email:admin.email});
     if(!data){
            const result = await adminCollection.create(admin);
            console.log('admin inserted')
     } 

}


//verify login

const  verifyLogin =async(req,res,next)=>{
     
     if(req.session.user){
          const user = await userCollection.findById({_id:req.session.user._id})
   
         
          if(user){

               next()
          }
          else{
               await addressCollection.deleteMany({user:req.session.user._id})
               await cartCollection.deleteOne({user:req.session.user._id});
               await accountCollection.deleteOne({user:req.session.user._id});
               await walletCollection.deleteOne({user:req.session.user._id});
               await wishlistCollection.deleteOne({user:req.session.user._id});
               await orderCollection.deleteMany({user:req.session.user._id});
               req.session.destroy()
               res.render("user/login",{landing:true}) 
          }
           
          

         
     }
     else{
          res.render("user/login",{landing:true})
     }
}


//verify admin

const verifyAdmin =(req,res,next)=>{
     if(req.session.admin){
          next()
     }
     else{
          res.redirect("/admin/login");
     }
}

//admin validation 
const adminValidationLoginRules =[
     body("email").isEmail().withMessage("Enter a valid email address").not().isEmpty(),
     body("password")
     .not()
     .isEmpty()
     .withMessage("Password required")
     .isLength({ min: 6 })
     .withMessage("Password must be atleast 6 charectors long").
     custom((value)=>{
          if(/\s/.test(value)){
               throw new Error("Spaces are not allowed")
          }
     })

     
   

]

const  adminLoginValidationRes = (req,res,next)=>{
     const error = validationResult(req);

     if (!error.isEmpty()) {
          res.render("admin/login", { err: error.mapped() });
     } else {
          next();
     }
}

//reset password validation

const resetPasswordValidationRules =[
     body("password")
          .not()
          .isEmpty()
          .withMessage("Password required")
          .isLength({ min: 6 })
          .withMessage("Password must be atleast 6 charectors long").
          custom((value)=>{
               if(/\s/.test(value)){
                    throw new Error("Spaces are not allowed")
               }
               return true;
          })
          .custom((value) => {
               // Check if the password contains at least one special character
               if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                 throw new Error('Password must contain at least one special character');
               }
               return true;
             }),
        
     body("confirmpassword").custom((value, { req }) => {
          if (value !== req.body.password) {
               throw new Error("Password donot match");
          }
          return true;
     })
]

const resetPasswordValidationResult =(req,res,next)=>{
     const error = validationResult(req);

     console.log(error.mapped())

     if (!error.isEmpty()) {
          res.render("user/reset-password-user-found", { err: error.mapped() ,email:req.session.resetEmail});
     } else {
          next();
     }


}



const cropImageMultiple = async (req, res, next) => {
     try {
       await Promise.all(
         req.files.map(async (file) => {
          console.log(file.filename)
           try {
             let sharpInstance = sharp(file.path);
   
             await sharpInstance
               .resize({width:500, height:500})
               .jpeg({ quality: 100 })
               .toFile(`public/images/products/${file.filename}`);
   
             sharpInstance.destroy(); 
   
             await fs.promises.unlink(file.path);
          
           } catch (error) {
             console.error(`Error processing image ${file.filename}: ${error.message}`);
           }
         })
       );
     } catch (error) {
       console.error(`Error in productImgResize: ${error.message}`);
     }
   
next();
};

//referal code email sending

const createReferal =(email,code)=>{

     return new Promise((resolve,reject)=>{


       


          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'adarshjithu10@gmail.com',
              pass: 'dgio pvan gxrq indb'
            }
          });
          
          var mailOptions = {
            from: 'adarshjithu10@gmail.com',
            to: email,
            subject: 'Referal Bonus DIGITYX',
            text: `Your Friend ${email} Refered You With His ReferalCode: ${code}
            YOU CAN USE THIS CODE TO GET 10% OF FOR THE FIRSTIME PURCHASE`
          }; 
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('success')
              console.log('Email sent: ' + info.response);
              resolve( random);
            }
          });
          

     })



}


//-------------------checkout product checking ----------------------------------------

const checkoutProductChecking = async()=>{

     return new Promise(async(resolve,reject)=>{

                    const cartDetails = await cartCollection.aggregate([
                         { $match: { user: req.session.user._id } },
                         { $unwind: "$products" },
                         {
                              $project: {
                                   item: "$products.item",
                                   count: "$products.count",
                              },
                         },
                         {
                              $lookup: {
                                   from: "products",
                                   let: { item: { $toObjectId: "$item" } },
                                   pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
                                   as: "cartData",
                              },
                         },
                         {
                              $project: {
                                   item: "$item",
                                   count: "$count",
                                   product: { $arrayElemAt: ["$cartData", 0] },
                              },
                         },
                         {
                              $project: {
                                   item: 1,
                                   count: 1,
                                   product: 1,
                                   total: { $multiply: ["$count", "$product.price"] },
                              },
                         },
                    ]);
          console.log('cartDetails',cartDetails)
     })

}


/////////////

async function download(allData,res){
     const fs = require("fs");
     var information = allData;
     const { Parser } = require("json2csv");
     const json2csv = new Parser();
     const csv = json2csv.parse(information);
     fs.writeFile("csv.csv", csv, (err) => {
          console.log(err);
     });
     res.attachment("csv.csv");
     res.send(csv);
     console.log(csv);
     
}



module.exports = { validationRules, validationRes ,generateOTP,validationLoginRules,loginValidationRes,createAdmin,
verifyLogin,verifyAdmin,adminLoginValidationRes,adminValidationLoginRules,
resetPasswordValidationRules,resetPasswordValidationResult,cropImageMultiple,createReferal,checkoutProductChecking,download};
