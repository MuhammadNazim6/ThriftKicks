const UserAddressModel = require("../models/userModel");
const ProductsModel = require("../models/productsModel");
const OrdersModel = require("../models/ordersModel");
// const mailer = require("../services/mail");
// const bcrypt = require("bcrypt");
// const otplib = require("otplib");
const uuid = require("uuid");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { log } = require("console");
const User = UserAddressModel.User;
const Address = UserAddressModel.Address;
const Cart = UserAddressModel.Cart;
const Product = ProductsModel.Product;
const Order = OrdersModel.Order;
const Coupon = OrdersModel.Coupon;
const Wishlist = UserAddressModel.Wishlist;
// const Rating = ProductsModel.Rating;
var instance = new Razorpay({
  key_id: "rzp_test_hrcgmUAQIlTJWz",
  key_secret: "e6rN7GFxw4rzGXDHyQ9oFGy6",
});

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
      if (product.productId.actualPrice === product.productId.offerPrice) {
        totalAmount += product.productId.actualPrice * product.quantity;
      } else {
        totalAmount += product.productId.offerPrice * product.quantity;
      }
    });

    //sending coupons
    const coupons = await Coupon.find();
    //checking if stock exists
    const userQuantity = cartDetails.products.map((prod) => ({
      productId: prod.productId._id,
      quantity: prod.quantity,
    }));

    const areAvailable = await areQuantitiesAvailable(userQuantity);

    if (areAvailable) {
      res.render("users/checkout", {
        user: userData,
        cart: cartDetails,
        totalAmount: totalAmount,
        address: address,
        coupons,
      });
    } else {
      console.log("One or more selected products are not available.");
      res.redirect("/cart?nostock=1");
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
    console.error("Error checking quantities availability:", error);
    return false;
  }
}

//generating a unique tracking id
const generateTrackId = async () => {
  try {
    const randomUUID = uuid.v4();
    return randomUUID;
  } catch (error) {
    console.log("could not generate tracking id");
    console.log(error.message);
  }
};

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

      if (productId.actualPrice === productId.offerPrice) {
        const productSubtotal = productId.actualPrice * quantity;
        totalPrice += productSubtotal;
      } else {
        const productSubtotal = productId.offerPrice * quantity;
        totalPrice += productSubtotal;
      }
    }

    return totalPrice;
  } catch (error) {
    console.error("Error calculating total price:", error.message);
    return 0;
  }
};

//stock adjust function
const stockAdjusted = async (cartProducts) => {
  for (const elem of cartProducts) {
    try {
      let updatedProduct = await Product.updateOne(
        { _id: elem.productId },
        { $inc: { stock: -elem.quantity } }
      );
    } catch (error) {
      console.error(`Error fetching product `);
    }
  }
};

