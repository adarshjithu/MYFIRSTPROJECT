const express = require("express");
const { signupControler, viewOtp, verifyOtp, resend } = require("../Controler/otpControler");
const app = express.Router();
app.post("/signup",signupControler);
app.get("/viewOtp/:id",viewOtp);
app.get("/verifyOtp",verifyOtp);

app.get("/resend",resend)

module.exports = app;