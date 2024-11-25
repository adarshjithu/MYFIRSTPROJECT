const express = require('express');
const app = express.Router();
const {verifyLogin}= require("../middlewares/middleware");
const { upload} = require('../config')
const {profileAddressControler, profileAddressPostControler, deleteAddress, editAddress, editAddressPost, accountDetails, accountDetailsPost, profileChangeImage, profileIconControler, walletControler, changeAddress, checkoutChangeAddress, removeTrans}= require("../Controler/profileControler")
 
 

app.get('/address',verifyLogin,profileAddressControler);
app.post('/address',verifyLogin,profileAddressPostControler);
app.get("/delete-address",verifyLogin,deleteAddress);
app.get("/edit-address",verifyLogin,editAddress);
app.post("/edit-address",verifyLogin,editAddressPost);
app.get('/account-details',verifyLogin,accountDetails);
app.post('/account-details',verifyLogin,accountDetailsPost);
app.post("/change-image",upload.single('image'),profileChangeImage);
app.get("/profile-icon",verifyLogin,profileIconControler);
app.get("/wallet",verifyLogin,walletControler);
app.get('/changeAddress',changeAddress)
app.post("/updateAddress",checkoutChangeAddress);
app.get("/removeTrans",removeTrans)
module.exports = app;