//Order placing
const placeOrder = async (req, res) => {
  try {
    console.log("Inside place order 1");
    let { paymentSelected, addressSelected, couponId, walletCheckedStatus } =
      req.body;
    console.log("Inside place order 2");
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const shippingAddress = await Address.findOne({ _id: addressSelected });
    const cart = await Cart.findOne({ userId: userId }).populate(
      "products.productId"
    );
    const coupon = couponId || null;
    console.log("Inside place order 3");

    let trackId = await generateTrackId();
    let totalAmount = await calculateTotalPrice(userId);
    console.log(couponId);

    console.log("Inside place order 4");

    if (couponId) {
      console.log("Inside place order inside coupon");

      const coupon = await Coupon.findOne({ _id: couponId });
      totalAmount = totalAmount - coupon.discount_amount;
      //coupon used by adding
      coupon.usersUsed.push(userId);
      await coupon.save();
    }
    console.log("Inside place order after coupon");

    if (walletCheckedStatus) {
      console.log("Here wallet is used " + walletCheckedStatus);
      let walletBalance = userData.wallet.balance;
      if (userData.wallet.balance < totalAmount) {
        console.log("balance less than total amount");

        totalAmount = totalAmount - userData.wallet.balance;
        userData.wallet.balance = 0;
        const walletHistory = {
          type: "Debit",
          amount: walletBalance,
          date: Date.now(),
          reason: "Redeemed for shopping",
        };
        userData.wallet.history.push(walletHistory);
        await userData.save();

        console.log("Userdata saved");
      } else {
        console.log("balance greater than total amount");

        userData.wallet.balance -= totalAmount;

        const walletHistory = {
          type: "Debit",
          amount: totalAmount,
          date: Date.now(),
          reason: "Redeemed for shopping",
        };
        userData.wallet.history.push(walletHistory);

        await userData.save();

        totalAmount = 0;
        paymentSelected = "Wallet";
      }
    }

    const cartProducts = cart.products.map((productItem) => ({
      productId: productItem.productId,
      ProductOrderStatus: "Ordered",
      quantity: productItem.quantity,
      unitPrice:
        productItem.productId.actualPrice === productItem.productId.offerPrice
          ? productItem.productId.actualPrice
          : productItem.productId.offerPrice,
      "returnOrderStatus.status": "none",
      "returnOrderStatus.reason": "none",
    }));
    console.log("Inside place order 5 after cartProducts");

    const order = new Order({
      userId: userId,
      shippingAddress: {
        country: shippingAddress.country,
        fullName: shippingAddress.fullname,
        houseName: shippingAddress.houseName,
        mobile: shippingAddress.mobile,
        pincode: shippingAddress.pincode,
        city: shippingAddress.city,
        state: shippingAddress.state,
      },
      products: cartProducts,
      OrderStatus: "Pending",
      StatusLevel: 1,
      paymentStatus: "Pending",
      orderDate: new Date(),
      totalAmount: totalAmount,
      paymentMethod: paymentSelected,
      coupon: coupon,
      trackId: trackId,
    });

    if (order.paymentMethod === "Wallet") {
      order.paymentStatus = "Paid";
    }
    console.log("Inside place order 5 after Order CReated");

    //deleting existing cart
    const deletedCart = await Cart.deleteOne({ _id: cart._id });

    //stock adjust function calling
    await stockAdjusted(cartProducts);

    //returning a promise
    const newOrderPlaced = await order.save();
    console.log("Inside place order 5 after Order saved");

    if (paymentSelected == "COD" || paymentSelected == "Wallet") {
      res.json({ message: "Order Placed successfully" });
    } else {
      const orderId = newOrderPlaced._id;

      generateRazorpay(orderId, totalAmount)
        .then((response) => {
          res.json({ response, userData });
        })
        .catch((error) => {
          console.error(error);
        });
    }

    console.log("done");
  } catch (error) {
    console.log(error.message);
  }
};

//generate razorpay
const generateRazorpay = (orderId, totalAmount) => {
  return new Promise((resolve, reject) => {
    var options = {
      amount: totalAmount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: orderId,
    };
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.log(err);
      } else {
        console.log("New Order : ", order);
        resolve(order);
      }
    });
  });
};

// loading order placed page
const loadOrderPlacedPage = async (req, res) => {
  try {
    res.render("users/orderPlaced");
  } catch (error) {
    console.log(error.message);
  }
};

//loading my orders
const loadMyorders = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ userId: userId });
    const orders = await Order.find({ userId: userId }).populate(
      "products.productId"
    );

    res.render("users/myOrders", { orders, user, cart });
  } catch (error) {
    console.log("Couldn't load my orders");
    console.log(error.message);
  }
};
//laoding order placed page
const loadOrderDetailsPage = async (req, res) => {
  try {
    const orderId = req.query.ordId;
    const order = await Order.findOne({ _id: orderId })
      .populate("products.productId")
      .populate("coupon");

    res.render("users/orderDetails", { order: order });
  } catch (error) {
    console.log(error.message);
  }
};

//cancel order function
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId });
    order.OrderStatus = "Cancelled";
    await order.save();
    res.json({ message: "Order has been Cancelled" });
  } catch (error) {
    console.log(error.message);
  }
};

//changing product order status
const changeProdOrderStatus = async (req, res) => {
  try {
    const { productId, status, orderId } = req.body;
    const order = await Order.findById(orderId);
    const productToUpdate = order.products.find(
      (product) => product.productId.toString() === productId
    );
    productToUpdate.ProductOrderStatus = status;
    if (status === "Delivered") {
      order.paymentStatus = "Paid";
    }

    await order.save();
    res.json({ message: "Product order status changed to " + status });
  } catch (error) {
    console.log("Couldn't change product order status");
  }
};

