const productCollection = require("../models/productModel");
const cartCollection = require("../models/cartModel");
const addressCollection = require("../models/addressModel");
const orderCollection = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const wishListCollection = require("../models/wishlistModel");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const paymentCollection = require("../models/paymentModel");
const couponCollection = require('../models/couponModel');
const productsCollection = require('../models/productModel');
const walletCollection = require('../models/walletModel')
const { checkoutProductChecking } = require("../middlewares/middleware");
const razorpay = new Razorpay({
     key_id: "rzp_test_REpsQUqylPJZxt",
     key_secret: "B73pT7m7mlLQTj1Zzlx6Gvx5",
});

const addToCart = asyncHandler(async (req, res,next) => {
     let productCollectionCount = await productsCollection.findOne({_id:req.query.proId}); //fetching quantity of a product in the product collection
     let outOfStock = false;
     try {
          if(productCollectionCount.quantity <=0){
           outOfStock = true;
          }
          else{
               
               
               let cart = await cartCollection.findOne({user:req.session.user._id});//checking product quantity
               if(cart){
               let products = cart.products;
               let productExistInCart = products.findIndex((e)=>e.item == req.query.proId)
            
               console.log(productExistInCart)
               if(productExistInCart!=-1){
                   let item = products.filter((e)=>{
                    return e.item ==req.query.proId;
     
                   })
                  
                  if((productCollectionCount.quantity-item[0].count)<1){
                    outOfStock=true;
                  }
                 
               }
               else{
 
               }}
          }


      console.log("out of stock",outOfStock)
          if(outOfStock){    
               console.log('josn')      //checking product out of stock or not ;
               res.json({success:false})
          } 
          else{
          console.log('cal')

          const userId = req.session.user._id;

          const proId = req.query.proId; 

          const cart = await cartCollection.findOne({ user: userId });
          //if cart already exists
          if (cart) {
               const proExists = cart.products.findIndex((e) => e.item == proId);
               if (proExists != -1) {
                    await cartCollection.updateOne({ user: userId, "products.item": proId }, { $inc: { "products.$.count": 1 } });
                    //decrementing quantity
                   
               } else {
                   
                    await cartCollection.updateOne(
                         { user: userId, user: userId },
                         { $push: { products: { item: proId, count: 1 } } }
                    );
                    //decrementing quantity
               }
          }

          //if cart doesnt exists
          else {
               const cartObj = {
                    user: userId,
                    products: [{ item: proId, count: 1 }],
               };

               await cartCollection.create(cartObj);
          }

          ///cartcount
          let cartCount = await cartCollection.findOne({ user: userId });
          var Count;
          if(cartCount){
             Count = cartCount.products.length;
          }
          else{
               Count=0
          }
          res.json({ count: Count,success:true });}
               //  ,totalProducts:proCount
               

     } catch (error) {
          console.log(error);
       
     }
});



//cart view page-------------------------------------------------------------

const cartControler = asyncHandler(async (req, res) => {
 
   
     try {
          const cartCount = await cartCollection.findOne({user:req.session.user._id});

          if(cartCount){

          
          var cart;
      
          
          //checking cart is empty or not 
          
          if(cartCount.products.length<=0||!cartCount){
             res.render("cart/cart-empty")
          }
          else{
               
          
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
          
          if(req.session.singleProduct){ 
            cart=cartDetails.filter((e)=>{ 
               return e.item==req.session.singleProduct; 
            })
          }
          else{ 
             cart = cartDetails
          }
         
          res.render("cart/cart", { home: true, cart });}}
          else{
               res.render("cart/cart-empty")
          }
          
     } catch (error) {
         
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)    
               
          
     }
});

//delete cart item-------------------------------------------------------------------
const deleteCartItem = asyncHandler(async (req, res) => {
     try{
     var cartCount= await cartCollection.findOne({user:req.session.user._id});
     

     //check if is the cartcount is zero if the cart count is zero we dont want the cart need to delete the whole cart;
     if (cartCount.products.length == 1){
          var cartObj = await cartCollection.findOne({user:req.session.user._id});

        
          await cartCollection.deleteOne({user:req.session.user._id});
          res.redirect("/cart/view-cart");
     }
     else{

     
     
     
  

   
   
  
          let user = await cartCollection.updateOne(
               { user: req.session.user._id },
               {
                    $pull: { products: { item: req.params.id } },
               }
          );

          res.redirect("/cart/view-cart");
          const userId = req.session.user._id;
          const proId = req.query.id;}
}
      catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)      
       
     }
})

