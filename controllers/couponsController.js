const UserAddressModel = require("../models/userModel");
const ProductsModel = require("../models/productsModel");
const OrdersModel = require('../models/ordersModel')
const mailer = require("../services/mail");
const bcrypt = require("bcrypt");
const otplib = require("otplib");
const uuid = require('uuid');
const User = UserAddressModel.User;
const Address = UserAddressModel.Address;
const Cart = UserAddressModel.Cart;
const Product = ProductsModel.Product;
const Order = OrdersModel.Order;
const Coupon = OrdersModel.Coupon;


//loading coupons page
const loadCoupons = async (req,res)=>{
  try {
    const coupons = await Coupon.find()

    res.render('admin/coupons',{coupons})
  } catch (error) {
    res.status(404).render('users/404') 
  }
}


//loading add coupons
const loadAddCoupon = async (req, res)=>{
  try {
    res.render('admin/addCoupon')
  } catch (error) {
    res.status(404).render('users/404') 
    
  }
}

//add new coupon
const addCoupon = async ( req,res)=>{
  try {
    const { couponCodeVal , discountVal , validFromDate , validToDate , minSpendVal , couponDescr , maxUserVal} = req.body;

  const coupon = new Coupon({
    code : couponCodeVal,
    discount_amount : discountVal,
    validFrom : validFromDate , 
    validTo : validToDate,
    couponName : couponDescr,
    minimumSpend : minSpendVal,
    maxUsers : maxUserVal
  })
  const newCoupon = await coupon.save();

  res.json({ message: "Coupon Added Successfully" });

} catch (error) {

    res.json({ fmessage: "Unable to add a coupon" });
    res.status(404).render('users/404') 

  }
}


//delete coupon function
const deleteCoupon = async (req,res)=>{
  try {
    const { couponId } = req.body;
    const cart = await Cart.findOne({userId:req.session.user_id})
    
    const deletedCoupon = await Coupon.deleteOne({_id:couponId})
    console.log("deleted"+deletedCoupon);
    
    res.json({ message: "Coupon Deleted Successfully" });
  } catch (error) {
    res.json({ fmessage: "Unable to delete the coupon" });
  }
}


//applying coupon in user checkout page 
const applyCoupon = async (req,res)=>{
  try {
    const {couponCode} = req.body
    const coupon = await Coupon.findOne({code : couponCode})
    const totalAmount = await calculateTotalPrice(req.session.user_id)
  
    if(!coupon){
      return res.json({ noCoupon: "Coupon doesn't exist" });
    }
    if(coupon.validFrom > Date.now()){
      return res.json({validity: "This coupon is inactive."})
    }
    if(coupon.validTo < Date.now()){
      return res.json({validity: "This coupon has expired."})
    }
    if(totalAmount < coupon.minimumSpend ){
      return res.json({message:"Coupon available for purchase above Rs "+coupon.minimumSpend})
    }
    if(coupon.usersUsed.includes(req.session.user_id)){
      return res.json({message:"You already used this coupon"})
    }

    //applying discount
    const discount_amount = totalAmount - coupon.discount_amount
    res.json({discount_amount})
  } catch (error) {
    console.log("Unable to apply coupon");
  }
}

//Total amount calculation of products in cart
const calculateTotalPrice = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId: userId }).populate(
      "products.productId"
    );

    if (!cart) {
      console.log("User does not have a cart.");
    }

    let totalPrice = 0;
    for (const cartProduct of cart.products) {
      const { productId, quantity } = cartProduct;
      const productSubtotal = productId.actualPrice * quantity;
      totalPrice += productSubtotal;
    }

    return totalPrice;
  } catch (error) {
    console.error("Error calculating total price:", error.message);
    return 0;
  }
};

module.exports = {
  loadCoupons,
  loadAddCoupon,
  addCoupon,
  deleteCoupon,
  applyCoupon

}