//cancel product from order
const cancelProdOrder = async (req, res) => {
  try {
    const { productId, orderId } = req.body;
    const user = await User.findById(req.session.user_id);

    const order = await Order.findById(orderId);
    const product = await Product.findById(productId);
    const productToUpdate = order.products.find(
      (product) => product.productId.toString() === productId
    );
    productToUpdate.ProductOrderStatus = "Cancelled";

    //reducing total order amount
    // so that amount will not go below zero
    if (order.totalAmount >= product.unitPrice * productToUpdate.quantity) {
      order.totalAmount =
        order.totalAmount - product.unitPrice * productToUpdate.quantity;
      await order.save();
      console.log("That");
    } else {
      order.totalAmount = order.totalAmount;
      await order.save();
      console.log("THis");
    }

    //increasing stock of product
    product.stock = product.stock + productToUpdate.quantity;
    await product.save();

    //updating refunded amount in users wallet
    if (order.paymentMethod !== "COD" && order.paymentStatus === "Placed") {
      // if order has a coupon used
      if (order.coupon !== "none") {
        console.log("Using coupon");
        const coupon = await Coupon.findById(order.coupon);

        //if total amount becomes less then minimum coupon required amount
        if (order.totalAmount < coupon.minimumSpend) {
          user.wallet.balance =
            user.wallet.balance +
            (product.actualPrice * productToUpdate.quantity -
              coupon.discount_amount);
          const walletHistory = {
            type: "Credit",
            amount:
              product.actualPrice * productToUpdate.quantity -
              coupon.discount_amount,
            date: Date.now(),
            reason: "Order cancel refund",
          };
          user.wallet.history.push(walletHistory);
          await user.save();

          order.coupon = "none";
          await order.save();
          console.log("Saved None in coupon");
        } else {
          console.log("No using coupon");
          user.wallet.balance =
            user.wallet.balance +
            product.actualPrice * productToUpdate.quantity;
          const walletHistory = {
            type: "Credit",
            amount: product.actualPrice * productToUpdate.quantity,
            date: Date.now(),
            reason: "Order cancel refund",
          };

          user.wallet.history.push(walletHistory);
          await user.save();
        }
      } else {
        //if order doesn't use a coupon
        console.log("No using coupon");
        user.wallet.balance =
          user.wallet.balance + product.actualPrice * productToUpdate.quantity;
        const walletHistory = {
          type: "Credit",
          amount: product.actualPrice * productToUpdate.quantity,
          date: Date.now(),
          reason: "Order cancel refund",
        };

        user.wallet.history.push(walletHistory);
        await user.save();
      }

      res.json({
        message: "Product order cancelled",
        wallet: "Refund Amount Credited in wallet",
      });
    }

    res.json({
      message: "Product order cancelled",
    });
  } catch (error) {
    console.log("Could not cancel the product order");
  }
};

//const adding to wishlist
const addtoWishlist = async (req, res) => {
  try {
    const { prodId } = req.body;
    const user_id = req.session.user_id;
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
    } else {
      const itemExistWl = WListExist.products.find(
        (element) => element.productId.toString() === prodId
      );

      //remove from wishlist
      if (itemExistWl) {
        const result = await Wishlist.updateOne(
          { userId: user_id },
          { $pull: { products: { productId: prodId } } }
        );
        res.json({
          remMessage: "Item removed",
        });
      } else {
        const newItem = {
          productId: prodId,
        };
        WListExist.products.push(newItem);
        await WListExist.save();

        res.json({
          message: "Item added to the wishlist",
        });
      }
    }
  } catch (error) {
    console.log("Unable to add to wishlist");
  }
};

//verify payment function
const verifyPaymentFn = async (req, res) => {
  try {
    const details = req.body;
    let hmac = crypto.createHmac("sha256", "e6rN7GFxw4rzGXDHyQ9oFGy6");

    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac == details.payment.razorpay_signature) {
      changePaymentStatus(details.order.receipt);
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log("Could not verify payment");
  }
};

//for changing payment status
async function changePaymentStatus(orderId) {
  try {
    console.log(orderId);
    const order = await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          paymentStatus: "Placed",
        },
      }
    );

    console.log("Payment updated order" + order);
  } catch (error) {
    console.log("Could not change the payment status");
  }
}

