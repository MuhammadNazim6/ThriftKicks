const express = require("express");
const userController = require("../controllers/userController");
const user_route = express();
const path = require("path")
const auth = require("../middleware/auth")

user_route.get('/zoom',userController.showZoom)

user_route.get("/register", auth.isLogout, userController.loadRegister)
user_route.post("/register",userController.verifyEmail,userController.insertUser)


user_route.get('/verifyOtp',auth.isLogout,userController.loadVerifyOtp)
user_route.post('/verifyOtp',userController.verifyOtp)
user_route.get('/resendOtp',auth.isLogout,userController.resendOtp,userController.loadVerifyOtp)
user_route.post('/resendOtp',userController.verifyOtp)

user_route.get("/", auth.isLogout, userController.loadHome)
user_route.get("/login", auth.isLogout, userController.loadLogin)
user_route.post("/login", userController.verifyLogin)

user_route.get("/home", auth.isLogin, userController.loadHome)
user_route.get("/shop", userController.loadShop)
user_route.get("/cart", userController.loadcart)

user_route.get("/account", auth.isLogin, userController.loadAccount)
user_route.get("/logout", auth.isLogin, userController.userLogout)

user_route.get('/productView',userController.loadProductView)

user_route.post('/api/addtoCart/:prodId',userController.addtoCart)
user_route.post('/inc-dec/:prodId',userController.cartIncreaseDecrease)
user_route.post('/deleteProduct/:prodId',userController.deleteCartProduct)

user_route.get('/checkout', auth.isLogin,userController.loadCheckout)

user_route.post('/editUserData',userController.editUserData)
user_route.post('/updateAddress',userController.updateAddress)
user_route.post('/updateEditedAddress',userController.updateEditedAddress)


module.exports = user_route;
