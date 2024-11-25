const cartCollection = require("../models/cartModel");
const asyncHandler = require("express-async-handler");
const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");
const wishlistCollection = require("../models/wishlistModel");

const productsearchControler = asyncHandler(async (req, res) => {
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

          products = await productCollection
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
          let pages = [1];
          let inc = 1;
          for (i = 1; i < productLength; i++) {
               if (i % 8 == 0) {
                    inc++;
                    pages.push(inc);
               }
          }

          const category = await categoryCollection.find({}).lean();
          if (products) {
               res.render("coupon/products", { products, category, user: req.session.user._id, count: count, user: true, pages, page });
          }
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//product category--------------------------------------------------------------------------------
const productCategory = asyncHandler(async (req, res) => {
     req.session.category = req.query.id;
     console.log(req.query.id);

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

          let totalProducts = await productCollection.find({ category: req.query.id });
          products = await productCollection.find({ category: req.query.id }).skip(req.session.skip).limit(8).lean();
          var productLength = totalProducts.length;

          let pages = [1];
          let inc = 1;
          for (i = 1; i < productLength; i++) {
               if (i % 8 == 0) {
                    inc++;
                    pages.push(inc);
               }
          }

          const category = await categoryCollection.find({}).lean();
          if (products) {
               res.render("coupon/products", { products, category, user: req.session.user._id, count: count, user: true, pages, page });
          }
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//all products -----------------------------------------------------------------------------------------
const allProducts = (req, res) => {
     try {
          req.session.category = null;
          res.redirect("/user_products");
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
};

const subImageControler = asyncHandler(async (req, res) => {
     try {
          const SubImagesArray = req.files.map((e) => {
               return e.filename;
          });

          const data = await productCollection.updateOne({ _id: req.query.id }, { $push: { subImage: { $each: [...SubImagesArray] } } });

          const array = req.files;
          res.redirect("/admin/view_products");
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//add sub image----------------------------------------------------------------------------

const addSubImage = asyncHandler(async (req, res) => {
     try {
          res.redirect("/");
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//price filter-----------------------------------------------------------------------------

const priceFilter = asyncHandler(async (req, res) => {
     try {
          var min = parseInt(req.body.min);
          var max = parseInt(req.body.max);
          var cat = req.body.category;

          var count;
          let cartCount = await cartCollection.findOne({ user: req.session.user._id });
          if (cartCount) {
               count = cartCount.products.length;
          } else {
               count = null;
          }

          var product = await productCollection.aggregate([
               { $match: { category: cat } },
               {
                    $group: { _id: null, sum: { $max: "$price" } },
               },
          ]);
          var avg = product[0].sum;
          var minimum = (avg * min) / 100;
          var maximum = (avg * max) / 100;

          var proObj = await productCollection.aggregate([{ $match: { category: cat } }]);

          var products = proObj.filter((e) => {
               if (e.price >= minimum && e.price <= maximum) {
                    return e;
               }
          });

          var category = await categoryCollection.find({}).lean();

          res.render("user/view-products", { products, category, user: req.session.user._id, count: count });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//wishlist----------------------------------------------------------------------------------

const wishList = asyncHandler(async (req, res) => {
     try {
          var wishh = await wishlistCollection.aggregate([
               { $match: { user: req.session.user._id } },
               {
                    $unwind: "$products",
               },
               {
                    $lookup: {
                         from: "products",
                         let: { item: { $toObjectId: "$products" } },
                         pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
                         as: "item",
                    },
               },
               {
                    $project: { user: 1, _id: 1, product: { $arrayElemAt: ["$item", 0] } },
               },
               {
                    $sort: { _id: -1 },
               },
          ]);

          var wish = wishh.reverse();

          res.render("profile/wishlist", { home: true, wish });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});
//add to wishlist-----------------------------------------------------------------------

const addtoWishlist = asyncHandler(async (req, res) => {
     try {
          const proId = req.query.id;
          const user = req.session.user._id;
          const wishlist = await wishlistCollection.findOne({ user: user });
          if (wishlist) {
               const productExist = wishlist.products.includes(proId);
               if (!productExist) {
                    await wishlistCollection.updateOne({ user: user }, { $push: { products: proId } });
                    const wishlistCount = await wishlistCollection.findOne({ user: user });
                    const count = wishlistCount.products.length;
                    res.json({ count: count });
               }
          } else {
               const wishListObj = {
                    user: req.session.user,
                    products: [proId],
               };
               wishlistCollection.create(wishListObj);
               res.json({ success: true });
          }
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

//remove wishlist products-----------------------------------------------------------------

const removeWishlistProduct = asyncHandler(async (req, res) => {
     try {
          const wishlist = await wishlistCollection.findOne({ user: req.session.user._id });
          if (wishlist.products.length <= 1) {
               await wishlistCollection.deleteOne({ user: req.session.user._id });
               res.redirect("/products/wishlist");
          }

          const proId = req.query.id;

          await wishlistCollection.updateOne(
               { user: req.session.user._id },
               {
                    $pull: { products: proId },
               }
          );
          res.redirect("/products/wishlist");
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

//wishlist count-----------------------------------------------------------------------------

const wishListCount = asyncHandler(async (req, res) => {
     try {
          var wishListCount;

          const wishlist = await wishlistCollection.findOne({ user: req.session.user._id });
          console.log(wishlist);

          if (wishlist) {
               wishListCount = wishlist.products.length;
          } else {
               wishListCount = 0;
          }
          res.json({ wishlist: wishListCount });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

//change page----------------------------------------------------------------------------------------

const changePage = asyncHandler(async (req, res) => {
     try {
          req.session.skip = (req.query.pagenumber - 1) * 8;

          req.session.page = parseInt(req.query.pagenumber);

          res.redirect("/user_products");
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

//next page----------------------------------------------------------------------------------------

const nextPage = asyncHandler(async (req, res) => {
     try {
     } catch (error) {}
     const page = parseInt(req.query.page);
     const count = parseInt(req.query.id);
     const pagenumber = req.session.page;
});

//total products-------------------------------------------------------------------------------

const totalProducts = asyncHandler(async (req, res) => {
     const products = await productCollection.find({});

     res.json({ productCount: products.length });
});

//sort////////////////////////////////////////////////

const productsSort = asyncHandler(async (req, res) => {
     var sort = parseInt(req.query.sort);

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

     let allProducts 
     allProducts = await productCollection.find({ category: req.session.category }); //finding all the products for pagination

     if (req.session.category === undefined || req.session.category == null) {
          products = await productCollection.find({}).skip(req.session.skip).limit(8).sort({ price: sort }).lean();
          allProducts = await productCollection.find({});
     } else {
          products = await productCollection.find({ category: req.session.category }).skip(req.session.skip).limit(8).sort({ price: sort }).lean();
     }

     var productLength = allProducts.length; //creating pagination
     let pages = [1];
     let inc = 1;
     for (i = 1; i < productLength; i++) {
          if (i % 8 == 0) {
               inc++;
               pages.push(inc);
          }
     }

     const category = await categoryCollection.find({}).lean();
     if (products) {
          res.render("coupon/products", { products, category, user: req.session.user._id, count: count, user: true, pages, page });
     }
});

//products filter--------------------------------------------------------------------------------

const productsFilter = asyncHandler(async (req, res) => {
     //productfinding
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

     const category = await categoryCollection.find({}).lean();
     if (products) {
          res.render("coupon/products", { products, category, user: req.session.user._id, count: count, user: true, pages, page });
     }
});

//const deleteImage ----------------------------------------------------------------------------

const deleteImage = asyncHandler(async (req, res) => {

     console.log('called',req.query)
   
    console.log(req.query)
     console.log('called')
     if (req.query.type == "main") {
          await productCollection.updateOne(
               { _id: req.query.proId },
               {
                    $unset: { image: 1 },
               }
          );
          res.json({ success: true });
     }

     if (req.query.type == "sub") {
          await productCollection.updateOne(
               { _id: req.query.proId },
               {
                    $pull: {
                         subImage: req.query.image,
                    },
               }
          );
          res.json({ success: true });
     }
});

//unlist---------------------------------------------------------------------------------

const unlistControler = asyncHandler(async (req, res) => {
     var products = await productCollection.findOne({ _id: req.query.id });
     if (products.unlist == false) {
          await productCollection.updateOne(
               { _id: req.query.id },
               {
                    $set: {
                         unlist: true,
                    },
               }
          );
          res.redirect("/admin/view_products");
     } else {
          await productCollection.updateOne(
               { _id: req.query.id },
               {
                    $set: {
                         unlist: false,
                    },
               }
          );
          res.redirect("/admin/view_products");
     }
});
module.exports = {
     productsearchControler,
     productCategory,
     allProducts,
     subImageControler,
     addSubImage,
     priceFilter,
     wishList,
     addtoWishlist,
     removeWishlistProduct,
     wishListCount,
     changePage,
     nextPage,
     totalProducts,
     productsSort,
     productsFilter,
     deleteImage,
     unlistControler,
};
