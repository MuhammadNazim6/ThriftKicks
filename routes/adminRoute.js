const express = require("express")
const adminController = require("../controllers/adminController")
const couponController = require("../controllers/couponsController")
const orderController = require('../controllers/orderController')
const bannerController = require('../controllers/bannerController.js')
const offerController = require('../controllers/offerController.js')
const admin_route = express()
const authAdmin = require("../middleware/authAdmin")
const upload = require('../multer.js')


admin_route.get("/", authAdmin.isLogout, adminController.loadAdminLogin);
admin_route.post("/", authAdmin.isLogout, adminController.verifyLogin);

admin_route.get("/dashboard", authAdmin.isLogin, adminController.loadDashboard);

admin_route.get("/users", authAdmin.isLogin, adminController.admDashboard);

admin_route.get("/logout", authAdmin.isLogin, adminController.logout);

admin_route.get("/users/edit-user", authAdmin.isLogin, adminController.editUserload)

//updating user edits
admin_route.post("/users/edit-user", authAdmin.isLogin, adminController.updateUsers)
//blocking user
admin_route.patch("/api/block-user/:userId", authAdmin.isLogin, adminController.blockUser)
admin_route.patch("/api/unblock-user/:userId", authAdmin.isLogin, adminController.unblockUser)

admin_route.post('/api/unlistCat/:catId', authAdmin.isLogin, adminController.unlistCategory)
admin_route.post('/api/listCat/:catId', authAdmin.isLogin, adminController.listCategory)

admin_route.post('/api/unlistProd/:prodId', authAdmin.isLogin, adminController.unlistProduct)
admin_route.post('/api/listProd/:prodId', authAdmin.isLogin, adminController.listProduct)

admin_route.get('/products', authAdmin.isLogin, adminController.loadProducts)

admin_route.get('/products/addProduct', authAdmin.isLogin, adminController.loadAddProduct)
admin_route.post('/products/addProduct', upload.array('image', 3), adminController.addProduct)

admin_route.get('/categories', authAdmin.isLogin, adminController.loadCategories)
admin_route.get('/products/addCategory', authAdmin.isLogin, adminController.loadAddCategory)
admin_route.post('/products/addCategory', authAdmin.isLogin, adminController.addCategory)

admin_route.get('/categories/editCategory', authAdmin.isLogin, adminController.loadEditCategory)
admin_route.post('/categories/editCategory', authAdmin.isLogin, adminController.updateCategory)

admin_route.get('/products/editProduct', authAdmin.isLogin, adminController.loadEditProduct)
admin_route.post('/products/editProduct', upload.array('image', 3), adminController.updateProduct)

admin_route.get('/orders', authAdmin.isLogin, adminController.loadOrdersAdmin)

admin_route.get('/manageOrders/:orderId', authAdmin.isLogin, adminController.loadManageOrder)
admin_route.post('/changeOrderStatus', authAdmin.isLogin, adminController.changeOrderStatus)
admin_route.post('/cancelOrder', authAdmin.isLogin, adminController.cancelOrder)

admin_route.get('/coupons', authAdmin.isLogin, couponController.loadCoupons)
admin_route.get('/coupons/addCoupon', authAdmin.isLogin, couponController.loadAddCoupon)
admin_route.post('/coupons/addCoupon', authAdmin.isLogin, couponController.addCoupon)

admin_route.post('/coupon/delete', authAdmin.isLogin, couponController.deleteCoupon)
admin_route.patch('/orders/changeProdStatus', authAdmin.isLogin, orderController.changeProdOrderStatus)
admin_route.patch('/orders/cancelProdOrder', authAdmin.isLogin, orderController.cancelProdOrder)

admin_route.get('/banners', authAdmin.isLogin, bannerController.loadBanners)
admin_route.post('/add-banner', authAdmin.isLogin, upload.single('image'), bannerController.addBanner)
admin_route.patch('/unlistBanner', authAdmin.isLogin, bannerController.unlistBannerFn)
admin_route.patch('/listBanner', authAdmin.isLogin, bannerController.listBannerFn)
admin_route.delete('/deleteBanner', authAdmin.isLogin, bannerController.deleteBannerFn)

admin_route.get('/offers', authAdmin.isLogin, offerController.loadOfferPage)
admin_route.post('/add-offer', authAdmin.isLogin, offerController.addNewOffer)
admin_route.post('/applyOffer-prod', authAdmin.isLogin, offerController.applyOfferToProduct)
admin_route.patch('/remove-prod-offer', authAdmin.isLogin, offerController.removeProdOfferFn)

admin_route.post('/applyOffer-category', authAdmin.isLogin, offerController.applyOfferToCategory)
admin_route.patch('/remove-category-offer', authAdmin.isLogin, offerController.removeCategoryOfferFn)

admin_route.delete('/deleteOffer', authAdmin.isLogin, offerController.deleteOfferFn)

//calculating total sales
admin_route.post('/loadTotalSalesData', authAdmin.isLogin, orderController.calculateTotalSales)
//calculating weekly sales
admin_route.post('/loadWeeklySales', authAdmin.isLogin, orderController.calculateWeeklySales)
admin_route.post('/loadMonthlySales', authAdmin.isLogin, orderController.calculateMonthlySales)
admin_route.post('/loadCategorySales', authAdmin.isLogin, orderController.calculateCategorySales)
admin_route.post('/loadPaymentMethods', authAdmin.isLogin, orderController.paymentMethodsChart)
admin_route.post('/totalUsersCount', authAdmin.isLogin, orderController.totalUsersCount)

//load sales report page
admin_route.get('/salesReport', authAdmin.isLogin, orderController.loadSalesReportPage)
admin_route.post('/loadSalesReportData', authAdmin.isLogin, orderController.viewSalesReportData)
admin_route.post('/downloadSalesData', authAdmin.isLogin, orderController.downloadSalesReportData)

module.exports = admin_route;