//change quantity--------------------------------------------------------------------

const changeQuantity = asyncHandler(async (req, res) => {
     let outOfStock = false
     let proCount = await productCollection.findOne({_id:req.query.proId});
     let cartItems = await cartCollection.findOne({user:req.session.user._id});
     let products = cartItems.products;
     let product = products.filter((e)=>{
          return e.item == req.query.proId;
     })
     console.log(product)
     console.log(proCount.quantity)
     if(req.query.count==1&&(proCount.quantity-product[0].count)<1){
          outOfStock=true
     }
     if(proCount.quantity<=0&&req.query.count==1){
          outOfStock = true;
     }
   //product count
     let q= 1
     try {
          let userId = req.session.user;
          let proId = req.query.proId;
          let count = parseInt(req.query.count);

          //updataing cart count
          if(outOfStock){

          }
          else{

               const cart = await cartCollection.updateOne(
                    { user: userId, "products.item": proId },
                    { $inc: { "products.$.count": count } }
               );
          }

          var inc
       
          if(count==1){
               inc=-1;
          }
          else{
               inc=1;
          }
          if(q<=0&&count==1){

          }
          else{

           
               
          }

          ///fetching subtotal of a specific product
          const subtotal = await cartCollection.aggregate([
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
               {
                    $match: { item: proId },
               },
               {
                    $project: { total: "$total" },
               },
          ]);
          if(outOfStock){
               res.json({ success: false, total: subtotal[0].total });
          }
          else{

           
            
               res.json({ success: true, total: subtotal[0].total });
          }

     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

//cart count-----------------------------------------------------------------------

const cartCount = asyncHandler(async (req, res,next) => {
     try {
         
          //fechting count of products
          const cart = await cartCollection.findOne({ user: req.session.user._id });
          if(cart){


   
          var cartCount;
          if (cart.products) {
               cartCount = cart.products.length;
          } else {
               cartCount = "";
          }
          //fetching wishlist count

          //fetching total price of product without discount

          let cartDatas = await cartCollection.aggregate([
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
                         as: "product",
                    },
               },
               {
                    $project: {
                         item: 1,
                         count: 1,
                         product: { $arrayElemAt: ["$product", 0] },
                    },
               },
               {
                    $group: {
                         _id: null,
                         total: { $sum: { $multiply: ["$count", "$product.price"] } },
                         discount: { $sum: { $multiply: ["$count", "$product.totalDiscount"] } },
                    },
               },
          ]);
          //total discount and subtotal and total amount that subtotal - discount
          var discount;

          if (cartDatas[0].discount) {
               discount = cartDatas[0].discount;
          } else {
               discount = "";
          }
          const subTotal = cartDatas[0].total;
          const totalPrice = subTotal - discount;

          res.json({ count: cartCount, discount: discount, subTotal: subTotal, totalPrice: totalPrice });}
          
          else{
               res.json({count:0})
          }
     }
     catch(error){
    
         console.log(error.message);
         var err = new Error();
         error.statusCode = 400;
         next(err)
          
     }
});

//checkout page----------------------------------------------------------------------

const  checkoutControler = asyncHandler(async (req, res) => {
    
      let walletTotal=0;
      //wallet total for eligiblty checking
     let wallet= await walletCollection.findOne({user:req.session.user._id})
     if(wallet){

          walletTotal  =  JSON.stringify(wallet.amount);
     }
     let user = JSON.stringify(req.session.user._id)
     // checkoutProductChecking()
     try {
          let counting = await cartCollection.findOne({user:req.session.user._id});
          if(!counting){
              res.redirect("/")
          }
          else{
       
          if (req.session.addresstype == null) {
               req.session.addresstype = "home";
          }
            //finding cart details
            var cart;
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

          if(req.session.singleProduct){
               cart = cartDetails.filter((e)=>{
                    return e.item == req.session.singleProduct
               })
          }
          else{
               cart=cartDetails
          }
          ///////////////////
          //finding address
          var address = await addressCollection.aggregate([
               { $match: { user: req.session.user._id } },
          ]);
          
          
          var noAddress = false;
          if(address==undefined){
               noAddress=true
          }
          else if(address.length==0){
               noAddress=true
          }
          else{
               false;
          }
   
          
////////////////////////////////
           //finding total amount for coupon

           let cartDatas = await cartCollection.aggregate([
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
                         as: "product",
                    },
               },
               {
                    $project: {
                         item: 1,
                         count: 1,
                         product: { $arrayElemAt: ["$product", 0] },
                    },
               },
               {
                    $group: {
                         _id: null,
                         total: { $sum: { $multiply: ["$count", "$product.price"] } },
                         discount: { $sum: { $multiply: ["$count", "$product.totalDiscount"] } },
                    },
               },
          ]);
          var total = cartDatas[0].total-cartDatas[0].discount
         
          //finding coupons

          const coupon = await couponCollection.aggregate([{$match:{minimumpurchase:{$lt:total},isActive:true}},{$match:{
               'users':{$not:{$elemMatch:{$eq:req.session.user._id}}}
          }}])
        
    
     
          
          

     
          const userId = req.session.user._id;
         
          //////////////////////////////
          res.render("cart/checkout", { home: true, cart, address,coupon ,userId,noAddress,user,walletTotal});
     }  
     } 
     catch(error){
          console.log(error.message)
       
          var err = new Error();
          error.statusCode = 500;
          next(err)
          
     }
});

