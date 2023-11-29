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
const Wishlist = UserAddressModel.Wishlist;




//loading checkout page
const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const cartDetails = await Cart.findOne({ userId: userId })
      .populate("userId")
      .populate("products.productId");

    const address = await Address.find({ userId: userId });
    //finding sum of all products in the cart
    let totalAmount = 0;
    cartDetails.products.forEach((product, index) => {
      if (index === 0) {
        totalAmount = 0;
      }
      totalAmount += product.productId.actualPrice * product.quantity;
    });

    //checking if stock exists
    const userQuantity = cartDetails.products.map((prod) => ({
      productId: prod.productId._id,
      quantity: prod.quantity
    }));
    
    const areAvailable = await areQuantitiesAvailable(userQuantity);
    
    if (areAvailable) {
      
      res.render("users/checkout", {
      user: userData,
      cart: cartDetails,
      totalAmount: totalAmount,
      address: address,
    });
    } else {
      console.log('One or more selected products are not available.');
      res.redirect('/cart?nostock=1')
    }

  } catch (error) {
    console.log(error.message);
  }
};


//function for checking if stock is available for checkout
async function areQuantitiesAvailable(products) {
  try {
    const availabilityChecks = await Promise.all(
      products.map(async (product) => {
        const { productId, quantity } = product;

        const dbProduct = await Product.findById(productId);

        if (!dbProduct) {
          console.log(`Product with ID ${productId} not found.`);
          return false;
        }

        return dbProduct.stock >= quantity;
      })
    );

    return availabilityChecks.every((availability) => availability);
  } catch (error) {
    console.error('Error checking quantities availability:', error);
    return false;
  }
}



//generating a unique tracking id
const generateTrackId = async ()=>{
  try {
    const randomUUID = uuid.v4();
    return randomUUID;

  } catch (error) {
    console.log("could not generate tracking id")
    console.log(error.message);
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

//stock adjust function
const stockAdjusted = async (cartProducts)=>{
  for (const elem of cartProducts) {
    try {

      let updatedProduct = await Product.updateOne({ _id: elem.productId },
        {$inc: { stock : -elem.quantity } });

    } catch (error) {
      console.error(`Error fetching product `)
    }
  }
}


//Order placing
const placeOrder = async (req,res)=>{
  try {
    const { paymentSelected , addressSelected , couponId} = req.body;
    const userId = req.session.user_id;
    const userData = await User.findOne({_id:userId})
    const shippingAddress = await Address.findOne({_id:addressSelected})
    const cart = await Cart.findOne({userId:userId})
    const coupon = couponId !== '' ? couponId : 'none';

    let trackId = await generateTrackId()
    let totalAmount = await calculateTotalPrice(userId)
    console.log(couponId);
    
    if(couponId){
      const coupon = await Coupon.findOne({_id:couponId})
      totalAmount = totalAmount - coupon.discount_amount
          //coupon used by adding
          coupon.usersUsed.push(userId)
          await coupon.save()
    }

      const cartProducts = cart.products.map((productItem) => ({
        productId: productItem.productId,
        ProductOrderStatus: "Ordered" ,
        quantity: productItem.quantity,
        "returnOrderStatus.status": "none",
        "returnOrderStatus.reason": "none",
      }));
  
      const order = new Order({
          userId : userId,
          shippingAddress:{
            country: shippingAddress.country,
            fullName: shippingAddress.fullname,
            mobile: shippingAddress.mobile,
            pincode: shippingAddress.pincode,
            city: shippingAddress.city,
            state: shippingAddress.state,
          },
          products : cartProducts,
          OrderStatus: "Pending",
          StatusLevel: 1,
          paymentStatus: "Pending",
          orderDate: new Date(),
          totalAmount: totalAmount ,
          paymentMethod: paymentSelected,
          coupon : coupon,
          trackId : trackId
  
      });
    

    //deleting existing cart
    const deletedCart = await Cart.deleteOne({_id:cart._id})

    //stock adjust function calling
    await stockAdjusted(cartProducts)

      //returning a promise
    const newOrderPlaced = await order.save();
    res.json({ message: "Order Placed successfully" });

console.log('done');
  } catch (error) {
    console.log(error.message);
  }
}



// loading order placed page
const loadOrderPlacedPage = async (req,res)=>{
  try {
    res.render('users/orderPlaced')
  } catch (error) {
    console.log(error.message);
  }
}


//loading my orders
const loadMyorders = async (req,res)=>{
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId)
    const cart = await Cart.findOne({ userId:userId })
    const orders = await Order.find({userId : userId})
    .populate('products.productId')   

    res.render('users/myOrders',{orders , user, cart})
    
  } catch (error) {
    console.log("Couldn't load my orders");
    console.log(error.message)
  }
}
//laoding order placed page
const loadOrderDetailsPage = async (req,res)=>{
  try {
    const orderId = req.query.ordId;
    const order = await Order.findOne({_id : orderId})
    .populate('products.productId')

    res.render('users/orderDetails',{order:order})
  } catch (error) {
    console.log(error.message);
  }
}