//function for returning product
const returnProductFn = async (req, res) => {
  try {
    const { returnReason, prodId, orderId } = req.body;
    console.log("inside return product order function");
    const order = await Order.findById(orderId);
    const product = await Product.findById(prodId);
    const user = await User.findById(req.session.user_id);

    const productInOrder = order.products.find((product) => {
      return product.productId.toString() === prodId;
    });
    const quantity = productInOrder.quantity;
    console.log("Quantity on line 593: ", quantity);

    productInOrder.ProductOrderStatus = "Returned";
    productInOrder.returnOrderStatus.status = "Returned";
    productInOrder.returnOrderStatus.reason = returnReason;
    productInOrder.returnOrderStatus.date = Date.now();

    //saving order after changing status to returned
    await order.save();
    console.log("Saved order after adding returned status");

    //no need to increase defective stock
    if (returnReason !== "Defective") {
      product.stock = product.stock + quantity;
      await product.save();
      console.log("Product stock increased in ");
    }


    // if order has a coupon used
    if (order.coupon !== null) {
      console.log("Using coupon");
      console.log(order.coupon);
      
      const coupon = await Coupon.findOne({ _id: order.coupon.toString() });

      console.log("Reaching here");
      console.log(coupon);
      //if total amount becomes less then minimum coupon required amount
      if (order.totalAmount < coupon.minimumSpend) {
        console.log("Reaching here inside");

        user.wallet.balance =
          user.wallet.balance +
          (productInOrder.unitPrice * quantity - coupon.discount_amount);
        const walletHistory = {
          type: "Credit",
          amount: productInOrder.unitPrice * quantity - coupon.discount_amount,
          date: Date.now(),
          reason: "Return Refund",
        };
        console.log("Reaching here inside 2");

        user.wallet.history.push(walletHistory);
        await user.save();
        console.log("Reaching here inside 3 after saving ");

        order.coupon = null;
        await order.save();
        console.log("Saved null in coupon");
      } else {
        console.log("No losing coupon");
        // if it is the only and last product
        let amount;
        if (order.products.length === 1) {
          amount = productInOrder.unitPrice * quantity - coupon.discount_amount;
        } else {
          amount = productInOrder.unitPrice * quantity;
        }
        user.wallet.balance = user.wallet.balance + amount;
        const walletHistory = {
          type: "Credit",
          amount: amount,
          date: Date.now(),
          reason: "Return Refund",
        };

        user.wallet.history.push(walletHistory);
        await user.save();
      }
    } else {
      //if order doesn't use a coupon
      console.log("No using coupon");
      user.wallet.balance =
        user.wallet.balance +
        productInOrder.unitPrice * productInOrder.quantity;
      const walletHistory = {
        type: "Credit",
        amount: productInOrder.unitPrice * productInOrder.quantity,
        date: Date.now(),
        reason: "Return Refund",
      };

      user.wallet.history.push(walletHistory);
      await user.save();
    }

    res.json({
      message: "Product Returned",
      wallet: "Wallet credited with refund amount",
    });
  } catch (error) {
    console.log(error.message);
    console.log("Was unable to return product");
  }
};

//adding product review function
const addProdReview = async (req, res) => {
  try {
    const { starValue, text, prodId } = req.body;

    let star = starValue ?? 3;
    const product = await Product.findById(prodId);

    const newRating = {
      comment: text,
      star: star,
      userId: req.session.user_id,
      createdAt: Date.now(),
    };

    product.ratings.push(newRating);
    await product.save();
    res.json({ message: "Thank you for your response" });
  } catch (error) {}
};

//Calculating total sales
const calculateTotalSales = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalSales = orders.reduce((acc, order) => {
      return acc + order.totalAmount;
    }, 0);
    res.json({ totalSales });
  } catch (error) {
    console.log("Unable to calculate sales");
  }
};

//calculate weekly sales
const calculateWeeklySales = async (req, res) => {
  try {
    const weeklySales = await Order.aggregate([
      {
        $project: {
          orderDate: 1,
          totalAmount: 1,
          year: { $year: "$orderDate" },
          week: { $week: "$orderDate" },
        },
      },
      {
        $group: {
          _id: { year: "$year", week: "$week" },
          fromDate: { $min: "$orderDate" },
          toDate: { $max: "$orderDate" },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }, // Count the number of orders
        },
      },
      {
        $project: {
          _id: 0,
          dateRange: {
            $concat: [
              { $dateToString: { format: "%Y-%m-%d", date: "$fromDate" } },
              " to ",
              { $dateToString: { format: "%Y-%m-%d", date: "$toDate" } },
            ],
          },
          totalSales: 1,
          orderCount: 1,
        },
      },
      {
        $sort: { fromDate: 1 },
      },
      {
        $limit: 6,
      },
    ]);


    res.json({ weeklySales });
  } catch (error) {
    console.log("Unable to calculate weekly sales");
    console.log(error.message);
  }
};