//checkout post controler--------------------------------------------------------------------

const checkoutPostControler = asyncHandler(async (req, res) => {
    
    
     

    //selecting the address for checkout
    let address = await addressCollection.findOne({$and:[{user:req.session.user._id},{home:true}]});

    //seting address to body
    req.body.firstname=address.firstname
    req.body.lastname=address.lastname
    req.body.address=address.address
    req.body.email=address.email
    req.body.number=address.phonenumber
    req.body.country=address.country
    req.body.state=address.state
    req.body.zipcode=address.zipcode


     
     req.body.deliverycharge = parseInt(req.body.deliverycharge)
     req.body.subtotal=parseInt(req.body.subtotal);
     req.body.referaldiscount=parseInt(req.body.referaldiscount)
     req.body.discount=parseInt(req.body.discount);
     req.body.total = parseInt(req.body.total)

     try{

   
     
     const product = await cartCollection.findOne({ user: req.session.user });
     const productCount = product.products.length;
     var cart;
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

     if(req.session.singleProduct){
          cart = cartDetails.filter((e)=>{
               return e.item==req.session.singleProduct
          })
     }
     else{
          cart = cartDetails;
     }
     //--------------------------------------------------------------------------

     /// IF PAYMENT METHOD IS COD
     if (req.body.payment == "COD") {
          req.body.discount = parseInt(req.body.discount)
        
          const orderObj = {
               user: req.session.user._id,
               address: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    address: req.body.address,
                    email: req.body.email,
                    phonenumber: req.body.number,
                    country: req.body.country,
                    state: req.body.state,
                    zipcode: req.body.zipcode,
               },
               payment: req.body.payment,
               total: req.body.total,
               subtotal: req.body.subtotal,
               discount: req.body.discount,
               referalCode:req.body.referal,
               referalDiscount:req.body.referaldiscount,
               couponId: "",
               deliveryCharge:req.body.deliverycharge,
               
               products: cart,
               productsCount: product.products.length,
               couponCode:req.body.couponcode,
               coupon:req.body.coupon
          };

          await orderCollection.create(orderObj);
         
          const orderObject = await orderCollection.findOne(orderObj);
          //payment object to store in payment collections
          req.session.orderId=orderObject._id;
          const paymentObj = {
               order: '',
               type: "COD",
               orderDetails:orderObject._id ,
          };
          //saving payment details to payment collection

          await paymentCollection.create(paymentObj);
          if(req.session.singleProduct){
               let user = await cartCollection.updateOne(
                    { user: req.session.user },
                    {
                         $pull: { products: { item: req.session.singleProduct } },
                    }
               );
               req.session.singleProduct=null;
          }
          else{
              

          }
          res.redirect("/cart/order-success");
     }
//----------------------------------------------------------------------------------
     //PAYMENT IS RAZORPAY
     else if(req.body.payment=='online'){
          const orderObj = {
               user: req.session.user._id,
               address: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    address: req.body.address,
                    email: req.body.email,
                    phonenumber: req.body.number,
                    country: req.body.country,
                    state: req.body.state,
                    zipcode: req.body.zipcode,
               },
              
               payment: req.body.payment,
               total: req.body.total,
               subtotal: req.body.subtotal,
               discount: req.body.discount,
               referalCode:req.body.referal,
               referalDiscount:req.body.referaldiscount,
               couponId: "",
               deliveryCharge:req.body.deliverycharge,
               
               products: cart,
               productsCount: product.products.length,
               couponCode:req.body.couponcode,
               coupon:req.body.coupon
          };
          await orderCollection.create(orderObj);
          const orderData = await orderCollection.findOne(orderObj).lean();
          
          const paymentObj = {
               order: '',
               type: "Online",
               orderDetails:req.session.orderId ,
          };
          //saving payment details to payment collection

          await paymentCollection.create(paymentObj)


          await razorpay.orders
               .create({
                    amount: req.body.total*100,
                    currency: "INR",
                    receipt: orderData._id,
                    partial_payment: false,
                    notes: {
                         key1: "value3",
                         key2: "value2",
                    },
               })
               .then((order, error) => {
                    if (order) {
                         
                         console.log("its here");
                         req.session.orderId = orderData._id;
                         req.session.razorpayOrder = order;
                         res.render("cart/razorpay", { order, orderData });
                    } else {
                         console.log(error);
                    }
               });
     }

     //wallet payment--------------------------------------------------------------------
     else{
          const orderObj = {
               user: req.session.user._id,
               address: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    address: req.body.address,
                    email: req.body.email,
                    phonenumber: req.body.number,
                    country: req.body.country,
                    state: req.body.state,
                    zipcode: req.body.zipcode,
               },
               payment: req.body.payment,
               total: req.body.total,
               subtotal: req.body.subtotal,
               discount: req.body.discount,
               referalCode:req.body.referal,
               referalDiscount:req.body.referaldiscount,
               couponId: "",
               deliveryCharge:req.body.deliverycharge,
               
               products: cart,
               productsCount: product.products.length,
               couponCode:req.body.couponcode,
               coupon:req.body.coupon
          };
          await orderCollection.create(orderObj);
         
          const orderObject = await orderCollection.findOne(orderObj);
          //payment object to store in payment collections
          req.session.orderId=orderObject._id;
          const paymentObj = {
               order: '',
               type: "Wallet",
               orderDetails:orderObject._id ,
          };
          //saving payment details to payment collection

          await paymentCollection.create(paymentObj);
          if(req.session.singleProduct){
               let user = await cartCollection.updateOne(
                    { user: req.session.user },
                    {
                         $pull: { products: { item: req.session.singleProduct } },
                    }
               );
               req.session.singleProduct=null;
          }
          else{
              

          }
          res.redirect("/cart/order-success");

          //checking is there enough wallet amount exists
        
          //else redirect to the checkout page
        
       

 

     }
}
     catch(error){
          console.log(error);
       
     }
});

