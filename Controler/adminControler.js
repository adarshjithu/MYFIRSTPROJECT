const { createAdmin, download } = require("../middlewares/middleware");
const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/userModel");
const Admin = require("../models/adminModel");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");
const orderCollection = require("../models/orderModel");
const offerCollection = require("../models/offerModel");
const bannerCollection = require("../models/bannerModel");
const paymentCollection = require("../models/paymentModel");
const userCollection = require("../models/userModel");
const cartCollection = require("../models/cartModel")
const { convertArrayToCSV } = require("convert-array-to-csv");
const { report } = require("../report");


const adminHome = asyncHandler(async (req, res) => {
     let orders = await orderCollection.find({}).limit(5).lean();
     if (req.session.graphType == null) {
          req.session.graphType = "total";
     }
     try {
          var ADMIN;
          if (req.session.admin) {
          } else {
               ADMIN = null;
          }
          // createAdmin('adarsh','adarshjithu10@gmail.com','123');
          var totalSales;
          var productsCount;
          var totalRevenue;
          var userCount;
          var sales;
          var label;
          var type;

          if (req.session.graphType == "total") {
               //---------------------------TOTAL SALES--------------------------------
               //totalSales
               const total = await orderCollection.aggregate([
                    {
                         $group: {
                              _id: null,
                              total: { $sum: "$total" },
                              productCount: { $sum: "$productsCount" },
                         },
                    },
               ]);
               //total sales productcount total revenue
               totalSales = total[0].total;
               //total sales
               productsCount = total[0].productCount;
               //products count
               totalRevenue = Math.floor((total[0].total * 30) / 100);
               //total users
               type = "Total";
               //type
               const users = await UserCollection.find({});
               userCount = users.length;
               sales = JSON.stringify([totalSales]);
               label = JSON.stringify(["totalsales"]);

               //total items sold
          }
          ///--------------------------------------DAILY SALES-------------------------------------
          if (req.session.graphType == "daily") {
               const today = new Date().toDateString();
               let total = await orderCollection.aggregate([
                    { $match: { orderedAt: today } },
                    {
                         $group: {
                              _id: null,
                              total: { $sum: "$total" },
                              productCount: { $sum: "$productsCount" },
                         },
                    },
               ]);
               if (total.length == 0) {
                    total = [{ total: 0, productCount: 0 }];
               }
               totalSales = total[0].total;
               //total sales
               productsCount = total[0].productCount;
               totalRevenue = Math.floor((total[0].total * 30) / 100);
               const users = await UserCollection.find({ signupAt: today });
               userCount = users.length;
               type = "Daily";
               sales = JSON.stringify([totalSales]);
               label = JSON.stringify(["Daily Sales"]);
          }

          //----------------------------------CALENDER-------------------------------------------
          if (req.session.graphType == "calender") {
               const today = req.session.graphDate;

               let total = await orderCollection.aggregate([
                    { $match: { orderedAt: today } },
                    {
                         $group: {
                              _id: null,
                              total: { $sum: "$total" },
                              productCount: { $sum: "$productsCount" },
                         },
                    },
               ]);

               if (total.length == 0) {
                    total = [{ total: 0, productCount: 0 }];
               }

               console.log(total);
               totalSales = total[0].total;
               //total sales
               productsCount = total[0].productCount;
               totalRevenue = Math.floor((total[0].total * 30) / 100);
               const users = await UserCollection.find({ signupAt: today });
               userCount = users.length;
               type = today;
               sales = JSON.stringify([totalSales]);
               label = JSON.stringify(["Daily Sales"]);
          }

          //----------------------------------------------------Monthly sales--------------------------

          if (req.session.graphType == "monthly") {
               //      console.log(req.query)
               const monthlySales = await orderCollection.aggregate([
                    {
                         $group: {
                              _id: { $month: { $toDate: "$orderedAt" } },
                              totalSales: { $sum: "$total" },
                         },
                    },
                    {
                         $project: {
                              _id: 0,
                              month: {
                                   $switch: {
                                        branches: [
                                             { case: { $eq: ["$_id", 1] }, then: "January" },
                                             { case: { $eq: ["$_id", 2] }, then: "February" },
                                             { case: { $eq: ["$_id", 3] }, then: "March" },
                                             { case: { $eq: ["$_id", 4] }, then: "April" },
                                             { case: { $eq: ["$_id", 5] }, then: "May" },
                                             { case: { $eq: ["$_id", 6] }, then: "June" },
                                             { case: { $eq: ["$_id", 7] }, then: "July" },
                                             { case: { $eq: ["$_id", 8] }, then: "August" },
                                             { case: { $eq: ["$_id", 9] }, then: "September" },
                                             { case: { $eq: ["$_id", 10] }, then: "October" },
                                             { case: { $eq: ["$_id", 11] }, then: "November" },
                                             { case: { $eq: ["$_id", 12] }, then: "December" },
                                        ],
                                        default: "Invalid Month",
                                   },
                              },
                              totalSales: 1,
                         },
                    },
               ]);
               let s = [];
               let l = [];
               monthlySales.forEach((e) => {
                    s.push(e.totalSales);
                    l.push(e.month);
               });

               console.log(s, l);
               const total = await orderCollection.aggregate([
                    {
                         $group: {
                              _id: null,
                              total: { $sum: "$total" },
                              productCount: { $sum: "$productsCount" },
                         },
                    },
               ]);

               // //total sales productcount total revenue
               totalSales = total[0].total;
               // //total sales
               productsCount = total[0].productCount;
               // //products count
               totalRevenue = Math.floor((total[0].total * 30) / 100);
               //total users
               type = "Monthly";
               //type
               const users = await UserCollection.find({});
               userCount = users.length;
               sales = JSON.stringify([...s]);
               label = JSON.stringify([...l]);
          }

          //----------------------------------------------------Weekly sales--------------------------

          if (req.session.graphType == "weekly") {
               let weeklySales = await orderCollection.aggregate([
                    {
                         $group: {
                              _id: { $week: { $toDate: "$orderedAt" } },
                              totalSales: { $sum: "$total" },
                         },
                    },
                    {
                         $sort: { _id: 1 },
                    },
               ]);

               console.log(weeklySales);

               let s = [];
               let l = [];
               weeklySales.forEach((e) => {
                    s.push(e.totalSales);
                    l.push(e._id);
               });

               const total = await orderCollection.aggregate([
                    {
                         $group: {
                              _id: null,
                              total: { $sum: "$total" },
                              productCount: { $sum: "$productsCount" },
                         },
                    },
               ]);

               // //total sales productcount total revenue
               totalSales = total[0].total;
               // //total sales
               productsCount = total[0].productCount;
               // //products count
               totalRevenue = Math.floor((total[0].total * 30) / 100);
               //total users
               type = "Weeklyh";
               //type
               const users = await UserCollection.find({});
               userCount = users.length;
               sales = JSON.stringify([...s]);
               label = JSON.stringify([...l]);
          }

          res.render("admin/home", { admin: req.session.admin.name, totalSales, productsCount, totalRevenue, userCount, sales, label, type, orders });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});
// ----------------------------------adminloginpage--------------------------------------------

const adminLogin = asyncHandler((req, res) => {
     try {
          if (req.session.admin) {
               res.redirect("/admin");
          } else {
               res.render("admin/login");
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// ----------------------------------adminLoginPost-------------------------------------

const adminLoginPost = asyncHandler(async (req, res) => {
     try {
          const admin = await Admin.findOne({ email: req.query.email });
          if (admin && (await admin.isPasswordMatched(req.query.password))) {
               req.session.admin = admin;

               req.session.admin.name = req.session.admin.name.charAt(0).toUpperCase() + req.session.admin.name.slice(1);
               res.json({success:true});
          } else {
               res.json({success:false});
          }
     } catch (error) {
          throw new Error(error.message);
     }
});

// ----------------------------adminlogout-----------------------------------------

const adminLogout = (req, res) => {
     req.session.admin = null;
     res.redirect("/admin");
};

// --------------------------------adminCustomers-------------------------------------

const adminCustomers = asyncHandler(async (req, res) => {
     try {
          const customers = await UserCollection.find().lean();

          res.render("admin/customers", { admin: req.session.admin.name, customers });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// ---------------------------------adminviewproducts--------------------------

const adminViewProducts = asyncHandler(async (req, res) => {
     try {
          await productCollection.updateMany(
               { quantity: 0 },
               {
                    $set: {
                         status: "Out Of Stock",
                    },
               }
          );
          await productCollection.updateMany(
               { quantity: { $gt: 0, $lt: 6 } },
               {
                    $set: {
                         status: "Low Of Stock",
                    },
               }
          );
          await productCollection.updateMany(
               { quantity: { $gt: 5 } },
               {
                    $set: {
                         status: "Published",
                    },
               }
          );

          const products = await productCollection.find({}).sort({ addedAt: -1 }).lean();
          const Products = products.map((e) => {
               if (e.status == "Published") {
                    e.isPublished = true;
               }
               if (e.status == "Out of stock") {
                    e.isOutOfStock = true;
               }
               if (e.status == "Low of stock") {
                    e.isLowOfStock = true;
               }
               if (e.status == "Published") {
                    e.isPublished = true;
               }
               if (e.status == "Draft") {
                    e.isDraft = true;
               }

               return e;
          });

          if (products) {
               res.render("admin/viewProducts", { admin: req.session.admin.name, Products });
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// -------------------------blockuser------------------------------------------

const adminBlockUser = asyncHandler(async (req, res) => {
     try {
          const data = await UserCollection.findOne({ _id: req.params.id });
          if (data.isActive) {
               let user = await UserCollection.findOneAndUpdate({ _id: req.params.id }, { isActive: false });
          } else {
               let user = await UserCollection.findOneAndUpdate({ _id: req.params.id }, { isActive: true });
          }
          res.redirect("/admin/customers");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});
// --------------------------------------admin view products--------------------------

const adminAddProduct = asyncHandler(async (req, res) => {
     try {
          const category = await categoryCollection.find({}).lean();
          const productoffer = await offerCollection.findOne({ productOffers: { $exists: true } });
          const offer = productoffer.productOffers;

          res.render("admin/add-product", { category, offer });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});
// -------------------------------------admin addproduct post-------------------------------
const adminAddProductPost = asyncHandler(async (req, res) => {
    
     let images = req.files.map((e)=>{
           return e.filename;
     })

     let IMG = images[0];
     subIMG=[];
    if(images.length>0){
       images.shift()
       subIMG=[...images]
    }
     console.log(images)
     //converting seasonal offer discount into Number from string
     req.body.offerDiscount = parseInt(req.body.offerDiscount);
     req.body.discount = parseInt(req.body.discount);
     req.body.price = parseInt(req.body.price);

     console.log(req.body);
     const seasonalDiscount = parseInt((req.body.price * req.body.offerDiscount) / 100);
     const normalDiscount = parseInt(req.body.discount);
     const totalDiscount = seasonalDiscount + normalDiscount;
     const discountedPrice = req.body.price - totalDiscount;

     try {
          

          const productsObj = {
               name: req.body.name,
               price: req.body.price,
               description: req.body.description,
               discount: req.body.discount,
               status: req.body.status,
               quantity: req.body.quantity,
               category: req.body.category,
               image: IMG,
               offerDiscount: req.body.offerDiscount,
               offerType: req.body.offerType,
               discountedPrice: discountedPrice,
               totalDiscount: totalDiscount,
               subImage:images
          };

          console.log(productsObj);

          let products = await productCollection.create(productsObj);
          if (products) {
               res.redirect("/admin/add-product");
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// ----------------------------------------admin delete product-------------------------------

const adminDeleteProduct = asyncHandler(async (req, res) => {
     try {

          await cartCollection.updateMany({},{
               $pull:{
                    products:{item:req.params.id}
               }
          })
          console.log(req.params.id);
          await productCollection.findOneAndDelete({ _id: req.params.id });
          res.redirect("/admin/view_products");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// ----------------------------------------------view product category------------------------------

const adminViewProductCategoryVise = asyncHandler(async (req, res) => {
     try {
          if (req.query.id == "Listed") {
               const Products = await productCollection.find({ unlist: true }).lean();

               res.render("admin/viewProducts", { admin: req.session.admin, Products });
          } else if (req.query.id == "Unlisted") {
               const Products = await productCollection.find({ unlist: false }).lean();

               res.render("admin/viewProducts", { admin: req.session.admin, Products });
          } else {
               const Products = await productCollection.find({ status: req.query.id }).lean();

               res.render("admin/viewProducts", { admin: req.session.admin, Products });
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// -----------------------------------------------edit product----------------------------------
const adminEditProduct = asyncHandler(async (req, res) => {
     try {
          const category = await categoryCollection.find({}).lean();
          const products = await productCollection.findById({ _id: req.query.id }).lean();
          res.render("admin/edit-product", { products, category });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// ------------------------------------------edit product post-------------------------------------
const adminEditProductPost = asyncHandler(async (req, res) => {
     console.log(req.body, req.query.id);

     try {
          req.body.category = req.body.category[0];
          req.body.status = req.body.status[0];
          req.body.quantity = req.body.quantity[0];
          console.log(req.body);

          var convertDiscount = (parseInt(req.body.price) * parseInt(req.body.offerDiscount)) / 100 + parseInt(req.body.discount);
          var totalDiscount = Math.floor(convertDiscount);
          req.body.totalDiscount = totalDiscount;
          req.body.discountedPrice = parseInt(req.body.price) - totalDiscount;

          const products = await productCollection.findByIdAndUpdate({ _id: req.query.id }, req.body);
          res.redirect("/admin/view_products");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// --------------------------------------------change image------------------------------------

const changeImage = asyncHandler(async (req, res) => {
     try {
          let changeProduct = await productCollection.findByIdAndUpdate({ _id: req.query.id }, { image: req.file.filename });
          if (changeProduct) {
               res.redirect("/admin/view_products");
          }
     } catch (error) {
          console.log(error);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// -------------------------------------------add category---------------------------

const adminAddCategory = asyncHandler(async (req, res) => {
     try {
          res.render("admin/add-category");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// -------------------------------------add category post----------------------------------
const adminAddCategoryPost = asyncHandler(async (req, res) => {
     try {
          const categoryObj = {
               image: req.file.filename,
               category: req.body.category,
               description: req.body.description,
          };
          const cat = await categoryCollection.findOne({ category: req.body.category });
          if (cat) {
               res.render("admin/add-category", { error: true });
          } else {
               const data = await categoryCollection.create(categoryObj);
               if (data) {
                    res.redirect("/admin/view-category");
               }
          }
     } catch (error) {
          console.log(error.message);
     }
});

// ----------------------------------------admin view category---------------------------
const adminViewCategory = asyncHandler(async (req, res) => {
     try {
          const data = await categoryCollection.find().sort({_id:-1}).lean();

          res.render("admin/view-category", { data });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// ------------------------------------------deletecategory-------------------------------

const deleteCategory = asyncHandler(async (req, res) => {
     try {
          await categoryCollection.findOneAndDelete({ _id: req.params.id });
          res.redirect("/admin/view-category");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// -------------------------------------------------edit-category----------------------------

const editCategory = asyncHandler(async (req, res) => {
     try {
          const category = await categoryCollection.findById({ _id: req.query.id }).lean();

          res.render("admin/edit-category", { category });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// ----------------------------------------editCategory post--------------------------------------

const editCategoryPost = asyncHandler(async (req, res) => {
     try {
          console.log(req.body.category);
          const cat = await categoryCollection.findOne({ category: req.body.category });
          if (cat) {
               const category = await categoryCollection.findById({ _id: req.query.id }).lean();

               res.render("admin/edit-category", { category, error: true });
          } else {
               let updatedCategory = await categoryCollection.findOneAndUpdate({ _id: req.query.id }, req.body);
               if (updatedCategory) {
                    res.redirect("/admin/view-category");
               }
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// -------------------------------------edit-category image------------------------------------

const editCategoryImage = asyncHandler(async (req, res) => {
     try {
          const result = await categoryCollection.findOneAndUpdate({ _id: req.query.id }, { image: req.file.filename });
          if (result) {
               res.redirect("/admin/view-category");
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});
// --------------------------------------cateogory chart----------------------------------

const categoryChartControler = asyncHandler(async (req, res) => {
     console.log("called");
     const orders = await orderCollection.find({});
     const products = orders.map((e) => {
          return e.products;
     });
     const category = [];
     products.forEach((e) => {
          e.forEach((ele) => {
               category.push(ele.product.category);
          });
     });

     var fr = category.map((e) => {
          return -1;
     });

     for (i = 0; i < category.length; i++) {
          let count = 1;
          for (j = i + 1; j < category.length; j++) {
               if (i != j) {
                    if (category[i] == category[j]) {
                         fr[j] = 0;
                         count++;
                    }
               }
          }

          if (fr[i] !== 0) {
               fr[i] = count;
          }
     }

     const categories = [];
     const totalSales = [];
     fr.forEach((e, i) => {
          if (e !== 0) {
               categories.push(category[i]);
               totalSales.push(e);
          }
     });

     console.log(categories, totalSales);
     res.json({ categoryDetails: categories, sales: totalSales });
});

// --------------------------------------change saleschart---------------------------------
const ChangeSalesChart = asyncHandler(async (req, res) => {
     const dt = new Date().toDateString();

     if (req.query.id == "Daily") {
          console.log(req.query.id);
          var total;
          var category;
          var productCount;
          var userCount;
          category = ["Total", "Profit"];

          //creating today

          //finding totalOrders in a day-----------------------------------------------------------

          const orders = await orderCollection.aggregate([
               {
                    $match: {
                         orderedAt: dt,
                    },
               },
               {
                    $group: {
                         _id: null,
                         totalSales: { $sum: "$total" },
                         productCount: { $sum: "$productsCount" },
                    },
               },
          ]);

          const profit = (orders[0].totalSales * 30) / 100;

          total = [orders[0].totalSales, profit];

          const user = await UserCollection.find({ signupAt: dt });

          var users = 1;
          console.log(total);
          res.json({ total: total, category: category, profit: profit, users: users });
     }
});

//admin  offers-------------------------------------------------------------------------------

const adminOfferControler = asyncHandler(async (req, res) => {
     const category = await categoryCollection.find({}).lean();
     const productoffer = await offerCollection.findOne({ productOffers: { $exists: true } });
     const referaloffer = productoffer.referalOffer;
     const offer = productoffer.productOffers;
     res.render("admin/offers", { offer, category, referaloffer });
});

//banner------------------------------------------------------------------

const bannerControler = asyncHandler(async (req, res) => {
     try {
          const banner = await bannerCollection.findOne({}).lean();
          console.log(banner);

          res.render("admin/banner", { banner });
     } catch (error) {
          console.log(error.message);
     }
});
const bannerControlerPost = asyncHandler(async (req, res) => {
     var image = req.file.filename;
     if (req.body.type == 1) {
          await bannerCollection.updateOne(
               {},
               {
                    $set: {
                         image1: req.file.filename,
                    },
               },
               { upsert: true }
          );
     } else {
          await bannerCollection.updateOne(
               {},
               {
                    $set: {
                         image2: req.file.filename,
                    },
               },
               { upsert: true }
          );
     }
     res.redirect("/admin/banner");
});

//delete banner-----------------------------------------------------------------------

const deleteBanner = asyncHandler(async (req, res) => {
     var src =
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA6wMBIgACEQEDEQH/xAAbAAEBAQEBAQEBAAAAAAAAAAAAAQQFBgMCB//EADoQAAIBAgIGBAwGAwEAAAAAAAABAgMEBRESFSFBUZIxU3LBExQiMjNUYnGBkdHhNEJhc6GxNVJjI//EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD+glAAEKRAMiggFAAAjKRgCkKAIUAAAABCgCFAAEKBEAGAKRFAAAAQpAKAABCkAMIMICgACIMpGAC6BuC6AKAAIUbzVb4dc11nGGhH/aYGQHdoYRRg86snUlw6Ecm9o+L3M6aWST2e4D4kZQBEUACbwTeVgCkRQAAAEKQCgAAQpADCDCAoAAABJyeUU5fogJuC6DdQwq5rZNpUo8ZdPyOlb4Vb0cnPOrLjLo+QHDpUKtZ5UoSl+qWw6Nvg8nk69TJcInSrXNvaxynOMcvyrp+RzrjGc/Jt6bXtT+gHQo2lvbLShCKe+Uuk+VxidvR2JupL2fqcOvcV7iWdWo5Lhu+XQfMDt2GJSubnwc4KEWvJW/NHzx2hnGnXju8mXccqjV8FVhUXnRkn8D0taEbq0lHdUjs7gPMANNPKXnLYwAAAH53lZN5+gIikKAAAAhSAUAACFAEYQYQA+1C1r18vBU3ov8z2I+R2cCr6VKVCT2wekvcwJb4NHZ4xPP2Ym+NK3tIZxUKa4sx4td3Fs4xpKMYyXntZs41SrUqvOpOU37TA9XFppNdDPhcUJ1nsrzhHhDI/Wk42uktjUM18jirGLtpej5PuBt1LS31qjY1LR62Zi1tecafJ9ya4u+NPk+4G3UlHrZ/wNSUetn/Bj1xd8afJ9xre7/58n3A2alo9bU/g321FW9GNNSclHobOJri740+T7jXF3xp8n3A6FbCqVatOo5zi5PNpHz1LR62Zj1vd/wDPk+5pw7ELi4ulTq6Oi4t7I5d4GbErGFpCEoTlJye8wnZx/wBFR7TOMBAUjAIpCgAAAIUgFJmAAAAAAADTh1bwF3Cf5X5MvczMPcB6LFqPhrOTSzlDykee4HpMOreMWUJS2tLKXwOBd0fF7mpT3Rea9wHopfg3+13Hlo9CPUz/AAb/AGu48svN+GwDtWeEwdJTuc3JrNRTyyM2JWCtcqlNtwbyye461ld0q9GLjJaSSzjn0GDGrqnKn4vCSlJvOWW7IDkFIfqEJTnGEFnKTySAKEpQlNRbjDLSfDM/J6S2soUbTwEkpaSem+LOLq+6dWUI029F5ZvYgMpuwb/ILsswtbjdgv49dlga8f8AQ0u13HGO1j6/8aXa7jigAAAKQAUEADMAAAUACFIACDCApMigDp4HW0a06LeySzXvP3j1DZCult82XcculUdGtCrHpg8z0leEbq1lFbYzj5L/AKAsvwb/AGu48vHzUeommrOSayapvP5Hl49CAo3PLoX6H6pU51akadNZyl0I9FaWVO3ouDSlKS8tvf8AYDzR2cGtNCPjFRbZeanuXE/c8Hp+MRnCWjTzzlD6HSyy6AKTaUAeZxGl4G8qRS8lvSXxPrg2y/XZZpx6l6KquLi/7Rmwb/IR7DA2Y/6Gl2u44x2cf9DS7XccUAAABSFAgKAICkAoBAKQpADCDCAoBAHuO9gtfwlr4N9NN5fDccE2YTW8DeJN+TNaL7gO/cfh6vYf9Hk92f6Hrpx06coPZmmszlakj6zLlAYfVsbSnm60XUl50tF/I2aytOuXK/oZNSR9Ylyoakj6zLlA16ytOuXK/oNZWnXLlf0MmpI+sy5RqSPrMuUDXrK065cr+g1ladcuV/Qyakj6zLlGpI+sy5QP3f3dpcWk6caqcss47H0mDBXnfx7LNmpI+sy5T7WmGxtayqqq5NJrJoD5Y/6Gl2u44p2sf9FR7XccYCBgMAUhQAAAEKQCgEApCkAMIMICkKQAXPJ5rcCMDfre64w5Rre64w5TAVAbtbXfsco1tdcafKYC5oDdre69jlGtrv2OUwFA3a2uuMOUa3uvY5TAAN+trv2OUa3uuMOUwFA+91eVrtRVXLKLzWSPgQAAAAKQoAAACAAUmQAFAIBQQAUEAFBAAKiACkyAAoIAKCACggAoIAGRSACghQAIAKQAAAAKQAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAIAAAAA//2Q==";
     if (req.query.id == 1) {
          await bannerCollection.updateOne(
               {},
               {
                    $set: {
                         image1: "",
                    },
               }
          );
     }
     if (req.query.id == 2) {
          await bannerCollection.updateOne(
               {},
               {
                    $set: {
                         image2: "",
                    },
               }
          );
     }
     res.redirect("/admin/banner");
});

//admin change graph--------------------------------------------------------------------

const adminChangeGraph = asyncHandler(async (req, res) => {
     req.session.graphDate = new Date(req.query.graphDate).toDateString();

     req.session.graphType = req.query.type;
     res.redirect("/admin");
});

//------------------------------------------------transaction----------------------------------

const transaction = asyncHandler(async (req, res) => {
     try {
          const payments = await orderCollection.find({}).lean();

         

          res.render("admin/trasaction", { payments });
     } catch (error) {
          console.log(error.message);
     }
});
//-------------------------------------------downloadsalesreport ----------------------------------

const downloadSalesReportControler = asyncHandler(async (req, res) => {
     let startDate = req.body.startDate;
     let endDate = req.body.endDate;
     let start = new Date(startDate);
     let end = new Date(endDate);
     if (start > end) {
          res.redirect("/admin");
     }

     let users = await userCollection.aggregate([
          ////finding all the user details
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$signupAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: start,
                         $lte: end,
                    },
               },
          },
     ]);
     let user = users.length;

     let order = await orderCollection.aggregate([
          ////finding all the total details
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: start,
                         $lte: end,
                    },
               },
          },
          {
               $group: {
                    _id: null,
                    totalSales: {
                         $sum: "$total",
                    },
                    totalCount: {
                         $sum: 1,
                    },
                    totalProducts: {
                         $sum: "$productsCount",
                    },
               },
          },
     ]);
     let allData = await orderCollection.aggregate([
          //finding all the order informations
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: start,
                         $lte: end,
                    },
               },
          },
          {
               $project: {
                    _id: 1,
                    productsCount: 1,
                    orderedAt: 1,
                    total: 1,
                    status: 1,
                    payment: 1,
                    customer: "$address.firstname",
               },
          },
          {
               $project: {
                    _id: 0,
                    OrderId: "$_id",
                    productsCount: 1,
                    Date: "$orderedAt",
                    Total: "$total",
                    Status: "$status",
                    PaymentType: "$payment",
                    Customer: "$address.firstname",
               },
          },
     ]);

     let totalSales = order[0].totalSales;
     let totalSalesCount = order[0].totalCount;
     let totalProducts = order[0].totalProducts;
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
});

const salesReport = asyncHandler(async (req, res) => {
     let error = JSON.stringify(req.query.error)
     let saleType = "Daily";

     const type = `DAILY SALES REPORT (${new Date().toDateString()})`; //type
     const date = new Date().toDateString();

     let order = await orderCollection.aggregate([
          { $match: { orderedAt: date } }, //total sales
     ]);
     let total = await orderCollection.aggregate([
          { $match: { orderedAt: date } }, //total sales
          {
               $group: {
                    _id: null,
                    total: { $sum: "$total" },
                    productCount: { $sum: "$productsCount" },
               },
          },
     ]);
     if (total.length == 0) {
          total = [{ total: 0, productCount: 0 }];
     }
     totalSales = total[0].total; //total sales
     //type of sales
     console.log(totalSales)

     res.render("admin/salesReport", { order, totalSales, type, date, saleType,error });
});
//----------------------------------------Daily Sales Report -------------------------------

const dailySalesReport = asyncHandler(async (req, res) => {
     let saleType = "Daily";
     const type = `DAILY SALES REPORT (${new Date().toDateString()})`; //type
     const date = new Date().toDateString();

     let order = await orderCollection.aggregate([
          { $match: { orderedAt: date } }, //total sales
     ]);
     let total = await orderCollection.aggregate([
          { $match: { orderedAt: date } }, //total sales
          {
               $group: {
                    _id: null,
                    total: { $sum: "$total" },
                    productCount: { $sum: "$productsCount" },
               },
          },
     ]);
     if (total.length == 0) {
          total = [{ total: 0, productCount: 0 }];
     }
     totalSales = total[0].total; //total sales
     //type of sales

     res.render("admin/salesReport", { order, totalSales, type, date, saleType });
});

//--------------------weekly sales report---------------------------------------------

const weeklySalesReport = asyncHandler(async (req, res) => {
     var startOfWeek = new Date();
     var startOfWeek = new Date(); //startdate of current week
     startOfWeek.setHours(0, 0, 0, 0);
     startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
     let startDate = new Date().toDateString();
     let saleType = "Weekly";
     var endOfWeek = new Date(); //end of the week
     endOfWeek.setHours(23, 59, 59, 999);
     endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
     let end = endOfWeek.toDateString();
     const type = `WEEKLY SALES REPORT (${startDate} to ${end})`;

     let order = await orderCollection.aggregate([
          //finding all the order informations
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startOfWeek,
                         $lte: endOfWeek,
                    },
               },
          },
     ]);
     let total = await orderCollection.aggregate([
          //finding total
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startOfWeek,
                         $lte: endOfWeek,
                    },
               },
          },
          {
               $group: {
                    _id: null,
                    total: {
                         $sum: "$total",
                    },
               },
          },
     ]);

     let totalSales = total[0].total; //finding total sales
     res.render("admin/salesReport", { order, totalSales, type, saleType });
});

//--------------------------------------Monthly Sales --------------------------------------

const monthlySales = asyncHandler(async (req, res) => {
     var startOfMonth = new Date();
     var startOfMonth = new Date(); //month start Date
     startOfMonth.setHours(0, 0, 0, 0);
     startOfMonth.setDate(1);
     let saleType = "Monthly";
     var endOfMonth = new Date(); //Month end date
     endOfMonth.setHours(23, 59, 59, 999);
     endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

     let startDate = new Date().toDateString(); //now date

     let end = endOfMonth.toDateString();
     const type = `MONTHLY SALES REPORT (${startDate} to ${end})`; //type of sales
     let order = await orderCollection.aggregate([
          //finding all the order informations
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startOfMonth,
                         $lte: endOfMonth,
                    },
               },
          },
     ]);
     let total = await orderCollection.aggregate([
          //finding total
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startOfMonth,
                         $lte: endOfMonth,
                    },
               },
          },
          {
               $group: {
                    _id: null,
                    total: {
                         $sum: "$total",
                    },
               },
          },
     ]);

     let totalSales = total[0].total; //finding total sales
     console.log(totalSales)

     res.render("admin/salesReport", { order, totalSales, type, saleType });
});

//-------------customSales report ----------------------------------------------------------

const customSalesReport = asyncHandler(async (req, res) => {
     let startDate = new Date(req.body.startDate); //start date
     let endDate = new Date(req.body.endDate);
     let now = new Date()
     req.session.startDate=startDate;
     req.session.endDate=endDate

     if(startDate>endDate){
          res.redirect("/admin/salesReport?error=true")
     }
     else if(startDate>now||endDate>now){
          res.redirect("/admin/salesReport?error=true")
     }
     let saleType = "Custom";
     let type = `CUSTOM SALES REPORT (${new Date(startDate).toDateString()}to ${new Date(endDate).toDateString()})`;
     let order = await orderCollection.aggregate([
          //finding all the order informations
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startDate,
                         $lte: endDate,
                    },
               },
          },
     ]);
     let total = await orderCollection.aggregate([
          //finding total
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startDate,
                         $lte: endDate,
                    },
               },
          },
          {
               $group: {
                    _id: null,
                    total: {
                         $sum: "$total",
                    },
                    
               },
          },
     ]);

     
     let totalSales = total[0].total; //finding total sales      //enddate

     res.render("admin/salesReport", { totalSales, type, order, saleType }); //page rendering
});

//download sales report pf ------------------------------------------------------------------
const reports = async(allData,total)=>{
    
     const fs = require("fs");
     const PDFDocument = require("pdfkit-table");
   
     // init document
     let doc = new PDFDocument({ margin: 30, size: 'A4' });
     // save document
     doc.pipe(fs.createWriteStream("./document.pdf"));
     ;(async function(){
          // table
          const table = {
            title: "Title",
            subtitle: "Subtitle",
            headers: [
              { label: "productsCount", property: 'productsCount', width: 60, renderer: null },
              { label: "Customer", property: 'customer', width: 80, renderer: null }, 
              { label: "OrderId", property: 'orderId', width: 110, renderer: null }, 
              { label: "Total", property: 'total', width: 100, renderer: null }, 
              { label: "Status", property: 'status', width: 50, renderer: null }, 
              { label: "Date", property: 'date', width: 80, renderer: null }, 
              { label: "Payment", property: 'paymentType', width: 43, 
              renderer:null
              },
 
            ],
            // complex data
            datas: [
              ...allData
            
              // {...},
            ],
            
          };
          // the magic
          doc.table(table, {
               prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
               prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font("Helvetica").fontSize(8);
                    indexColumn === 0 && doc.addBackground(rectRow, 'white', 0.15);
               },
          });
          doc.text("asdfasdf")
          // done!
          doc.end();
        })();
 }
 
 //-----------------------------------download sales report-------------------------------
const downloadSalesReportPdf = asyncHandler(async (req, res) => {
    console.log(req.query)

     if(req.query.saleType == 'Daily'){       //dailysales

          let today = new Date().toDateString()
          let allData = await orderCollection.aggregate([
                //finding all the order informations
                {
                $match:{
                    orderedAt:today
                }
                },
                {$addFields:{
                     orderId:{
                          $toString:'$_id'
                     }
                }}
                ,
                {
                     $project: {
                       products:0,
                       address:0
                     },
                },
               
           ]);
      
          let total = await orderCollection.aggregate([{$match:{orderedAt:today}},{
               $group:{
                    _id:null,
                    total:{
                         $sum:'$total'
                    }
               }
          }])
         
      
     download(allData,res);
  
     }
////weeekly
     else if(req.query.saleType=='Weekly'){
          var startOfWeek = new Date();
     var startOfWeek = new Date(); //startdate of current week
     startOfWeek.setHours(0, 0, 0, 0);
     startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
     let startDate = new Date().toDateString();
     let saleType = "Weekly";
     var endOfWeek = new Date(); //end of the week
     endOfWeek.setHours(23, 59, 59, 999);
     endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
     let end = endOfWeek.toDateString();
  

     let order = await orderCollection.aggregate([
          //finding all the order informations
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startOfWeek,
                         $lte: endOfWeek,
                    },
               },
          },
     ]);
     download(order,res)
     }


     //monthly

    else if(req.query.saleType=='Monthly'){
     var startOfMonth = new Date();
     var startOfMonth = new Date(); //month start Date
     startOfMonth.setHours(0, 0, 0, 0);
     startOfMonth.setDate(1);
     let saleType = "Monthly";
     var endOfMonth = new Date(); //Month end date
     endOfMonth.setHours(23, 59, 59, 999);
     endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

     let startDate = new Date().toDateString(); //now date

     let end = endOfMonth.toDateString();
     const type = `MONTHLY SALES REPORT (${startDate} to ${end})`; //type of sales
     let order = await orderCollection.aggregate([
          //finding all the order informations
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startOfMonth,
                         $lte: endOfMonth,
                    },
               },
          },
     ]);
     download(order,res)}


else if(req.query.saleType=='Custom'){
     let startDate = new Date(req.session.startDate); //start date
     let endDate = new Date(req.session.endDate);
   
     let saleType = "Custom";
     let type = `CUSTOM SALES REPORT (${new Date(startDate).toDateString()}to ${new Date(endDate).toDateString()})`;
     let order = await orderCollection.aggregate([
          //finding all the order informations
          {
               $addFields: {
                    createdAt: {
                         $toDate: "$orderedAt",
                    },
               },
          },
          {
               $match: {
                    createdAt: {
                         $gte: startDate,
                         $lte: endDate,
                    },
               },
          },
     ]);
     res.download(order,res)
}
     
});
// ----------------------------------------download sales report csv-------------------------------

const downloadSalesReportcsv= asyncHandler(async(req,res)=>{

  //----------------------------daily----------------------------------------------
    if (req.query.saleType=='Daily'){
     let today = new Date().toDateString()
     let allData = await orderCollection.aggregate([
           //finding all the order informations
           {
           $match:{
               orderedAt:today
           }
           },
           {$addFields:{
                orderId:{
                     $toString:'$_id'
                }
           }}
           ,
           {
                $project: {
                  products:0,
                  address:0
                },
           },
          
      ]);
   
   


     
     let table = []

     for(let i of allData){
          let row = [];

          
          row.push(i.payment);
          row.push(i.total);
          row.push(i.subtotal);
          row.push(i.discount);
          row.push(i.couponId);
          row.push(i.productsCount);
          row.push(i.status);
          row.push(i.orderedAt);
          table.push(row)
     }

     const { jsPDF } = require('jspdf')
     require('jspdf-autotable')
     
     const doc = new jsPDF()
     doc.autoTable({
       head: [['Payment', 'Total', 'Sub', 'Dis','Coupon','Products','Status','Date']],
       body:table,
     })
     doc.save('table.pdf')
     console.log('./table.pdf generated')

     res.download('table.pdf')
}
//----------------------------weekly----------------------------------------------
     else if(req.query.saleType=='Weekly'){
          var startOfWeek = new Date();
          var startOfWeek = new Date(); //startdate of current week
          startOfWeek.setHours(0, 0, 0, 0);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          let startDate = new Date().toDateString();
          let saleType = "Weekly";
          var endOfWeek = new Date(); //end of the week
          endOfWeek.setHours(23, 59, 59, 999);
          endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
          let end = endOfWeek.toDateString();
       
     
          let allData = await orderCollection.aggregate([
               //finding all the order informations
               {
                    $addFields: {
                         createdAt: {
                              $toDate: "$orderedAt",
                         },
                    },
               },
               {
                    $match: {
                         createdAt: {
                              $gte: startOfWeek,
                              $lte: endOfWeek,
                         },
                    },
               },
          ]);



          
          let table = []

          for(let i of allData){
               let row = [];
     
               
               row.push(i.payment);
               row.push(i.total);
               row.push(i.subtotal);
               row.push(i.discount);
               row.push(i.couponId);
               row.push(i.productsCount);
               row.push(i.status);
               row.push(i.orderedAt);
               table.push(row)
          }
     
          const { jsPDF } = require('jspdf')
          require('jspdf-autotable')
          
          const doc = new jsPDF()
          doc.autoTable({
            head: [['Payment', 'Total', 'Sub', 'Dis','Coupon','Products','Status','Date']],
            body:table,
          })
          doc.save('table.pdf')
          console.log('./table.pdf generated')
     
          res.download('table.pdf')

     }

     //-----------------------------------------monthlySales-----------------------------------

     else if(req.query.saleType=='Monthly'){
          var startOfMonth = new Date();
          var startOfMonth = new Date(); //month start Date
          startOfMonth.setHours(0, 0, 0, 0);
          startOfMonth.setDate(1);
          let saleType = "Monthly";
          var endOfMonth = new Date(); //Month end date
          endOfMonth.setHours(23, 59, 59, 999);
          endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
     
          let startDate = new Date().toDateString(); //now date
     
          let end = endOfMonth.toDateString();
          const type = `MONTHLY SALES REPORT (${startDate} to ${end})`; //type of sales
          let allData = await orderCollection.aggregate([
               //finding all the order informations
               {
                    $addFields: {
                         createdAt: {
                              $toDate: "$orderedAt",
                         },
                    },
               },
               {
                    $match: {
                         createdAt: {
                              $gte: startOfMonth,
                              $lte: endOfMonth,
                         },
                    },
               },
          ]);

          let table = []

          for(let i of allData){
               let row = [];
     
               
               row.push(i.payment);
               row.push(i.total);
               row.push(i.subtotal);
               row.push(i.discount);
               row.push(i.couponId);
               row.push(i.productsCount);
               row.push(i.status);
               row.push(i.orderedAt);
               table.push(row)
          }
     
          const { jsPDF } = require('jspdf')
          require('jspdf-autotable')
          
          const doc = new jsPDF()
          doc.autoTable({
            head: [['Payment', 'Total', 'Sub', 'Dis','Coupon','Products','Status','Date']],
            body:table,
          })
          doc.save('table.pdf')
          console.log('./table.pdf generated')
     
          res.download('table.pdf')
     }
//cutom-------------------------------------------
     else if(req.query.saleType=='Custom'){
          let startDate = new Date(req.session.startDate); //start date
          let endDate = new Date(req.session.endDate);
        
          let saleType = "Custom";
          let type = `CUSTOM SALES REPORT (${new Date(startDate).toDateString()}to ${new Date(endDate).toDateString()})`;
          let allData = await orderCollection.aggregate([
               //finding all the order informations
               {
                    $addFields: {
                         createdAt: {
                              $toDate: "$orderedAt",
                         },
                    },
               },
               {
                    $match: {
                         createdAt: {
                              $gte: startDate,
                              $lte: endDate,
                         },
                    },
               },
          ]);
          let table = []

          for(let i of allData){
               let row = [];
     
               
               row.push(i.payment);
               row.push(i.total);
               row.push(i.subtotal);
               row.push(i.discount);
               row.push(i.couponId);
               row.push(i.productsCount);
               row.push(i.status);
               row.push(i.orderedAt);
               table.push(row)
          }
     
          const { jsPDF } = require('jspdf')
          require('jspdf-autotable')
          
          const doc = new jsPDF()
          doc.autoTable({
            head: [['Payment', 'Total', 'Sub', 'Dis','Coupon','Products','Status','Date']],
            body:table,
          })
          doc.save('table.pdf')
          console.log('./table.pdf generated')
     
          res.download('table.pdf')
     }

})
module.exports = {
     adminHome,
     adminLogin,
     adminLoginPost,
     adminLogout,
     adminCustomers,
     adminViewProducts,
     adminBlockUser,
     adminAddProduct,
     adminAddProductPost,
     adminDeleteProduct,
     adminViewProductCategoryVise,
     adminEditProduct,
     adminEditProductPost,
     changeImage,
     adminAddCategory,
     adminAddCategoryPost,
     adminViewCategory,
     deleteCategory,
     editCategory,
     editCategoryPost,
     editCategoryImage,
     categoryChartControler,
     ChangeSalesChart,
     adminOfferControler,
     bannerControler,
     bannerControlerPost,
     deleteBanner,
     adminChangeGraph,
     transaction,
     downloadSalesReportControler,
     salesReport,
     dailySalesReport,
     weeklySalesReport,
     monthlySales,
     customSalesReport,
     downloadSalesReportPdf,
     downloadSalesReportcsv
};
