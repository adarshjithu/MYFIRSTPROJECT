const express = require("express");
const {verifyLogin}= require("../middlewares/middleware");
const {verifyAdmin} = require('../middlewares/middleware')

const {
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
     buyNow,
} = require("../Controler/cartControler");
const cartCollection = require("../models/cartModel");

const app = express.Router();
app.get("/addtocart",verifyLogin, addToCart);
app.get("/view-cart",verifyLogin, cartControler);
app.get("/deleteCart/:id",verifyLogin, deleteCartItem);
app.get("/changeQuantity", changeQuantity);
app.get("/cartcount",verifyLogin, cartCount);
app.get("/checkout",verifyLogin, checkoutControler);
app.post("/checkout",verifyLogin, checkoutPostControler);
app.get("/checkout-change-address",verifyLogin, checkoutChangeAddress);
app.post("/razorpay",verifyLogin, razorPayControler);
app.get("/order-success",verifyLogin, OrderSuccess);
app.get("/outofstock", outOfStock);
app.get("/address-exists", addressExistsControler);
app.get("/buy-now", singleProduct);
app.get("/checkCheckout",checkCheckout);
app.get("/updateCart",updateCart);
app.get("/buyNow",buyNow)
// app.get("")

module.exports = app;
