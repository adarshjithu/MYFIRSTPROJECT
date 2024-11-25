const express = require("express");
const {verifyLogin, cropImageMultiple}= require("../middlewares/middleware");
const {productsearchControler, productCategory, allProducts, subImageControler, addSubImage, priceFilter, wishList, addtoWishlist, removeWishlistProduct, wishListCount, changePage, nextPage, totalProducts, productsSort, productsFilter, deleteImage, unlistControler,  } = require("../Controler/productControler");
const { upload } = require("../config");
const { verifyAdmin } = require("../middlewares/middleware");
const app = express.Router(); 

app.post("/search",verifyLogin,productsearchControler);
app.get('/category',productCategory);
app.get("/allproducts",verifyLogin,allProducts);
app.post("/subimage",upload.array('image',4),cropImageMultiple,subImageControler);
app.get("/addSubImage",verifyAdmin,addSubImage);
app.post("/price-filter",verifyLogin,priceFilter);
app.get("/wishlist",verifyLogin,wishList)
app.get("/add-to-wishlist",verifyLogin,addtoWishlist);
app.get("/remove-wishlist-product",verifyLogin,removeWishlistProduct);
app.get('/wishlistcount',verifyLogin,wishListCount)
app.get("/change-page",verifyLogin,changePage)
app.get('/nextpage',verifyLogin,nextPage);
app.get("/totalProducts",verifyLogin,totalProducts);
app.get("/sort",verifyLogin,productsSort);
app.post("/filter",verifyLogin,productsFilter);
app.get("/deleteImage",verifyAdmin,deleteImage);
app.get("/unlist",verifyAdmin,unlistControler)
 



module.exports= app;