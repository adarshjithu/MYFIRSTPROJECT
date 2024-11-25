const asyncHandler = require("express-async-handler");
const userCollection = require("../models/userModel");
const productCollection = require("../models/productModel");
const orderCollection = require("../models/orderModel");
const walletCollection = require("../models/walletModel");
var objectid = require("objectid");
const fs = require("fs");
const path = require("path");
//admin view order--------------------------------------------------------------------------

const adminViewOrder = asyncHandler(async (req, res) => {
     try {
          var orders = await orderCollection
               .find({ user: { $exists: true } })
               .sort({ _id: -1 })
               .lean();

          //         ,{
          //         $project:{address:0,couponId:0,subtotal:0,discount:0}
          //     },
          //     {$unwind:'$products'},
          //     {
          //         $project:{
          //             _id:1,
          //             user:1,
          //             total:1,
          //             item:'$products.item',
          //             count:'$products.count',
          //             status:1,
          //             productsCount:1,
          //             orderedAt:1,
          //             payment:1

          //         }
          //     },
          //     {  $lookup: {
          //         from: "products",
          //         let: { item: { $toObjectId: "$item" } },
          //         pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
          //         as: "product",
          //    },},
          //    {$project:{
          //     _id:1,
          //     user:1,
          //     total:1,
          //     item:{$arrayElemAt:['$product',0]},
          //     count:'$products.count',
          //     status:1,
          //     productsCount:1,
          //     orderedAt:1,
          //     payment:1,

          //    }},
          //    {
          //     $lookup:{
          //         from:'users',
          //         let:{user:{$toObjectId:"$user"}},
          //         pipeline:[{$match:{$expr:{$eq:['$_id','$$user']}}}],
          //         as:'user'
          //     }
          //    },{
          //     $project:{
          //         _id:1,
          //         user:{$arrayElemAt:['$user',0]},
          //         total:1,
          //         productsCount:1,
          //         orderedAt:1,
          //         item:1,
          //         payment:1,
          //         status:1

          //     }
          //    }

          // ]);

          res.render("order/admin-view-order", { orders });
          console.log(orders[0].products);
     } catch (error) {
          console.log(error);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//delete order--------------------------------------------------------------------------------

const adminDeleteOrder = asyncHandler(async (req, res) => {
     try {
          await orderCollection.findByIdAndDelete({ _id: req.query.id });
          res.redirect("/order/admin-view-orders");
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

const userOrderHistory = asyncHandler(async (req, res) => {
     try {
          const orders = await orderCollection.aggregate([{ $match: { user: req.session.user._id } }, { $sort: { _id: -1 } }]);

          res.render("order/user-order-history", { home: true, orders });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//user order details------------------------------------------------------------------

const userOrderDetails = asyncHandler(async (req, res) => {
     try {
          var delivered = false;
          var cancelled = false;
          const orderData = await orderCollection.findOne({ _id: req.query.id }).lean();
          if (orderData.status == "Delivered") {
               delivered = true;
          }
          if (orderData.status == "Cancelled") {
               cancelled = true;
          }

          res.render("order/user-order-details", { home: true, orderData, delivered, cancelled });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//user order cancelllation-------------------------------------------------------------

const userOrderCancel = asyncHandler(async (req, res) => {
     res.render("order/user-order-cancel", { home: true, orderId: req.query.id });
});

//order confirm

const userOrderConfirm = asyncHandler(async (req, res) => {
     try {
          const order = await orderCollection.findOneAndUpdate({ _id: req.query.id }, { status: "Cancelled" });
          res.redirect("/order/order-history");
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

//admin edit order-----------------------------------------------------------------------

const adminEditOrder = asyncHandler(async (req, res) => {
     try {
          const orderData = await orderCollection.findOne({ _id: req.query.id }).lean();
          console.log(orderData);
          res.render("order/admin-edit-order", { orderData });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//changeOrderStatsus-----------------------------------------------------------------------------

const changeOrderStatus = asyncHandler(async (req, res) => {
     try {

          let arr = ["Placed", "Shipped", "Delivered", "Returned", "Cancelled"];
          let orderId = req.query.id;
         
          let status = req.query.status
          let current = await orderCollection.findOne({ _id: req.query.id });
          let currentStatus = current.status;
          console.log(req.query)

          let currentStatusPosition = arr.findIndex((e) => {
               return e == status;
          });
          let oldStatusPosition = arr.findIndex((e) => e == currentStatus);

        
           if(currentStatus=='Placed'&&status=='Returned'){
              res.json({success:false,sttus:req.query.status})
          }
          else if(currentStatus=='Shipped'&&status=='Returned'){
               res.json({success:false,sttus:req.query.status})
          }
          else if(currentStatus=='Delivered'&&status=='Cancelled'){
               res.json({success:false,sttus:req.query.status})
          }
          else if (currentStatusPosition > oldStatusPosition) {
               await orderCollection.findOneAndUpdate({ _id: req.query.id }, { status: req.query.status });
               res.json({success:true})
          }
           else {
               res.json({success:false,status:req.query.status})
          }
          
         
     } catch (error) {
          console.log(error);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//user order cancel select payment---------------------------------------------------------

const userOrderCancelSelectPayment = asyncHandler(async (req, res) => {
     try {
          console.log(req.query.id, "orderId");

          const order = await orderCollection.findOne({ _id: req.query.id }).lean();
          console.log("order", order.products);
          let proData = order.products;
          //order is cash on delivery
          if (order.payment == "COD") {
               for (let i of proData) {
                    await productCollection.updateOne(
                         { _id: i.item },
                         {
                              $inc: {
                                   quantity: i.count,
                              },
                         }
                    );
               }

               res.render("order/order-cancelled");
               await orderCollection.findByIdAndUpdate(
                    { _id: req.query.id },
                    {
                         status: "Cancelled",
                    }
               );
          }

          //order is online payment
          else {
               // var orderDetails = order.products[0].product
               // orderDetails.orderId= order._id
               // orderDetails.total=order.total;
               // orderDetails.count=order.products[0].count

               res.render("order/user-order-cancel-selectpayment", { home: true, order });
          }
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});
///order cancel confirm------------------------------------------------------------------------

const cancelConfirmControler = asyncHandler(async (req, res) => {
     try {
          let order = await orderCollection.findOne({ _id: req.query.orderId });
          let amount = parseInt(order.total);

          let transactionId = "#" + Math.floor(Math.random() * 100000000);
          let date = new Date().toDateString();

          let proData = order.products;

          if (req.body.money == "giftCardWallet") {
               for (let i of proData) {
                    await productCollection.updateOne(
                         { _id: i.item },
                         {
                              $inc: {
                                   quantity: i.count,
                              },
                         }
                    );
               }
               const walletFind = await walletCollection.findOne({ user: req.session.user._id });

               //wallet find
               if (walletFind) {
                    const walletAmount = walletFind.amount + amount;

                    //incrementing wallet amount
                    await walletCollection.updateOne({ user: req.session.user._id }, { $set: { amount: walletAmount } });
                    //pushing wallet transction

                    await walletCollection.updateOne(
                         { user: req.session.user._id },
                         {
                              $push: {
                                   transactions: {
                                        transactionId: transactionId,
                                        date: date,
                                        status: "Credit",
                                        description: "Order Cancel",
                                        amount: amount,
                                   },
                              },
                         }
                    );
                    //changing order status
                    await orderCollection.findByIdAndUpdate(
                         { _id: req.query.orderId },
                         {
                              status: "Cancelled",
                         }
                    );

                    res.render("order/order-cancelled");
               } else {
                    const walletObj = {
                         user: req.session.user._id,
                         amount: amount,
                         transactions: [
                              {
                                   transactionId: transactionId,
                                   date: date,
                                   status: "Credit",
                                   description: "Order Cancel",
                                   amount: amount,
                              },
                         ],
                    };
                    await walletCollection.create(walletObj);
                    res.render("order/order-cancelled");
               }
          }
     } catch (error) {
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//order return reason-----------------------------------------------------------------------------------

const orderReturnReasonControler = asyncHandler(async (req, res) => {
     try {
          const orderId = req.query.id;
          res.render("order/order-return-reason", { orderId });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

///order return type selection page----------------------------------------------------------

const orderReturnTypeSelection = asyncHandler(async (req, res) => {
     try {
          const orders = await orderCollection.findOne({ _id: req.query.id }).lean();

          res.render("order/return-type", { orders });
     } catch (error) {
          console.log(error.message);
     }
});

//user order return type----------------------------------------------------------------------

const userOrderReturnTypepost = asyncHandler(async (req, res) => {
     try {
          console.log(req.query.orderId, "orderId");

          let order = await orderCollection.findOne({ _id: req.query.orderId });
          let transactionId = "#" + Math.floor(Math.random() * 100000000);
          let date = new Date().toDateString();
          var amount = parseInt(order.total);
          proData = order.products;
          if (req.body.money == "giftCardWallet") {
               const walletFind = await walletCollection.findOne({ user: req.session.user._id });

               for (let i of proData) {
                    await productCollection.updateOne(
                         { _id: i.item },
                         {
                              $inc: {
                                   quantity: i.count,
                              },
                         }
                    );
               }
               //wallet find
               if (walletFind) {
                    const walletAmount = walletFind.amount + amount;

                    //incrementing wallet amount
                    await walletCollection.updateOne({ user: req.session.user._id }, { $set: { amount: walletAmount } });
                    //pushing wallet transction

                    await walletCollection.updateOne(
                         { user: req.session.user._id },
                         {
                              $push: {
                                   transactions: {
                                        transactionId: transactionId,
                                        date: date,
                                        status: "Credit",
                                        description: "Order Returned",
                                        amount: amount,
                                   },
                              },
                         }
                    );
                    //changing order status
                    await orderCollection.findByIdAndUpdate(
                         { _id: req.query.orderId },
                         {
                              status: "Returned",
                         }
                    );

                    res.render("order/order-cancelled");
               } else {
                    const walletObj = {
                         user: req.session.user._id,
                         amount: amount,
                         transactions: [
                              {
                                   transactionId: transactionId,
                                   date: date,
                                   description: "Order Returned",
                                   status: "Credit",

                                   amount: amount,
                              },
                         ],
                    };
                    await walletCollection.create(walletObj);
                    res.render("order/order-cancelled");
               }
          }
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//invoice----------------------------------------------------------------------------

const orderInvoiceControler = asyncHandler(async (req, res) => {
     const order = await orderCollection.findOne({ _id: req.query.id });
     var easyinvoice = require("easyinvoice");
     let pro = order.products;
     let obj;
     let currentDate = new Date();

     // Get the current date plus 10 days
     let futureDate = new Date();
     futureDate.setDate(currentDate.getDate() + 10);

     // Format the dates as strings
     let formattedCurrentDate = currentDate.toISOString().split("T")[0];
     let formattedFutureDate = futureDate.toISOString().split("T")[0];

     let products = [];
     pro.forEach((e) => {
          obj = {
               quantity: e.count,
               description: e.product.name,
               taxRate: 10,
               price: e.product.price,
          };
          products.push(obj);
     });
     console.log(products);

     var data = {
          apiKey: "free", // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
          mode: "development", // Production or development, defaults to production

          // Your own data
          sender: {
               company: "DIGITYX",
               address: "Sm Street calicut",
               zip: "673601",
               city: "Calicut",
               country: "India",
               // custom1: "custom value 1",
               // custom2: "custom value 2",
               // custom3: "custom value 3"
          },
          // Your recipient
          client: {
               company: `${order.address.firstname}`,
               address: order.address.address,
               zip: order.address.zipcode,
               city: order.address.state,
               country: order.address.country,
               // custom1: "custom value 1",
               // custom2: "custom value 2",
               // custom3: "custom value 3"
          },
          information: {
               // Invoice number
               number: req.query.id,
               // Invoice data
               date: formattedCurrentDate,
               // Invoice due date
               dueDate: formattedFutureDate,
          },
          // The products you would like to see on your invoice
          // Total values are being calculated automatically
          products: products,
          // The message you would like to display on the bottom of your invoice
          bottomNotice: "Kindly pay your invoice within 15 days.",
          // Settings to customize your invoice
          settings: {
               currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
               // locale: "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
               // marginTop: 25, // Defaults to '25'
               // marginRight: 25, // Defaults to '25'
               // marginLeft: 25, // Defaults to '25'
               // marginBottom: 25, // Defaults to '25'
               // format: "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
               // height: "1000px", // allowed units: mm, cm, in, px
               // width: "500px", // allowed units: mm, cm, in, px
               // orientation: "landscape" // portrait or landscape, defaults to portrait
          },
          // Translate your invoice to your preferred language
          translate: {
               // invoice: "FACTUUR",  // Default to 'INVOICE'
               // number: "Nummer", // Defaults to 'Number'
               // date: "Datum", // Default to 'Date'
               // dueDate: "Verloopdatum", // Defaults to 'Due Date'
               // subtotal: "Subtotaal", // Defaults to 'Subtotal'
               // products: "Producten", // Defaults to 'Products'
               // quantity: "Aantal", // Default to 'Quantity'
               // price: "Prijs", // Defaults to 'Price'
               // productTotal: "Totaal", // Defaults to 'Total'
               // total: "Totaal", // Defaults to 'Total'
               // taxNotation: "btw" // Defaults to 'vat'
          },

          // Customize enables you to provide your own templates
          // Please review the documentation for instructions and examples
          // "customize": {
          //      "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
          // }
     };

     //Create your invoice! Easy!

     //The response will contain a base64 encoded PDF file
     easyinvoice.createInvoice(data, function (result) {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename=${Date.now()}invoice.pdf`);
          res.send(Buffer.from(result.pdf, "base64"));
     });
});
module.exports = {
     adminViewOrder,
     adminDeleteOrder,
     userOrderHistory,
     userOrderDetails,
     userOrderCancel,
     userOrderConfirm,
     adminEditOrder,
     changeOrderStatus,
     userOrderCancelSelectPayment,
     cancelConfirmControler,
     orderReturnReasonControler,
     orderReturnTypeSelection,
     userOrderReturnTypepost,
     orderInvoiceControler,
};
