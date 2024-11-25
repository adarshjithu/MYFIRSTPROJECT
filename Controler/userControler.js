const { otpAuthMiddleware, generateOTP } = require("../middlewares/middleware");
const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/userModel");
const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel");
const { body } = require("express-validator");
const bcrypt = require("bcrypt");
const cartCollection = require("../models/cartModel");
const bannerCollection = require("../models/bannerModel")

//landin controler--------------------------------------------------------------------
const landingControler = (req, res) => {
     res.redirect("/user_home");
};

//signupControler------------------------------------------------------------------

const signupControler = asyncHandler((req, res) => {
     try {
        
          
               res.render("OTP/signup");
          
     } catch (error) {
          console.log(error.message);
          res.status(500);
          var err = new Error();
          error.statusCode = 500;
          error.message = "Error While Signup";
          next(err);
     }
});
//loginControler-----------------------------------------------------------------------------------
const loginControler = asyncHandler(async (req, res, next) => {
     try {
          if (req.session.user) {
               res.redirect("/user_home");
          } else {
               res.render("user/login");
          }
     } catch (error) {
          console.log(error.message);
          res.status(500);
          var err = new Error();
          error.statusCode = 500;

          next(err);
     }
});
//loginpost controler----------------------------------------------------------------------------

const loginPostControler = asyncHandler(async (req, res) => {
    console.log(req.query)
     try {
          const user = await UserCollection.findOne({ email: req.query.email });
          console.log(user)

          if (user && (await user.isPasswordMatched(req.query.password))) {
               if (user.isActive == true) {
                    req.session.user = user;

                    res.json({success:true});
               } else {
                    res.json({success:false,error:'You have been blocked by the admin'});
               }
          } else {
               res.json({success:false,error:'Invalid Credentials'});
          }
     } catch (error) {}
});

