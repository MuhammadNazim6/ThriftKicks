const express = require("express");
const userController = require("../controllers/userController");
const orderController = require('../controllers/orderController')
const user_route = express();
const path = require("path")
const auth = require("../middleware/auth")


user_route.get("/register", auth.isLogout, userController.loadRegister)
user_route.post("/register", auth.isLogout ,userController.verifyEmail,userController.insertUser)


user_route.get('/verifyOtp',auth.isLogout,userController.loadVerifyOtp)
user_route.post('/verifyOtp',auth.isLogout , userController.verifyOtp)
user_route.get('/resendOtp',auth.isLogout,userController.resendOtp,userController.loadVerifyOtp)
user_route.post('/resendOtp',auth.isLogout ,userController.verifyOtp)

user_route.get("/", auth.isLogout, userController.loadHome)
user_route.get("/login", auth.isLogout, userController.loadLogin)
user_route.post("/login",auth.isLogout , userController.verifyLogin)

user_route.get("/home", userController.loadHome)
user_route.get("/shop", userController.loadShop)
user_route.get("/cart", auth.isLogin, userController.loadcart)

user_route.get("/account", auth.isLogin, userController.loadAccount)
user_route.get("/logout", auth.isLogin, userController.userLogout)

user_route.get('/productView',userController.loadProductView)

user_route.post('/api/addtoCart/:prodId',auth.isLogin,userController.addtoCart)
user_route.post('/inc-dec/:prodId', auth.isLogin, userController.cartIncreaseDecrease)
user_route.post('/deleteProduct/:prodId',auth.isLogin, userController.deleteCartProduct)


user_route.post('/editUserData', auth.isLogin, userController.editUserData)
user_route.post('/updateAddress',auth.isLogin, userController.updateAddress)
user_route.post('/updateEditedAddress',auth.isLogin, userController.updateEditedAddress)

user_route.post('/checkCurrPass',auth.isLogin, userController.checkCurrPass)
user_route.post('/changePass',auth.isLogin, userController.changePass)

user_route.post('/addAddress',auth.isLogin,userController.addAddress)

user_route.get('/forgotPassword',auth.isLogout, userController.forgotPassword)
user_route.post('/forgotPassEmail',auth.isLogout ,userController.forgotPassEmail)
user_route.post('/forgetPassCheckOtp',auth.isLogout, userController.forgetPassCheckOtp)

user_route.get('/otpChangepass',auth.isLogin, userController.loadOtpchangepass)

user_route.get('/checkout', auth.isLogin,orderController.loadCheckout)
user_route.post('/checkout',auth.isLogin, orderController.placeOrder)
user_route.get('/orderPlaced', auth.isLogin, orderController.loadOrderPlacedPage)

user_route.get('/orderDetails',auth.isLogin , orderController.loadOrderDetailsPage)
user_route.post('/cancelOrder', auth.isLogin ,orderController.cancelOrder)


module.exports = user_route;