//calculate monthly sales
const calculateMonthlySales = async (req, res) => {
  try {
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "January" },
                { case: { $eq: ["$_id.month", 2] }, then: "February" },
                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                { case: { $eq: ["$_id.month", 8] }, then: "August" },
                { case: { $eq: ["$_id.month", 9] }, then: "September" },
                { case: { $eq: ["$_id.month", 10] }, then: "October" },
                { case: { $eq: ["$_id.month", 11] }, then: "November" },
                { case: { $eq: ["$_id.month", 12] }, then: "December" },
              ],
              default: null,
            },
          },
          totalSales: 1,
          orderCount: 1,
        },
      },
    ]);

  
    res.json({ monthlySales });
    console.log(monthlySales);
  } catch (error) {
    console.log("Unable to calculate monthly sales:", error);
  }
};

//calculate category sales
const calculateCategorySales = async (req, res) => {
  try {
    const categorySales = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $match: {
          "products.ProductOrderStatus": {
            $in: ["Delivered", "Ordered", "Shipped", "Out for Delivery"],
          },
          "products.returnOrderStatus.status": { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: "$categoryDetails.categoryName",
          totalSales: { $sum: "$products.unitPrice" },
          salesCount: { $sum: 1 }, // Counting the number of sales
        },
      },
      {
        $sort: { totalSales: -1 },
      },
    ]);

    res.json({ categorySales });
    console.log("Category Sales:", categorySales);
  } catch (error) {
    console.log(error.message);
  }
};


const paymentMethodsChart = async (req, res) => {
  try {
    const paymentMethodCounts = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          totalSales: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalSales: -1 },
      },
    ]);
    res.json({ paymentMethodCounts });
  } catch (error) {
    console.log(error.message);
  }
};

const totalUsersCount = async (req, res) => {
  try {
    let users = await User.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);
    userCount = users[0].count - 1
    res.json({userCount})

  } catch (error) {
    console.log(error.message);
  }
};


//load sales report page
const loadSalesReportPage = async (req,res)=>{
  try {
    res.render('admin/salesReport')
  } catch (error) {
    console.log(error);
  }
}


//loading the sales report actually
const viewSalesReportData = async (req,res)=>{
  try {
    const { startDate , endDate } = req.body
   
    const salesReportData = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: 'users', 
          localField: 'userId',
          foreignField: '_id',
          as: 'populatedUser'
        }
      }
    ]);

    res.json({salesReportData})
    
  } catch (error) {
    console.log(error.message+'Unable to load sales report');
  }
}


//downloading sales report data dunction
const downloadSalesReportData = async (req,res)=>{
  try {
    const { startDate , endDate } = req.body
  

    const salesReportData = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: 'users', 
          localField: 'userId',
          foreignField: '_id',
          as: 'populatedUser'
        }
      }
    ]);

    const csvSalesData = salesReportData.map(order => ({
      id: order._id.toString(),
      userId: order.userId.toString(),
      country: order.shippingAddress.country,
      houseName: order.shippingAddress.houseName,
      fullName: order.shippingAddress.fullName,
      mobile: order.shippingAddress.mobile,
      pincode: order.shippingAddress.pincode,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      OrderStatus: order.OrderStatus,
      StatusLevel: order.StatusLevel,
      paymentStatus: order.paymentStatus,
      orderDate: order.orderDate.toISOString(),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      coupon: order.coupon,
      trackId: order.trackId,
      updatedAt: order.updatedAt.toISOString(),
    }));

    res.json({csvSalesData})
    
  } catch (error) {
    console.log(error.message+' Unable to load sales report');
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
  addtoWishlist,
  verifyPaymentFn,
  returnProductFn,
  addProdReview,

  calculateTotalSales,
  calculateWeeklySales,
  calculateMonthlySales,
  calculateCategorySales,
  paymentMethodsChart,
  totalUsersCount,
  loadSalesReportPage,
  viewSalesReportData,
  downloadSalesReportData

};