//homeControler------------------------------------------------------------------------------------
const homeControler = asyncHandler(async (req, res, next) => {
     try {
          const banner = await bannerCollection.findOne({}).lean(); 
          const category = await categoryCollection.find({}).lean();
          products = await productCollection.aggregate([{$match:{
               category:'Mobile'
          }},{$addFields:{date:'$addedAt'}},{$sort:{date:-1}},{$limit:6}])
          let laptop= await productCollection.aggregate([{$match:{category:'Laptop'}},{
               $addFields:{
                    date:'$addedAt'
               }
          },{

               $sort:{
                    date:-1
               }
          },{$limit:6
          }])
          let cartCount = await cartCollection.findOne({ user: req.session.user._id });
          let newArr = await productCollection.aggregate([{$match:{
               category:'Laptop'
          }},{$addFields:{
               date:{
                    $toDate:'$addedAt'
               }
          }},{

          $sort:{
               date:-1
          }
          },{
               $limit:1
          }])
          let newArrival = newArr[0] //setting newArrival product
     
      
          var count;
          if (cartCount) { 
               count = cartCount.products.length;
          } else {
               count = null;
          }

          var USER;
          if (req.session.user) {
               USER = req.session.user.username;
          } else {
               USER = "";
          }

          res.render("user/homes", { home: true, user: USER, category, products, count: count,banner,laptop ,newArrival});
     } catch (error) {
          console.log(error.message);
          res.status(500);
          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

//contactControler--------------------------------------------------------------------------------
const contactControler = (req, res) => {
     try {
          res.render("user/contact", { home: true });
     } catch (error) {
          console.log(error.message);
          res.status(500);
          var err = new Error();

          next(err);
     }
};

//aboutControler-----------------------------------------------------------------------------------
const aboutControler = (req, res) => {
     try {
          res.render("user/about", { home: true });
     } catch (error) {
          console.log(error.message);
          res.status(500);
          var err = new Error();

          next(err);
     }
};
//siguppostcontroler-------------------------------------------------------------------------
const signupPostControler = asyncHandler(async (req, res) => {
     try {
          const user = await UserCollection.findOne({ email: req.body.email });
          if (!user) {
               req.session.user = req.body;

               res.redirect("/user_otp");
          } else {
               res.render("user/signup", { emailFind: true, home: true });
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//otp controler----------------------------------------------------------------------------------
const otpControler = (req, res) => {
     try {
          generateOTP(req.session.user.email).then((OTP) => {
               req.session.otp = OTP;

               res.redirect("/user_generate");
          });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
};

//Generate otp----------------------------------------------------------------------------------
const OTPgeneration = asyncHandler((req, res) => {
     try {
          res.render("OTP/otp", { ph: req.session.user.email });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});
//otp post controler-----------------------------------------------------------------------------

const otpPostControler = asyncHandler(async (req, res) => {
     try {
          if (req.body.otp == req.session.otp) {
               const userObj = await UserCollection.create(req.session.user);
               console.log("userobject" + userObj);
               req.session.user = userObj;

               res.redirect("/user_home");
          } else {
               res.redirect("/user_otpError");
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//otp error--------------------------------------------------------------------------------------
const otpError = (req, res) => {
     try {
          res.render("OTP/otpErr");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
};

//user reset password-------------------------------------------------------------------------------------

const userResetPassword = async (req, res) => {
     res.render("user/reset-password", { email: req.session.user.email });
};

//user reset password post-------------------------------------------------------------------------------
const userResetPasswordPost = async (req, res) => {
     const userFound = await UserCollection.findOne({ email: req.body.email });

     if (userFound) {
          req.session.resetEmail = req.body.email;

          res.render("user/reset-password-user-found", { email: userFound.email });
     } else {
          res.render("user/usernot-found");
     }
};
//pasword reset succuss-------------------------------------------------------------------------

const passwordResetSuccessPost = asyncHandler(async (req, res) => {
     const email = req.session.resetEmail;
     const salt = 10;
     const password = await bcrypt.hash(req.body.password, salt);

     try {
          const newUser = await UserCollection.findOneAndUpdate({ email: email }, { password: password });

          req.session.user = newUser;
          res.render("user/password-change-success-page");
     } catch (error) {
          throw new Error(error.message);
     }
});

//userprofile------------------------------------------------------------------------------------------

const userProfile = async (req, res) => {
     res.redirect("/profile/account-details",);
};

///logout controler--------------------------------------------------------------------------------

const logout = (req, res) => {
     req.session.destroy();
     res.redirect("user_home");
};

////forgot password----------------------------------------------------------------------------------

const forgotPassword = (req, res) => {
     res.render("user/forgot-password");
};

//forgotpassword post controler---------------------------------------------------------------------

const forgotPasswordPost = asyncHandler(async (req, res) => {
     try {
          const userFound = await UserCollection.findOne({ email: req.body.email });
          if (userFound.isActive) {
               if (userFound) {
                    req.session.forgotPasswordEmail = req.body.email;

                    res.redirect("/forgot-password-generate-otp");
               } else {
                    res.render("user/forgot-password", { userNotFound: true });
               }
          } else {
               res.render("user/login", { isActive: true });
          }
     } catch (error) {
          throw new Error(error.message);
     }
});

//forgot password generate otp-----------------------------------------------------------------

const forgotPasswordGenerateOtp = asyncHandler(async (req, res) => {
     generateOTP(req.session.forgotPasswordEmail).then((OTP) => {
          req.session.otp = OTP;
          res.redirect("forgot-password-check-otp");
     });
});

//forgot password checkotp------------------------------------------------------------------

const forgotPasswordCheckOtp = asyncHandler(async (req, res) => {
     try {
          res.render("user/forgot-password-check-otp", { email: req.session.forgotPasswordEmail });
     } catch (error) {
          throw new Error(error.message);
     }
});
//FORGOT PASSWORD CHECK OTP POST-----------------------------------------------------------

const forgotPasswordCheckOtpPost = asyncHandler(async (req, res) => {
     try {
          if (req.session.otp == req.body.otp) {
               req.session.user = await UserCollection.findOne({ email: req.session.forgotPasswordEmail });

               res.redirect("user_resetpassword");
          } else {
               res.render("user/forgotpassword-failed");
          }
     } catch (error) {
          throw new Error(error.message);
     }
});

///user view products---------------------------------------------------------------------------

const userViewProducts = asyncHandler(async (req, res) => {
     try {
          if (!req.session.page) {
               req.session.page = 1;
          }
          const page = req.session.page;

          //pagination

          ////////////////////////////
          var products;
          var count;
          let cartCount = await cartCollection.findOne({ user: req.session.user._id });
          if (cartCount) {
               count = cartCount.products.length;
          } else {
               count = null;
          }

          const pro = await productCollection.find({}).lean();
          var productLength = pro.length;
          let pages = [1];
          let inc = 1;
          for (i = 1; i < productLength; i++) {
               if (i % 8 == 0) {
                    inc++;
                    pages.push(inc);
               }
          }

          products = await productCollection.find({}).skip(req.session.skip).limit(8).lean();
          const category = await categoryCollection.find({}).lean();
          if (products) {
               res.render("coupon/products", {
                    products,
                    category,
                    user: req.session.user._id,
                    count: count,
                    user: true,
                    pages,
                    page,
               });
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

//product details page--------------------------------------------------------------------------
const productDetails = asyncHandler(async (req, res) => {
     const product = await productCollection.findOne({ _id: req.query.id }).lean();
     const products = await productCollection.find({}).lean().limit(2);
     const image1 = product.subImage[0];
     const image2 = product.subImage[1];
     const image3 = product.subImage[2];
     const image4 = product.subImage[3];
     const image5 = product.subImage[4];

     res.render("user/product-details", { product, products, image1, image2, image3, image4, image5, user: true });
});

//changeProductCategory---------------------------------------------------------------------

const changeProductCategory = asyncHandler(async (req, res) => {
     try {
          const category = await categoryCollection.find({}).lean();
          const products = await productCollection.find({ category: req.params.id }).lean();

          req.session.products = products;
          req.session.category = category;

          if (products) {
               res.redirect("/changed");
          }
     } catch (error) {
          console.log(error.message);
          res.status(500);
          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
     // console.log(req.params.id)

     // console.log(req.params.id)

     // const category= await categoryCollection.find({}).lean();
     // const products = await productCollection.find({category:req.params.id}).lean();
     // if(products){
     //      res.render("user/view-products",{home:true,products,category})
     // }
});

const changed = asyncHandler((req, res) => {
     try {
          const category = req.session.category;
          const products = req.session.products;
          res.render("user/view-products", { home: true, products, category });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});


/////////////////////////---------------------------------------------------------------------

const filterProduct = asyncHandler(async (req, res) => {
     try {
          if (req.session.search) {
               let productData = await productCollection
                    .find({
                         $or: [
                              { name: { $regex: ".*" + req.body.search + ".*", $options: "i" } },
                              { category: { $regex: ".*" + req.body.search + ".*", $options: "i" } },
                         ],
                    })
                    .skip(req.session.skip)
                    .limit(8)
                    .lean();
               var productLength = products.length;
               var page = [1];

               for (i = 1; i < productLength; i++) {
                    if (i % 8 == 0) {
                         inc++;
                         pages.push(inc);
                    }
               }
          }
          if (req.session.filter) {
          

          const cat = await categoryCollection.find({}).lean();
          const sort = parseInt(req.body.sort);

          let products = [];

          const product = await productCollection
               .find({ category: { $in: req.body.category } })
               .sort({ price: sort })
               .lean();

          req.body.category.forEach((e) => {
               var value = 0;
               product.forEach((ele) => {
                    if (e == ele.category) {
                         if (ele.price > value) {
                              value = ele.price;
                         }
                    }
               });

               let percentage = (value * parseInt(req.body.price)) / 100;

               product.forEach((val) => {
                    if (val.category == e) {
                         if (val.price > percentage) {
                              products.push(val);
                         }
                    }
               });
          });
          //product finding
          if (!req.session.page) {
               req.session.page = 1;
          }
          const page = req.session.page;
          ////////////
          var count;
          let cartCount = await cartCollection.findOne({ user: req.session.user._id });
          if (cartCount) {
               count = cartCount.products.length;
          } else {
               count = null;
          }
          //////////////////

          var productLength = products.length;
          let pages = [1];
          let inc = 1;
          for (i = 1; i < productLength; i++) {
               if (i % 8 == 0) {
                    inc++;
                    pages.push(inc);
               }
          }
     }
          const category = await categoryCollection.find({}).lean();
          if (products) {
               res.render("coupon/products", { products, category, user: req.session.user._id, count: count, user: true, pages, page });
          }
     } catch (err) {
          throw new error(err.message);
     }
});

module.exports = {
     landingControler,
     signupControler,
     loginControler,
     homeControler,
     contactControler,
     aboutControler,
     signupPostControler,
     otpControler,
     otpPostControler,
     loginPostControler,
     OTPgeneration,
     otpError,
     userResetPassword,
     userResetPasswordPost,
     passwordResetSuccessPost,
     userProfile,
     logout,
     forgotPassword,
     forgotPasswordPost,
     forgotPasswordGenerateOtp,
     forgotPasswordCheckOtp,
     forgotPasswordCheckOtpPost,
     userViewProducts,
     productDetails,
     changeProductCategory,
     changed,
    
     filterProduct,
};
