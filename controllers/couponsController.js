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
    res.render('admin/coupons')
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
    const { couponCodeVal , discountVal , validFromDate , validToDate , minSpendVal , couponDescr , maxUseVal} = req.body;

  console.log(couponCodeVal);
  console.log(discountVal);
  console.log(validFromDate);
  console.log(validToDate);
  console.log(minSpendVal);

  const coupon = new Coupon({
    code : couponCodeVal,
    discount_amount : discountVal,
    validFrom : validFromDate , 
    validTo : validToDate,
    // description : couponDescr,
    minimumSpend : minSpendVal,
    maxUsers : maxUseVal
  })

} catch (error) {
    res.status(404).render('users/404') 

  }
}



module.exports = {
  loadCoupons,
  loadAddCoupon,
  addCoupon

}