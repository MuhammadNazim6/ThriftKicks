const express = require("express")
const adminController = require("../controllers/adminController")
const couponController = require("../controllers/couponsController")
const orderController = require('../controllers/orderController')
const admin_route = express()
const authAdmin = require("../middleware/authAdmin")
const upload = require('../multer.js')


admin_route.get("/", authAdmin.isLogout, adminController.loadAdminLogin);
admin_route.post("/" , authAdmin.isLogout, adminController.verifyLogin);

admin_route.get("/dashboard", authAdmin.isLogin, adminController.loadDashboard);

admin_route.get("/users", authAdmin.isLogin, adminController.admDashboard);

admin_route.get("/logout", authAdmin.isLogin, adminController.logout);

admin_route.get("/users/edit-user", authAdmin.isLogin, adminController.editUserload)

//updating user edits
admin_route.post("/users/edit-user", authAdmin.isLogin, adminController.updateUsers)
//blocking user
admin_route.patch("/api/block-user/:userId", authAdmin.isLogin , adminController.blockUser)
admin_route.patch("/api/unblock-user/:userId", authAdmin.isLogin , adminController.unblockUser)

admin_route.post('/api/unlistCat/:catId', authAdmin.isLogin ,adminController.unlistCategory)
admin_route.post('/api/listCat/:catId', authAdmin.isLogin ,adminController.listCategory)

admin_route.post('/api/unlistProd/:prodId', authAdmin.isLogin ,adminController.unlistProduct)
admin_route.post('/api/listProd/:prodId', authAdmin.isLogin,adminController.listProduct)

admin_route.get('/products',authAdmin.isLogin,adminController.loadProducts)

admin_route.get('/products/addProduct',authAdmin.isLogin,adminController.loadAddProduct)
admin_route.post('/products/addProduct',upload.array('image',3),adminController.addProduct)

admin_route.get('/categories',authAdmin.isLogin,adminController.loadCategories)
admin_route.get('/products/addCategory',authAdmin.isLogin,adminController.loadAddCategory)
admin_route.post('/products/addCategory', authAdmin.isLogin,adminController.addCategory)

admin_route.get('/categories/editCategory',authAdmin.isLogin,adminController.loadEditCategory)
admin_route.post('/categories/editCategory', authAdmin.isLogin ,adminController.updateCategory)

admin_route.get('/products/editProduct',authAdmin.isLogin,adminController.loadEditProduct)
admin_route.post('/products/editProduct',upload.array('image',3),adminController.updateProduct)

admin_route.get('/orders', authAdmin.isLogin, adminController.loadOrdersAdmin)

admin_route.get('/manageOrders/:orderId', authAdmin.isLogin, adminController.loadManageOrder)
admin_route.post('/changeOrderStatus', authAdmin.isLogin,adminController.changeOrderStatus)
admin_route.post('/cancelOrder', authAdmin.isLogin ,adminController.cancelOrder)

admin_route.get('/coupons', authAdmin.isLogin , couponController.loadCoupons)
admin_route.get('/coupons/addCoupon', authAdmin.isLogin , couponController.loadAddCoupon)
admin_route.post('/coupons/addCoupon',authAdmin.isLogin , couponController.addCoupon)

admin_route.post('/coupon/delete', authAdmin.isLogin , couponController.deleteCoupon)
admin_route.patch('/orders/changeProdStatus', authAdmin.isLogin ,orderController.changeProdOrderStatus )
admin_route.patch('/orders/cancelProdOrder' ,authAdmin.isLogin , orderController.cancelProdOrder)

module.exports = admin_route; 
