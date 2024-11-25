const asyncHandler = require("express-async-handler");
const AddressCollection = require("../models/addressModel");
const AccountCollection = require('../models/accountModel');
const walletCollection = require("../models/walletModel")


//profile address------------------------------------------------------------------
const profileAddressControler = asyncHandler(async (req, res) => {
 
     let error = req.query.error
     try {

   
          const address = await AddressCollection.find({ user: req.session.user._id }).lean();
          console.log(address)
          res.render("profile/address", { home: true, address ,error});
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});
//address post---------------------------------------------------------------------------

const profileAddressPostControler = asyncHandler(async (req, res) => {
     req.body.user=req.session.user._id;
     let addressError=''
     try {
         
         let emailexists = await AddressCollection.find({email:req.body.email});
      
         let addressexists = await AddressCollection.find({address:req.body.address});
     //     if(emailexists.length>0){
          
     //      addressError='Email Already Exists'
     //      res.redirect(`/profile/address?error=${addressError}`)
     //     }
         if(addressexists.length>0){
          addressError='Address Already Exists'
          res.redirect(`/profile/address?error=${addressError}`)
         }
       

         else{
         let address = await AddressCollection.find({})
          if(address.length<3){
                    if(address.length==0){
                         req.body.home=true
                    }
                    await AddressCollection.create(req.body);
                    res.redirect("/profile/address")
          }
          else{
               addressError='Maximum 3 Address Allowed'
               res.redirect(`/profile/address?error=${addressError}`)
          }
         }

     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});

//delete address-----------------------------------------------------------------------------

const deleteAddress = asyncHandler(async (req, res) => {
     try {
          await AddressCollection.findOneAndDelete({ user: req.session.user._id, _id: req.query.id });
          res.redirect("/profile/address");
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});

//edit address----------------------------------------------------------------------------------

const editAddress = asyncHandler(async (req, res) => {
     try {
          const address = await AddressCollection.findOne({ _id: req.query.id }).lean();

          var type;
          if (address.addresstype == "home") {
               type = { home: true };
          }
          if (address.addresstype == "work") {
               type = { work: true };
          }
          if (address.addresstype == "address-1") {
               type = { address1: true };
          }
          if (address.addresstype == "address-2") {
               type = { address2: true };
          }

          res.render("profile/edit-address", { home: true, address, type });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});

//edit address post controler----------------------------------------------------------------

const editAddressPost = asyncHandler(async (req, res) => {
   try{

      await AddressCollection.findOneAndUpdate({user:req.session.user._id,_id:req.query.id},req.body);
      res.redirect("/profile/address")
        
        console.log(req.query.id)
        console.log(req.body);
   }
   catch(error){
     console.log(error.message);
     var err = new Error();
     error.statusCode = 400;
     next(err)
   }
});

//account details------------------------------------------------------------------------------
const accountDetails = asyncHandler(async(req,res)=>{
     try{

          const account = await AccountCollection.findOne({user:req.session.user._id}).lean();
         
          res.render("profile/account-details",{home:true,account})
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
   

})

//account details post------------------------------------------------------------------------------

const accountDetailsPost = asyncHandler(async(req,res)=>{
     try{

          const account = req.body;
          account.user=req.session.user._id;
          const accountFind = await AccountCollection.findOne({user:req.session.user._id}).lean();
          if(accountFind){
             console.log('account find')
             await AccountCollection.findOneAndUpdate({user:req.session.user._id},account);
              res.redirect("/profile/account-details")
          }
          else{
                 console.log('accountnot found')
             await AccountCollection.create(account);
             res.redirect("/profile/account-details")
          }
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
   


})

//profile change image--------------------------------------------------------------------------------------------

const profileChangeImage = asyncHandler(async(req,res)=>{
   await AccountCollection.updateOne({user:req.session.user._id},{$set:{image:req.file.filename}})
   res.redirect('/profile/account-details')
})


//profile icon---------------------------------------------------------------------------------

const profileIconControler = asyncHandler(async(req,res)=>{

     const profile =await  AccountCollection.findOne({user:req.session.user._id})
  if(profile==null){
     res.json({image:false,success:false})
  }   
  else{

  
 
   if(profile){

   
   
   if(profile.image){

        res.json({image:profile.image,success:true})
   }
   else{
     
     res.json(
      {image:false,success:false}
     )
   }}}

   
})

//coupon

// wallet----------------------------------------------------------------------------
const walletControler = asyncHandler(async(req,res)=>{
    let user = JSON.stringify(req.session.user._id);
     const wallet =  await walletCollection.findOne({user:req.session.user._id}).sort({"_id":1}).lean();
     let trans= []
    if(wallet){

          trans = wallet.transactions.reverse();
    }
 
    var amount;
    if(wallet){

          amount = wallet.amount;
     }
     else{
          amount=0
     }
     res.render("profile/wallet",{home:true,amount,wallet,trans,user})
}) 

//--------------------------------change address---------------------------------------


const changeAddress = asyncHandler(async(req,res)=>{
console.log(req.query.id)
await AddressCollection.updateOne({$and:[{user:req.session.user._id},{home:true}]},{

     
$set:{
     home:false
}
})
await AddressCollection.updateOne({_id:req.query.id},{
     $set:{
          home:true
     }
})
res.json({})
})

/////////////////////////////////change address=----------------------------------------


const checkoutChangeAddress = asyncHandler(async(req,res)=>{
     // console.log(req.body)
     // console.log(req.session.user._id)
     req.body.user=req.session.user._id;
     let addressError=''

     let emailexists = await AddressCollection.find({email:req.body.email});
      
     let addressexists = await AddressCollection.find({address:req.body.address});
     // if(emailexists.length>0){
      
     //  addressError='Email Already Exists'
     //  res.json({success:false,error:addressError})
     // }
      if(addressexists.length>0){
      addressError='Address Already Exists'
      res.json({success:false,error:addressError})
     }
   

     else{
     let address = await AddressCollection.find({})
      if(address.length<3){
                if(address.length==0){
                     req.body.home=true
                }
                await AddressCollection.create(req.body);
               res.json({success:true})
      }
      else{
           addressError='Maximum 3 Address Allowed'
           res.json({success:false,error:addressError})
      }
     }
     
})


const removeTrans = asyncHandler(async(req,res)=>{
     console.log(req.query)
})
module.exports = { profileAddressControler, profileAddressPostControler, deleteAddress, editAddress,editAddressPost,accountDetails
,accountDetailsPost ,profileChangeImage,profileIconControler,walletControler,changeAddress,checkoutChangeAddress,removeTrans};
