const express = require('express');
const {verifyLogin}= require("../middlewares/middleware");
const { adminViewOrder, adminDeleteOrder, userOrderHistory, userOrderDetails, userOrderCancel, userOrderConfirm, adminEditOrder, changeOrderStatus, userOrderCancelSelectPayment, cancelConfirmControler, orderReturnReasonControler, orderReturnTypeSelection, userOrderReturnTypepost, orderInvoiceControler } = require('../Controler/orderControler');
const {verifyAdmin} = require('../middlewares/middleware')
const app = express.Router();

app.get("/admin-view-orders",verifyAdmin,adminViewOrder);

app.get("/delete-order",adminDeleteOrder,adminDeleteOrder)

app.get("/order-history",verifyLogin,userOrderHistory);

app.get("/user-order-details",verifyLogin,userOrderDetails);

app.get("/user-order-cancel",verifyLogin,userOrderCancel);

app.get("/user-order-confirm",verifyLogin,userOrderConfirm);

app.get("/admin-edit-order",verifyAdmin, adminEditOrder);

app.get("/change-order-status",verifyAdmin,changeOrderStatus);

app.get('/user-order-cancel-selectpayment',verifyLogin,userOrderCancelSelectPayment);

app.post("/user-order-cancel-confirm",verifyLogin,cancelConfirmControler);

app.get("/return-reason",verifyLogin,orderReturnReasonControler);

app.get("/user-order-return-type",verifyLogin,orderReturnTypeSelection)
app.post("/user-order-return-type",verifyLogin,userOrderReturnTypepost);

app.get("/invoice",orderInvoiceControler)

module.exports = app;