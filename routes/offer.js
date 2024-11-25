const express = require("express");
const app = express.Router();
const {offers} =  require('../models/offerModel');
const { adminProductOfferControler, deleteProductOffer, categoryOffer, userOffers, referalBonus, createReferalCode, applyReferalCotroler, adminAddReferalOffer, offerToWallet, deleteCategoryOffer } = require("../Controler/offerControler");
const { Certificate } = require("crypto");
const { verifyLogin, verifyAdmin } = require("../middlewares/middleware");


app.post("/addProductOffer",verifyAdmin,adminProductOfferControler);
app.get("/deleteProductOffer",verifyAdmin,deleteProductOffer);
app.post("/categoryOffer",verifyAdmin,categoryOffer);
app.get("/user-offers",verifyLogin,userOffers);
app.get("/referalbonus",verifyLogin,referalBonus);
app.get("/createReferal",verifyLogin,createReferalCode);
app.get("/applyReferal",verifyLogin,applyReferalCotroler);
app.post("/admin-addreferaloffer",verifyAdmin,adminAddReferalOffer);
app.get("/toWallet",verifyLogin,offerToWallet);
app.get("/deleteCategoryOffer",deleteCategoryOffer)




module.exports = app;
