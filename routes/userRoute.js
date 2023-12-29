const express = require("express");
const userController = require("../controllers/userController");
const orderController = require('../controllers/orderController')
const couponController = require("../controllers/couponsController")
const user_route = express();
const path = require("path")
const auth = require("../middleware/auth")
// const authGoogle = require("../middleware/authGoogle")
const blocked = require('../middleware/blocked')
const passport = require('passport')

// ===================================================================
user_route.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

user_route.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

user_route.get('/auth/google/success',(req,res)=>{
  let name = req.user.displayName;

  res.send(`Hello ${name}`);
})
user_route.get('/auth/google/failure',(req,res)=>{
  res.send('Something went wrong ! ');
})
// ===================================================================




user_route.get("/register", auth.isLogout, userController.loadRegister)
user_route.post("/register", auth.isLogout, userController.verifyEmail, userController.insertUser)


user_route.get('/verifyOtp', auth.isLogout, userController.loadVerifyOtp)
user_route.post('/verifyOtp', auth.isLogout, userController.verifyOtp)
user_route.get('/resendOtp', auth.isLogout, userController.resendOtp, userController.loadVerifyOtp)
user_route.post('/resendOtp', auth.isLogout, userController.verifyOtp)

user_route.get("/", auth.isLogout, userController.loadHome)
user_route.get("/login", auth.isLogout, userController.loadLogin)
user_route.post("/login", auth.isLogout, userController.verifyLogin)

user_route.get("/home", blocked.isBlocked, userController.loadHome)
user_route.get("/shop", blocked.isBlocked, userController.loadShop)
user_route.get("/cart", auth.isLogin, blocked.isBlocked, userController.loadcart)

user_route.get("/account", auth.isLogin, blocked.isBlocked, userController.loadAccount)
user_route.get("/logout", auth.isLogin, blocked.isBlocked, userController.userLogout)

user_route.get('/productView', blocked.isBlocked, userController.loadProductView)

user_route.post('/api/addtoCart/:prodId', auth.isLogin, blocked.isBlocked, userController.addtoCart)
user_route.post('/inc-dec/:prodId', auth.isLogin, blocked.isBlocked, userController.cartIncreaseDecrease)
user_route.post('/deleteProduct/:prodId', auth.isLogin, blocked.isBlocked, userController.deleteCartProduct)


user_route.post('/editUserData', auth.isLogin, blocked.isBlocked, userController.editUserData)
user_route.post('/updateAddress', auth.isLogin, blocked.isBlocked, userController.updateAddress)
user_route.post('/updateEditedAddress', auth.isLogin, blocked.isBlocked, userController.updateEditedAddress)

user_route.post('/checkCurrPass', auth.isLogin, blocked.isBlocked, userController.checkCurrPass)
user_route.post('/changePass', blocked.isBlocked, userController.changePass)

user_route.post('/addAddress', auth.isLogin, blocked.isBlocked, userController.addAddress)

user_route.get('/forgotPassword', auth.isLogout, userController.forgotPassword)
user_route.post('/forgotPassEmail', auth.isLogout, userController.forgotPassEmail)
user_route.post('/forgetPassCheckOtp', auth.isLogout, userController.forgetPassCheckOtp)

user_route.get('/otpChangepass', auth.isLogout, userController.loadOtpchangepass)

user_route.get('/checkout', auth.isLogin, blocked.isBlocked, orderController.loadCheckout)
user_route.post('/checkout', auth.isLogin, blocked.isBlocked, orderController.placeOrder)
user_route.get('/orderPlaced', auth.isLogin, blocked.isBlocked, orderController.loadOrderPlacedPage)

user_route.get('/myOrders', auth.isLogin, blocked.isBlocked, orderController.loadMyorders)
user_route.get('/orderDetails', auth.isLogin, blocked.isBlocked, orderController.loadOrderDetailsPage)
user_route.post('/cancelOrder', auth.isLogin, blocked.isBlocked, orderController.cancelOrder)

user_route.post('/applyCoupon', auth.isLogin, blocked.isBlocked, couponController.applyCoupon)

user_route.patch('/orders/cancelProdOrder', auth.isLogin, blocked.isBlocked, orderController.cancelProdOrder)

user_route.patch('/addtoWishlist', auth.isLogin, blocked.isBlocked, orderController.addtoWishlist)

user_route.get('/wishlist', auth.isLogin, blocked.isBlocked, userController.loadWishlist)

//verify payment route
user_route.post('/verify_payment', auth.isLogin, blocked.isBlocked, orderController.verifyPaymentFn)

//product return
user_route.post('/return-product', auth.isLogin, blocked.isBlocked, orderController.returnProductFn)

//adding prod review
user_route.post('/add-ProductReview', auth.isLogin, blocked.isBlocked, orderController.addProdReview)


module.exports = user_route;
