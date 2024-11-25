const asyncHandler = require("express-async-handler");
const offerCollection = require("../models/offerModel");
const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");
const { createReferal } = require("../middlewares/middleware");
const referalCollection = require("../models/referalModel");
const walletCollection = require("../models/walletModel");

// ----------------------------------------productofferget-------------------------------------
const adminProductOfferControler = asyncHandler(async (req, res) => {
     const offerFound = await offerCollection.findOne({});
     console.log(offerFound);
     if (offerFound) {
          await offerCollection.updateOne(
               { productOffers: { $exists: true } },
               {
                    $push: {
                         productOffers: req.body,
                    },
               }
          );
          res.redirect("/admin/offers");
     } else {
          await offerCollection.create({
               productOffers: [req.body],
          });
          res.redirect("/admin/offers");
     }
});

// ----------------------deleteOffer------------------------------------

const deleteProductOffer = asyncHandler(async (req, res) => {
     await offerCollection.updateOne(
          { productOffers: { $exists: true } },
          {
               $pull: { productOffers: { offertype: req.query.id } },
          }
     );
     res.redirect("/admin/offers");
     console.log(req.query.id);
});

// ----------------------------catgoryoffer------------------------------------------

const categoryOffer = asyncHandler(async (req, res) => {
     req.body.discount = parseInt(req.body.discount);
     console.log(req.body.discount);
     //updating product category discount field
     await productCollection.updateMany(
          { category: req.body.category },
          {
               $set: {
                    categoryDiscount: req.body.discount,
               },
          }
     );

     //updating discount of category collection
     await productCollection.updateMany(
          { category: req.body.category },
          {
               $inc: {
                    totalDiscount: req.body.discount,
               },
          }
     );

     //adding categorydiscount and total discount
     // await productCollection.updateMany(
     //      { category: req.body.category },
     //      {
     //           $inc: {
     //                totalDiscount: req.body.discount,
     //           },
     //      }
     // );

     //substracting categorydiscount from discounted price
     await productCollection.updateMany(
          { category: req.body.category },
          {
               $inc: {
                    discountedPrice: `-${req.body.discount}`,
               },
          }
     );

     await categoryCollection.updateOne(
          { category: req.body.category },
          {
               $set: {
                    discount: req.body.discount,
               },
          }
     );
     res.redirect("/admin/offers");
});

// -----------------------------------userOfferControler-------------------------------------

const userOffers = asyncHandler(async (req, res) => {
     const referal = await referalCollection.findOne({ user: req.session.user._id }).lean();

     if (referal) {
          var history = referal.invited ? referal.invited : 0;

          if (history.length == 0 || history.length == null) {
          } else {
               history = history.filter((e) => {
                    if (e.status == true) {
                         e.status = "Redeemed";
                         e.redeem = true;
                    }
                    return e;
               });
               console.log(history);
          }

          var referalCode = referal.referalcode;
          var found = true;
          res.render("profile/referaloffer", { referalCode, found, history, home: true });
     } else {
          res.render("profile/referaloffer", { home: true });
     }
});

// --------------------------------------user refernal bonus_-------------------------------

const referalBonus = asyncHandler(async (req, res) => {
     const referal = await referalCollection.findOne({ user: req.session.user._id });
     if (referal.referalcode) {
          const emailFound = referal.invited.findIndex((e) => e.email == email);
          if (emailFound == -1) {
               var code = referal.referalcode;
               const name = req.query.name;
               const email = req.query.email;
               createReferal(email, code);

               await referalCollection.updateOne(
                    { user: req.session.user._id },
                    {
                         $push: { invited: { name: name, email: email, status: "Pending", amount: 0 } },
                    }
               );
               res.json({ success: true });
          } else {
               res.json({ success: false });
          }
     } else {
          res.json({ success: false });
     }
});

// -----------------------------------------createReferalCode----------------------------------

const createReferalCode = asyncHandler(async (req, res) => {
     const referal = await referalCollection.findOne({ user: req.session.user._id });
     if (referal) {
          res.json({ success: false });
     }
     //referal account doesnt exists
     else {
          ///creating referalcode;
          function getRandomAlphabetString(length) {
               const alphabet = "abcdefghijklmnopqrstuvwxyz";
               let randomString = "";

               for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * alphabet.length);
                    randomString += alphabet[randomIndex];
               }

               return randomString;
          }

          // Example usage
          const randomAlphabetString = getRandomAlphabetString(10).toUpperCase();
          const random = Math.floor(Math.random() * 1000);
          const referalcode = "DIGITYX" + randomAlphabetString + random;
          console.log(referalcode);
          const referalObj = {
               user: req.session.user._id,
               referalcode: referalcode,
          };
          await referalCollection.create(referalObj);
          res.json({ success: true });
     }
});

