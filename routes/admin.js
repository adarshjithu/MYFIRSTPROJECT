const express = require('express');
const {adminHome, adminLogin, adminLoginPost, adminLogout, adminCustomers, adminViewProducts, adminBlockUser, adminAddProduct, adminAddProductPost, adminDeleteProduct, adminViewProductCategoryVise, adminEditProduct, adminEditProductPost, changeImage, adminAddCategory, adminAddCategoryPost, adminViewCategory, deleteCategory, editCategory, editCategoryPost, editCategoryImage, categoryChartControler, ChangeSalesChart, adminOfferControler, bannerControler, bannerControlerPost, deleteBanner, adminChangeGraph, transaction, downloadSalesReportControler, salesReport, dailySalesReport, weeklySalesReport, monthlySales, customSalesReport, downloadSalesReportPdf, downloadSalesReportcsv} = require('../Controler/adminControler');
const { verifyAdmin, adminValidationLoginRules, adminLoginValidationRes } = require('../middlewares/middleware');

const {upload} =  require("../config")
const app = express.Router();
app.get('/',verifyAdmin,adminHome); 
app.get('/login',adminLogin); 
app.get('/logins',
// adminValidationLoginRules,adminLoginValidationRes,
adminLoginPost);
app.get("/logout",verifyAdmin,adminLogout);  
app.get("/customers",verifyAdmin,verifyAdmin,adminCustomers);
app.get("/view_products",verifyAdmin,verifyAdmin,adminViewProducts);
app.get("/block_user/:id",verifyAdmin,adminBlockUser);
app.get('/add-product',verifyAdmin,adminAddProduct); 
app.post('/add-product',upload.array('image',4),adminAddProductPost);
app.get("/delete-product/:id",verifyAdmin,adminDeleteProduct);
app.get('/view-product-category-vise',verifyAdmin,adminViewProductCategoryVise);
app.get("/edit-product",verifyAdmin,adminEditProduct);
app.post("/edit-product",verifyAdmin,adminEditProductPost);
app.post('/change-image',upload.single('image'),changeImage);
app.get("/add-category",verifyAdmin,adminAddCategory)
app.post("/add-category",upload.single('image'),adminAddCategoryPost);
app.get("/view-category",verifyAdmin,adminViewCategory);
app.get('/delete-category/:id',verifyAdmin,deleteCategory);  
app.get('/edit-category',verifyAdmin,editCategory);
app.post('/edit-category',verifyAdmin,editCategoryPost);
app.post("/edit-category-image",upload.single('image'),editCategoryImage);
app.get("/check",(req,res)=>{
    res.render("admin/index") 
})

///hello this is for nginx
app.get("/transaction",transaction)

app.get('/category-chart',categoryChartControler);
app.get("/changeSalesChart",ChangeSalesChart);
app.get("/offers",adminOfferControler);
app.get("/banner",bannerControler)
app.post("/banner",upload.single('image'),bannerControlerPost);
app.get("/bannerDelete",deleteBanner);
app.get("/changeGraph",adminChangeGraph);
app.post("/download-salesreport",downloadSalesReportControler)
app.get("/salesReport",salesReport);
app.get("/dailySales",dailySalesReport);
app.get("/weeklySales",weeklySalesReport);
app.get("/monthlySales",monthlySales);
app.post("/customSalesReport",customSalesReport);
app.get("/downloadSalesReportPdf",downloadSalesReportPdf)
app.get("/downloadSalesReportCsv",downloadSalesReportcsv)

  




module.exports= app;
  







