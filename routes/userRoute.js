const express = require("express");
const userController = require("../controllers/userController");
const user_route = express();
const path = require("path")
const auth = require("../middleware/auth")

user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post("/register", userController.insertUser);

user_route.get("/", auth.isLogout, userController.loadHome);
user_route.get("/login", auth.isLogout, userController.loadLogin);
user_route.post("/login", userController.verifyLogin);

user_route.get("/home", auth.isLogin, userController.loadHome);
user_route.get("/shop", userController.loadShop);
user_route.get("/cart", userController.loadcart);

user_route.get("/account", auth.isLogin, userController.loadAccount);

user_route.get("/logout", auth.isLogin, userController.userLogout);

user_route.get('/productView',userController.loadProductView)

module.exports = user_route;