// --------------------------------------applyreferalcode---------------------------------

const applyReferalCotroler = asyncHandler(async (req, res) => {
     const user = await referalCollection.findOne({ referalcode: req.query.id });
     const offer = await offerCollection.findOne({});
     const discount = parseInt(offer.referalOffer);
     const total = parseInt(req.query.total);
     const id = req.query.id;
     var referaldiscount = parseInt((total * discount) / 100);

     console.log(discount, total, id);
     if (user) {
          var userfound = user.invited.findIndex((e) => e.email == req.session.user.email && e.status == "Pending");
          console.log(userfound);
          if (userfound == -1) {
          } else {
               await referalCollection.updateOne(
                    { referalcode: id, "invited.email": req.session.user.email },
                    {
                         $set: {
                              "invited.$.total": referaldiscount,
                              "invited.$.status": "Active",
                         },
                    }
               );

               res.json({ success: true, amount: referaldiscount });
          }
     }
});

// ----------------------------------admin add referal offer----------------------------------

const adminAddReferalOffer = asyncHandler(async (req, res) => {
     req.body.discount = parseInt(req.body.discount);
     await offerCollection.updateOne(
          {},
          {
               $set: {
                    referalOffer: req.body.discount,
               },
          }
     );
     res.redirect("/admin/offers");
     console.log(req.body);
});

// ----------------offer to wallet-----------------------------------------------

const offerToWallet = asyncHandler(async (req, res) => {

     console.log('referal offer')

     res.json({})
     try {
          const trasactionIdRandom = Math.floor(Math.random() * 10000000);
          const transactionId = "#" + trasactionIdRandom;
          req.query.total = parseInt(req.query.total);
          var id = req.query.id;
          var total = req.query.total;
          var email = req.query.email;
          console.log(typeof total);

          const walletObj = {
               transactionId: transactionId,
               description: "Referal Offer",
               status:'Credit',
               amount: total,
               date: new Date().toDateString(),
          };

          const wallet = await walletCollection.findOne({ user: req.session.user._id });
          if (wallet) {
               await walletCollection.updateOne(
                    { user: req.session.user._id },
                    {
                         $push: {
                              transactions: walletObj,
                         },
                    }
               );
               await walletCollection.updateOne(
                    { user: req.session.user._id },
                    {
                         $inc: {
                              amount: total,
                         },
                    }
               );
               await referalCollection.updateOne(
                    { user: req.session.user, "invited.email": req.session.user.email },
                    {
                         $set: {
                              "invited.$.status": true,
                         },
                    }
               );
               res.redirect("/offer/user-offers");
          } else {
               let wallet = {
                    user: req.session.user._id,
                    amount: total,
                    status:'Credit',
                    transactions: [walletObj],
               };
               await walletCollection.create(wallet);
               await referalCollection.updateOne(
                    { user: req.session.user, "invited.email": req.session.user.email },
                    {
                         $set: {
                              "invited.$.status": true,
                         },
                    }
               );
               res.redirect("/offer/user-offers");
          }
     } catch (error) {
          console.log(error.message);
     }
});

//------------------------------------------------deletecategory offer-----------------------

const deleteCategoryOffer = asyncHandler(async (req, res) => {
     var discount = parseInt(req.query.discount);
     ///deleting category discount in categorycollection
     await categoryCollection.updateOne(
          { category: req.query.category },
          {
               $set: {
                    discount: 0,
               },
          }
     );
     //deleting category discount in productcollection

     await productCollection.updateMany(
          { category: req.query.category },
          {
               $set: {
                    categoryDiscount: 0,
               },
          }
     );
     //incrementing discountedPrice

     await productCollection.updateMany(
          { catgory: req.query.catgory },
          {
               $inc: {
                    discountedPrice: discount,
               },
          }
     );

     //decrementing totaldiscountdatea

     await productCollection.updateMany(
          { category: req.query.category },
          {
               $inc: {
                    totalDiscount: `-${discount}`,
               },
          }
     );

     res.redirect("/admin/offers");
});

module.exports = {
     adminProductOfferControler,
     deleteProductOffer,
     categoryOffer,
     userOffers,
     referalBonus,
     createReferalCode,
     applyReferalCotroler,
     adminAddReferalOffer,
     offerToWallet,
     deleteCategoryOffer,
};