//cancel order function
const cancelOrder = async (req,res)=>{
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id:orderId })
    order.OrderStatus = 'Cancelled';
    await order.save();
    res.json({message:"Order has been Cancelled"})


  } catch (error) {
    console.log(error.message);
  }
}

//changing product order status
const changeProdOrderStatus = async ( req, res)=>{
  try {
    const {productId , status , orderId} = req.body
    const order = await Order.findById(orderId)
    const productToUpdate = order.products.find(product => product.productId.toString() === productId);
    productToUpdate.ProductOrderStatus = status

    await order.save();  
    res.json({message:"Product order status changed to "+status})

  } catch (error) {
    console.log("Couldn't change product order status");
  }
}

//cancel product from order
const cancelProdOrder = async (req,res)=>{
  try {
    const {productId , orderId} = req.body
    const order = await Order.findById(orderId)
    const product = await Product.findById(productId)
    const productToUpdate = order.products.find(product => product.productId.toString() === productId);
    productToUpdate.ProductOrderStatus = "Cancelled"
    console.log(order.totalAmount);
    order.totalAmount = order.totalAmount - product.actualPrice
    
    console.log(order.totalAmount);
    console.log(product.actualPrice);
    await order.save();  
    console.log(product.stock);
    console.log(productToUpdate.quantity);
    product.stock = product.stock + productToUpdate.quantity
    console.log(product.stock);
    await product.save();
    console.log("Till here");
    res.json({message:"Product order cancelled"})

  } catch (error) {
    console.log("Could not cancel the product order");
  }
}


//const adding to wishlist
const addtoWishlist  = async (req,res)=>{
  try {
    const {prodId} = req.body
    const user_id = req.session.user_id
    const WListExist = await Wishlist.findOne({ userId: user_id });
    //if no wishlist for user
    if (!WListExist) {
      const wishlist = new Wishlist({
        userId: user_id,
        products: [
          {
            productId: prodId,
          },
        ],
        
      });
      const WlistAdded = await wishlist.save();
      console.log("New wishlist added to user");

      res.json({
        message: "Item added to the wishlist",
      });

    }else{
      const itemExistWl = WListExist.products.find(
        (element) => element.productId.toString() === prodId
      );

      //remove from wishlist
      if(itemExistWl){
      
          const result = await Wishlist.updateOne(
            { userId: user_id },
            { $pull: { products: { productId: prodId } } }
          );
          res.json({
            remMessage:"Item removed"
          })
          
      }else{
        const newItem = {
          productId : prodId
          }
          WListExist.products.push(newItem)
          await WListExist.save()
    
          res.json({
            message: "Item added to the wishlist",
          });
    
        }
    
      }
      
    
  } catch (error) {
    console.log("Unable to add to wishlist");
  }
}



module.exports = {
  loadCheckout,
  placeOrder,
  loadOrderPlacedPage,
  loadMyorders,
  loadOrderDetailsPage,
  cancelOrder,
  changeProdOrderStatus,
  cancelProdOrder,
  addtoWishlist
  



}