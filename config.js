const asyncHandler = require('express-async-handler');
const path = require('path')

const mongoose = require('mongoose');
const multer = require('multer')
 

const connection =asyncHandler(async()=>{
    try{

      await   mongoose.connect(process.env.DBCONNECTION_STRING).then(()=>{
             console.log("database connected")
        })
    
    }
    catch(error){ 
        
        throw new Error("Mongodb Connection Error "+error)
    }



})



///multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){

       
        cb(null,'public/assets/products')
    },
    filename:function(req,file,cb){
        cb(null,Date.now() + '-' +file.originalname)
    }
})

const upload = multer({storage:storage})








module.exports = {connection,upload};