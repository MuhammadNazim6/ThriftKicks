const UserAddressModel = require("../models/userModel");
const ProductsModel = require("../models/productsModel");
const OrdersModel = require('../models/ordersModel')
const mailer = require("../services/mail");
const BannerModel = require('../models/bannerModel')
const bcrypt = require("bcrypt");
const otplib = require("otplib");
const uuid = require('uuid');
const User = UserAddressModel.User;
const Address = UserAddressModel.Address;
const Cart = UserAddressModel.Cart;
const Product = ProductsModel.Product;
const Order = OrdersModel.Order;
const Wishlist = UserAddressModel.Wishlist;
const Banner = BannerModel.Banner;
const {Category} = require("../models/categoryModel");



// Generate a new OTP secret
const generateOtp = async (req,res) => {
  try {
    const otpSecret = otplib.authenticator.generateSecret();
    req.session.otp = otplib.authenticator.generate(otpSecret);
    console.log(`OTP: ${req.session.otp}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

// for encrypted password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//register load
const loadRegister = async (req, res) => {
  try {
    const refCode = req.query.refCode
    req.session.refCode = refCode

    res.render("users/registration");
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//verifying email
const verifyEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const name = req.body.lname;
    req.session.name = name;
    req.session.email = email;
    
    await generateOtp(req,res);
    const OTP = req.session.otp
    mailer.sendMail(email, OTP, name);
  
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//loadVerifyOtp
const loadVerifyOtp = async (req, res) => {
  try {
    const email = req.session.email;
    
    res.render("users/enterOtp", { email: email });
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//verifyOtp
const verifyOtp = async (req, res) => {
  try {
    const userOTP = req.body.otp;
    const emailId = req.body.email;


    if (req.session.otp === userOTP) {
    
      const userData = req.session.userData

      const user = new User({
        firstname:userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        mobile: userData.mobile,
        password: userData.password,
        is_admin: 0,
        refCode: userData.refCode,
        is_verified: true
      });

    
      const verified = await user.save();
      req.session.userData = {}


      if (verified) {
        req.session.user_id = user._id;
      
        //if there is a referral code
        if(req.session.refCode){
          const referrerUser = await User.findOne({refCode:req.session.refCode})
          //if referral code is valid
          if(referrerUser){
        

          user.wallet.balance = 200
          const history = {
            type: 'Credit',
            amount: 200,
            date: Date.now(),
            reason: 'Referral Bonus'
          }
          user.wallet.history.push(history)
          await user.save()

          //updating referrer users wallet balance
          
          referrerUser.wallet.balance += 200
          const referrerHistory = {
            type: 'Credit',
            amount: 200,
            date: Date.now(),
            reason: 'Referrer Bonus'
          }
          referrerUser.wallet.history.push(referrerHistory)
          await referrerUser.save()

          }else{
            console.log('Not a valid referral code');
          }

        }

        res.render("users/enterOtp", {
          email: emailId,
          message: "Your email has been verified",
        });
      
      }
    } else {
      res.render("users/enterOtp", {
        email: emailId,
        fmessage: "Enter a valid OTP",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//resendOtp
const resendOtp = async (req, res, next) => {
  try {
    
    generateOtp(req,res);
    mailer.sendMail(req.session.email, req.session.otp, req.session.name);
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//insert user
const insertUser = async (req, res) => {
  try {
    const email = req.body.email;
    const mail = await User.findOne({ email: req.body.email });
    const currentValue = req.body;

    if (currentValue.password == currentValue.cpassword) {
      const spassword = await securePassword(req.body.password);
      const refCode = await generateReferralCode()

      req.session.userData = {
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.email,
        mobile: req.body.mobile,
        password: spassword,
        is_admin: 0,
        refCode: refCode
      }

      if (req.session.userData) {
        res.redirect(`/verifyOtp?email=${encodeURIComponent(email)}`);
      } else {
        return res.render("users/registration", {
          message: "Your registration has failed.",
          currentValue: currentValue,
        });
      }
    } else {
      return res.render("users/registration", {
        msgPass: "Passwords do NOT match",
        currentValue: currentValue,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//for generating referral Code
function generateReferralCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters.charAt(randomIndex);
  }
  return referralCode;
}

//login function
const loadLogin = async (req, res) => {
  try {
    res.render("users/login");
  } catch (error) {
    console.log(error.message);
    res.status(404).render('users/404') 
  }
};


// verifyLogin
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (!userData) {
      return res.render("users/login", {
          message: "Email and password is incorrect",
      });
  }

    if (!userData.is_verified) {
      return res.render("users/login", {
          verif_message: "Your email is not verified",
      });
  }
  
  if (userData.isBlocked) {
      return res.render("users/login", {
      message: "You have been blocked" });
  }
  
    const passwordMatch = await bcrypt.compare(password, userData.password);
  
  if (passwordMatch) {
      req.session.user_id = userData._id;
      res.redirect("/home");
  } else {
      res.render("users/login", {
          message: "Email and password is incorrect",
      });
  }
  
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

// loading home
const loadHome = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    //pagination
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 4;

    const listedProducts = await Product.find({
      is_listed:true,
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { description: { $regex: ".*" + search + ".*", $options: "i" } },
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
      .populate("category_id")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

      const products = listedProducts.filter((prod)=>{
        return prod.category_id.is_listed === true
      })

    const count = await Product.find({
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { description: { $regex: ".*" + search + ".*", $options: "i" } },
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();

    //for badge
    const cart = await Cart.findOne({userId: user_id})
    .populate("userId")
    .populate("products.productId");

    //for wishlist
    const wishlist = await Wishlist.findOne({userId:user_id})

    //for banner
      const banner = await Banner.aggregate([
        {
        $match: {
          is_listed: { $eq: true }
        }
      }
    ]);



    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("users/home", {
        user: userData,
        products: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        cart : cart,
        wishlist,
        banner,
        
      });
    } else {
      res.render("users/home", {
        products: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        banner,
        
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).render('users/404') 
  }
};


//load user account details
const loadAccount = async (req, res) => {
  try {
    
    const userId = req.session.user_id;
    const userData = await User.findById({ _id: userId });
    const address = await Address.find({ userId: userId });
    const cart = await Cart.findOne({userId: userId })
    .populate("userId")
    .populate("products.productId");

    const orders = await Order.find({userId : userId})
    .populate('products.productId')
    
    res.render("users/account", { user: userData, address: address ,cart:cart , orders:orders});
  } catch (error) {
    console.log(error.message);
    res.status(404).render('users/404') 

  }
};

// logout functionality
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.status(404).render('users/404') 

  }
};

// shop loading
const loadShop = async (req, res) => {
  try {

    let search = req.query.search || "";
    let page = req.query.page || 1;
    const limit = 9;

    const sortField = req.query.sortField || 'actualPrice';
    const sortOrder = req.query.sortOrder || 'asc';
    const categoryFilter = req.query.category || '';

    const query = {
      is_listed: true,
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
      
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    };

    
    if (categoryFilter && categoryFilter !== 'All') {
      const category = await Category.findOne({ categoryName: categoryFilter });
      if (category) {
        query['category_id'] = category._id;
      }
    }
  

    const products = await Product.find(query)
      .populate("category_id")
      .sort({ [sortField]: sortOrder })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.find(query).countDocuments();



// for badge
    const cart = await Cart.findOne({userId: req.session.user_id})
    .populate("userId")
    .populate("products.productId");

    //wishlist load
    const wishlist = await Wishlist.findOne({userId:req.session.user_id})

    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("users/shop", {
        user: userData,
        products: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        cart: cart,
        wishlist,
        search,
        page,
        sortField,
        sortOrder,
        categoryFilter
        
        
      });
    } else {
      res.render("users/shop", {
        products: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        search,
        page,
        sortField,
        sortOrder,
        categoryFilter

      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).render('users/404') 

  }
};


//loading shopping cart
const loadcart = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const userData = await User.findById({ _id: user_id });
    const cart = await Cart.findOne({ userId: user_id })
      .populate("userId")
      .populate("products.productId");
    
      // checking if query exists
      const stockQuery = req.query.nostock;
  

    //finding sum of all products in the cart

    if (cart) {
      let totalAmount = 0;
      
      cart.products.forEach((product, index) => {
        if (index === 0) {
          totalAmount = 0;
        }
            if(product.productId.actualPrice === product.productId.offerPrice){
              totalAmount += product.productId.actualPrice * product.quantity;
            }else{
              totalAmount += product.productId.offerPrice * product.quantity;
            }
        
      });

          if(!stockQuery){
            res.render("users/shopping-cart", {
              user: userData,
              cart,
              totalAmount: totalAmount,
            });
          }else{
            
            res.render("users/shopping-cart", {
              user: userData,
              cart: cart,
              totalAmount: totalAmount,
              nostock : "nostock"
            });
          }
      
    } else {
      res.render("users/shopping-cart", { user: userData });
    }

  } catch (error) {
    console.log(error.message);
    res.status(404).render('users/404') 

  }
};


//loading productview
const loadProductView = async (req, res) => {
  try {
    const product_id = req.query.id;
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId });
    const product = await Product.findOne({ _id: product_id })
    .populate("ratings.userId")


    //checking weather user is eligible for review
    const orders = await Order.find({userId : userId})

    let canRateArr = []
    orders.forEach((order)=>{
      const prodInOrder = order.products.filter((prod)=>{
        return prod.productId.toString() === product_id;
      })
      prodInOrder.forEach((prod)=>{
        if((prod.ProductOrderStatus === 'Delivered') || (prod.ProductOrderStatus === 'Returned')){
          canRateArr.push('Yeah')
            }
      })
    })
    let canRate = canRateArr.length !== 0;
// ------------------------------------


    // for badge
    const cart = await Cart.findOne({userId: req.session.user_id})
    .populate("userId")
    .populate("products.productId");

    //for wishlist
    const wishlist = await Wishlist.findOne({userId:userId})

    //for average star rating
      let avgStar = 0 
      product.ratings.forEach( (elem)=>{
        avgStar = avgStar + elem.star
    })
      avgStar = Math.floor(avgStar/product.ratings.length)

      const products = await Product.find()

if(user){
  res.render("users/productView", { product , user ,cart ,wishlist ,avgStar , products , canRate});
}else{
  res.render("users/productView", { product , avgStar , products });
}
  } catch (error) {
    console.log(error.message);
    res.status(404).render('users/404') 
  }
};

//add to cart
const addtoCart = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const user = await User.findOne({ _id: user_id }); //current user details

    const product_id = req.params.prodId; //current product id
    const quantity = req.body.quantity ?? 1;

    const cartExist = await Cart.findOne({ userId: user_id });
    const prod = await Product.findOne({_id : product_id})

    if(prod.stock === 0 ){
    return res.json({
        message: "Product currently out of Stock",
        length: cartExist?.products?.length
      });
    }

    //if No cart for user
    if (!cartExist) {
      const newCart = new Cart({
        userId: user_id,
        products: [
          {
            productId: product_id,
            quantity: quantity,
          },
        ],
      });
      const cartAdded = await newCart.save();
      res.json({
        message: "Product added to the cart",
        length: cartAdded.products.length
      });

      //if cart is present
    } else {
      //checking if product already exists in the cart
      const productExist = cartExist.products.find(
        (element) => element.productId.toString() === product_id
      );

      if (productExist) {
      res.json({
          message: "Product already added to cart",
          length: cartExist.products.length
        });
  
        //if same product doesnt exist in the cart
      } else {
        
        const newProduct = {
          productId: product_id,
          quantity: quantity,
        };

        cartExist.products.push(newProduct);
        await cartExist.save(); 
        res.json({
          message: "Product added to the cart",
          length: cartExist.products.length
        });
        
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });

  }
};

//to increase and decrease cart products
const cartIncreaseDecrease = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const user = await User.findOne({ _id: user_id });
    const value = req.body.incdecValue;
    const product_id = req.params.prodId;

    const result = await Cart.updateOne(
      { userId: user_id, "products.productId": product_id },
      { $inc: { "products.$.quantity": value } } // Use "$" to identify the matched array element
    );

    res.json({ message: "Changed quantity successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//delete product in cart function
const deleteCartProduct = async (req, res, next) => {
  try {
    
    const user_id = req.session.user_id;
    const product_id = req.params.prodId;

    const result = await Cart.updateOne(
      { userId: user_id },
      { $pull: { products: { productId: product_id } } }
    );

     //for badge
     const cart = await Cart.findOne({userId: user_id})
     .populate("userId")
     .populate("products.productId");
    

    res.json({length: cart.products.length , message:'Cart item removed'})

    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });

  }
};





// edit and update user data
const editUserData = async (req, res) => {
  try {
    const { email, fname, lname, mobile } = req.body;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const updatedUserData = await User.updateOne(
        { _id: userData._id },
        {
          $set: {
            firstname: fname ?? userData.firstname,
            lastname: lname ?? userData.lastname,
            mobile: mobile ?? userData.mobile,
          },
        }
      );
      res.json({ message: "User Updated Successfully" });
    } else {
      console.log("No User found");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// adding and updating new address
const updateAddress = async (req, res) => {
  try {
    const [houseName, city, state, country, pincode] = req.body;
    const addressRegex = /^[a-zA-Z0-9\s.,'-]+$/
    const spRegex = /^\s*$/
    const numRegex = /^\d+$/
    if(!addressRegex.test(houseName) || !addressRegex.test(city) ||!addressRegex.test(state) || !addressRegex.test(country)){
      res.json({ failmessage: "Add a Valid Address" });
      return
    }
    if(spRegex.test(houseName) || spRegex.test(city) ||spRegex.test(state) || spRegex.test(country)){
      res.json({ failmessage: "Add a Valid Address" });
      return
    }
    if(numRegex.test(houseName) || numRegex.test(city) ||numRegex.test(state) || numRegex.test(country)){
      res.json({ failmessage: "Add a Valid Address" });
      return
    }

    const user_id = req.session.user_id;
    const userData = await User.findOne({ _id: user_id });

    const address = new Address({
      userId: userData._id,
      fullname: userData.firstname + " " + userData.lastname,
      mobile: userData.mobile,
      houseName: houseName,
      city: city,
      state: state,
      country: country,
      pincode: pincode,
    });

    //returning a promise
    const newAddress = await address.save();
    res.json({ message: "Address Addes Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

// updating edited address
const updateEditedAddress = async (req, res) => {
  try {
    const { houseName, city, state, country, pincode, email } = req.body;
    const user = await User.findOne({ email: email });

    const address = await Address.find({ userId: user._id });
    if (address && address.length > 0) {
      const firstAddress = address[0]; 

      firstAddress.houseName = houseName;
      firstAddress.city = city;
      firstAddress.state = state;
      firstAddress.country = country;
      firstAddress.pincode = pincode;

      //save the changes
      await firstAddress.save();

    }
    res.json({ message: "Address Added Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//Checking current password same or not
const checkCurrPass = async (req, res) => {
  try {
    const { currentPassVal, email } = req.body;
    const user = await User.findOne({ email: email });
    const passwordMatch = await bcrypt.compare(currentPassVal, user.password);
    if (passwordMatch) {
      res.json({ message: "Correct" });
    } else {
      res.json({ message: "Incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

//changing password to new password
const changePass = async (req, res) => {
  try {
    const { newPassVal, email } = req.body;
    const userData = await User.findOne({ email: email });
    const encryptedPass = await securePassword(newPassVal);
    if (userData) {
      const updatedUserData = await User.updateOne(
        { _id: userData._id },
        {
          $set: {
            password: encryptedPass,
          },
        }
      );
      res.json({ message: "User Password Changed Successfully" });
    } else {
      console.log("user not found");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};

// add new address
const addAddress = async (req, res) => {
  try {
    const { email, name, houseName, city, state, country, pincode, mobile } = req.body;
    const userData = await User.findOne({email,email})

    const address = new Address({
      userId: userData._id,
      fullname: name,
      mobile: mobile,
      houseName: houseName,
      city: city,
      state: state,
      country: country,
      pincode: pincode,
    });

    //returning a promise
    const newAddress = await address.save();
    if(newAddress){
      res.json({ message: "Added address successfully" });
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
};



//Loading forgot password
const forgotPassword = async (req,res)=>{
  try {
    res.render('users/forgotPass')
  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
}


//send otp mail for forgot password
const forgotPassEmail = async (req,res)=>{
  try {
    const {email} = req.body

    const user = await User.findOne({ email : email })
    if(!user){
      return res.json({ failMessage: "No User found with this email" });
    }
    const name = user.firstname+" "+user.lastname;
    generateOtp(req,res);
    mailer.sendForgotPassMail( email, req.session.otp, name );
    return res.json({ successMessage: "Otp sent to the email" })

  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
}


//check otp of forget password
const forgetPassCheckOtp = async (req,res)=>{
  try {
    const { email, userOtp } = req.body;
    
    if(userOtp === req.session.otp){
      return res.json({ successMessage: "Otp are equal" })
    }
    res.json({failedMessage:'Enter a valid OTP'})

  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
}


//Loading changing password using OTP
const loadOtpchangepass = async (req,res)=>{
  try {
    const email = req.query.email
    res.render('users/otpChangePass',{email})

  } catch (error) {
    console.log(error.message);
    res.status(500).render('error', { error: error.message });
  }
}

//loading wishlist
const loadWishlist = async (req,res)=>{
  try {
    
    const userId = req.session.user_id
    const user = await User.findOne({_id:userId})
    const wishlist = await Wishlist.findOne({userId: userId})
    .populate("products.productId")

    //for badge
    const cart = await Cart.findOne({userId: userId})
    .populate("userId")
    .populate("products.productId");

    res.render('users/wishlist',{wishlist , user ,cart})
  } catch (error) {
    console.log(error.message);
    res.status(404).render('users/404') 

  }
}






module.exports = {
  loadLogin,
  loadRegister,
  verifyEmail,
  loadVerifyOtp,
  verifyOtp,
  resendOtp,
  insertUser,
  verifyLogin,
  loadHome,
  loadAccount,
  userLogout,
  loadShop,
  loadProductView,

  //------------------cart functions----------------------------
  loadcart,
  addtoCart,
  cartIncreaseDecrease,
  deleteCartProduct,
  //------------------cart functions----------------------------


  editUserData,
  updateAddress,
  updateEditedAddress,
  checkCurrPass,
  changePass,
  addAddress,
  forgotPassword,
  forgotPassEmail,
  forgetPassCheckOtp,
  loadOtpchangepass,
  loadWishlist,
  
};