//checkout change addresss---------------------------------------------------------------------

const checkoutChangeAddress = asyncHandler(async (req, res) => {
     try{

          req.session.addresstype = req.query.type;
          res.json({ success: true });
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

//razorpay-----------------------------------------------------------------------------

const razorPayControler = asyncHandler(async (req, res) => {
     try{

     console.log(process.env.RAZORPAY_KEY_SECRET)
     //crating signature using crypto library
     var crypto = require("crypto");
     var razorpaySecret =`${process.env.RAZORPAY_KEY_SECRET}`
     var hmac = crypto.createHmac("sha256", razorpaySecret);
     hmac.update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id);
     hmac = hmac.digest("hex");
     //checking created signature and razorpay given signature are the same
     if (hmac == req.body.razorpay_signature) {
          console.log("payment successful");
          //payment object to store in payment collections
          const paymentObj = {
               order: req.session.razorpayOrder,
               type: "Online",
               orderDetails: req.session.orderId,
          };
          //saving payment details to payment collection

          await paymentCollection.create(paymentObj);
          res.redirect("/cart/order-success")
     } else {
          console.log("payment not successfull");
          await orderCollection.deleteOne({ _id: req.session.orderId });
          res.send("payment Failed");
     }
}
catch(error){
     console.log(error.message);
     var err = new Error();
     error.statusCode = 400;
     next(err)
     
}
});

//order success---------------------------------------------------------------------

const OrderSuccess = asyncHandler(async(req,res)=>{
     try{

          let data =  await orderCollection.findOne({_id:req.session.orderId});
          console.log(data,'this is data')
          //checking coupon 
          if(data.couponCode==''){

          }
          else{
               await couponCollection.updateOne(
                    {couponcode:data.couponCode},
                    {
                         $push: { users: req.session.user._id },
                    }
               );
          }
         
          const totalAmout = data.total;
          let coupon = await couponCollection.find({}).lean()
          let cart = await cartCollection.findOne({user:req.session.user._id});
          let products = cart.products;
          for(let i of products){
              let data = await productsCollection.updateOne({_id:i.item},{
               

          
               $inc:{
                    quantity:`-${i.count}`
               }
              })
              console.log(data)
          }
          //checking wallet payment or not
          if(data.payment=='Wallet'||data.payment=='wallet'){
               let transactionId ='#'+Math.floor(Math.random()*100000000);
               //decrement the total amount by total purchase amount
               let total = data.total
               await walletCollection.updateOne({user:req.session.user._id},{
                    $inc:{
                         amount:`-${total}`
                    }
               })

               let walletObj={

               }
               ////adding transaction history
               await walletCollection.updateOne({user:req.session.user._id},{$push:{transactions:{
                    transactionId:transactionId,
                    date:new Date().toDateString(),
                    status:'Debit',
                    description:'Bought Products',
                    amount:total,
                    

                

               }}})


          }

          await cartCollection.deleteOne({user:req.session.user._id})
           res.render("cart/order-success")
     }
     catch(error){
          console.log(error);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
  
})

//out of stock checkng

const outOfStock = asyncHandler(async(req,res)=>{
     // await productCollection.updateMany({quanity:0},{$set:{
     //      status:'Out Of Stock'
     // }})
})

const addressExistsControler = asyncHandler(async(req,res)=>{
     try{

          const address = await addressCollection.findOne({user:req.query.id});
          if(address){
               res.json({address:true})
          }
          else{
               res.json({address:false})
          }
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err)
     }
})

//singleProduct purchase controler----------------------------------------------------------------

const singleProduct = asyncHandler(async(req,res)=>{
 try {
        const userId = req.session.user._id;

        const proId = req.query.proId;
        req.session.singleProduct=req.query.proId;

        const cart = await cartCollection.findOne({ user: userId });
        //if cart already exists
        if (cart) {
             const proExists = cart.products.findIndex((e) => e.item == proId);
             if (proExists != -1) {
                  await cartCollection.updateOne({ user: userId, "products.item": proId }, { $inc: { "products.$.count": 1 } });
             } else {
                  await cartCollection.updateOne(
                       { user: userId, user: userId },
                       { $push: { products: { item: proId, count: 1 } } }
                  );
             }
        }

        //if cart doesnt exists
        else {
             const cartObj = {
                  user: userId,
                  products: [{ item: proId, count: 1 }],
             };

             await cartCollection.create(cartObj);
        }

        ///cartcount
        let cartCount = await cartCollection.findOne({ user: userId });
        
        res.redirect("/cart/view-cart")
   } catch (error) {
     console.log(error.message);
     var err = new Error();
     error.statusCode = 500;
     next(err)
   }
})

//checkcheckout ----------------------------------------

const checkCheckout = asyncHandler(async(req,res)=>{
let cart = await cartCollection.findOne({user:req.session.user._id});
let products=cart.products;
let outOfStock=[];
for(let e of products){
     let data = await productCollection.findOne({_id:e.item});
     if(data.quantity<e.count){
          outOfStock.push(data.name)
     }

}
let result ='';
for(let i of outOfStock){
     result = result+`,${i}`
}
console.log(result)
if(outOfStock.length==0){
     res.json({success:true})
}
else{
     res.json({success:false,result:outOfStock})
}


})

//updateCatrt-----------------------------------------------------------------------------
const updateCart = asyncHandler(async(req,res)=>{
     let cart = await cartCollection.findOne({user:req.session.user._id});
let products=cart.products;
let outOfStock=[];
for(let e of products){
     let data = await productCollection.findOne({_id:e.item});
     if(data.quantity<e.count){
          outOfStock.push(e.item)
     }

}
if(cart.products.length==1){
     await cartCollection.deleteOne({user:req.session.user._id});
}else{
console.log('out of stcollasdasdfasdfasdf',outOfStock)
     for(let i of outOfStock){
     
          await cartCollection.updateOne({user:req.session.user._id},{
               $pull:{products:{item:i}}
          })
     }
}
res.json({success:true})
})

//////implementing buy now of a products 


const buyNow = asyncHandler(async(req,res)=>{
     console.log(req.query)

     await cartCollection.updateOne({user:req.session.user._id},{
          $set:{
               products:[{item:req.query.id,count:1}]
          }
     })
})
////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
     addToCart,
     cartControler,
     deleteCartItem,
     changeQuantity,
     cartCount,
     checkoutControler,
     checkoutPostControler,
     checkoutChangeAddress,
     razorPayControler,
     OrderSuccess,
     outOfStock,
     addressExistsControler,
     singleProduct,
     checkCheckout,
     updateCart,
     buyNow
};
