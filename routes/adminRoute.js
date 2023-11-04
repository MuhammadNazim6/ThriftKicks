const express = require("express")
const adminController = require("../controllers/adminController")
const admin_route = express()
const authAdmin = require("../middleware/authAdmin")
const upload = require('../multer.js')


admin_route.get("/", authAdmin.isLogout, adminController.loadAdminLogin);
admin_route.post("/", adminController.verifyLogin);

admin_route.get("/dashboard", authAdmin.isLogin, adminController.loadDashboard);

admin_route.get("/users", authAdmin.isLogin, adminController.admDashboard);

admin_route.get("/logout", authAdmin.isLogin, adminController.logout);

admin_route.get("/users/edit-user", authAdmin.isLogin, adminController.editUserload)

//updating user edits
admin_route.post("/users/edit-user", authAdmin.isLogin, adminController.updateUsers)
//blocking user
admin_route.post("/api/block-user/:userId", adminController.blockUser)
admin_route.post("/api/unblock-user/:userId", adminController.unblockUser)

admin_route.post('/api/unlist/:prodId',adminController.unlistProduct)
admin_route.post('/api/list/:prodId',adminController.listProduct)

admin_route.get('/products',authAdmin.isLogin,adminController.loadProducts)

admin_route.get('/products/addProduct',authAdmin.isLogin,adminController.loadAddProduct)
admin_route.post('/products/addProduct',upload.array('image',3),adminController.addProduct)

admin_route.get('/categories',authAdmin.isLogin,adminController.loadCategories)

admin_route.get('/products/addCategory',authAdmin.isLogin,adminController.loadAddCategory)
admin_route.post('/products/addCategory',adminController.addCategory)


admin_route.get('/products/editProduct',authAdmin.isLogin,adminController.loadEditProduct)
admin_route.post('/products/editProduct',upload.array('image',3),adminController.updateProduct)

module.exports = admin_route; 
