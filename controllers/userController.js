const UserAddressModel = require("../models/userModel");
const ProductsModel = require("../models/productsModel");
const mailer = require("../services/mail");
const bcrypt = require("bcrypt");
const otplib = require("otplib");
const User = UserAddressModel.User;
const Address = UserAddressModel.Address;
const Cart = UserAddressModel.Cart;
const Product = ProductsModel.Product;
let OTP;

// Generate a new OTP secret
const generateOtp = async () => {
  try {
    const otpSecret = otplib.authenticator.generateSecret();
    OTP = otplib.authenticator.generate(otpSecret);
    console.log(`OTP: ${OTP}`);
  } catch (error) {
    console.log(error.message);
  }
};

// for encrypted password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//register load
const loadRegister = async (req, res) => {
  try {
    res.render("users/registration");
  } catch (error) {
    console.log(error.message);
  }
};

//verifying email
const verifyEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const name = req.body.lname;
    req.session.name = name;
    req.session.email = email;

    generateOtp()
    mailer.sendMail(email, OTP, name);
    next();
  } catch (error) {
    console.log(error.message);
  }
};

//loadVerifyOtp
const loadVerifyOtp = async (req, res) => {
  try {
    const email = req.session.email;
    console.log(email + " is here");
    res.render("users/enterOtp", { email: email });
  } catch (error) {
    console.log(error.message);
  }
};

//verifyOtp
const verifyOtp = async (req, res) => {
  try {
    const userOTP = req.body.otp;
    const emailId = req.body.email;
    console.log(userOTP);
    console.log(emailId);

    if (OTP === userOTP) {
      console.log("correct");
      const user = await User.findOne({ email: emailId });

      user.is_verified = true;

      const verified = await user.save();

      if (verified) {
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
  }
};

//resendOtp
const resendOtp = async (req, res, next) => {
  try {
    generateOtp()
    mailer.sendMail(req.session.email, OTP, req.session.name);
    next();
  } catch (error) {
    console.log(error.message);
  }
};

//insert user
const insertUser = async (req, res) => {
  try {
    const email = req.body.email;
    const mail = await User.findOne({ email: req.body.email });
    const currentValue = req.body;
    if (currentValue.fname.includes(" ") || /^[0-9]+$/.test(req.body.fname)) {
      return res.render("users/registration", {
        msgFname: "Enter a valid Name",
        currentValue: currentValue,
      });
    }
    if (
      currentValue.lname.includes(" ") ||
      /^[0-9]+$/.test(currentValue.lname)
    ) {
      return res.render("users/registration", {
        msgLname: "Enter a valid Name",
        currentValue: currentValue,
      });
    }
    if (mail) {
      return res.render("users/registration", {
        msgPass: "This User have already registered",
        currentValue: currentValue,
      });
    }
    const mob = currentValue.mobile;
    if (
      mob.length > 10 ||
      mob.length < 10 ||
      mob.includes(" ") ||
      /[a-zA-Z]/.test(mob)
    ) {
      return res.render("users/registration", {
        msgMobile: "Enter a Proper Mobile number",
        currentValue: currentValue,
      });
    }
    if (currentValue.password.length < 6) {
     return res.render("users/registration", {
        msgPassword: "Enter a strong Password",
        currentValue: currentValue,
      });
    }

    if (currentValue.password == currentValue.cpassword) {
      const spassword = await securePassword(req.body.password);

      const user = new User({
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.email,
        mobile: req.body.mobile,
        // image:req.file.filename,
        password: spassword,
        is_admin: 0,
      });

      //returning a promise
      const userData = await user.save(); //saving data to mongo db

      if (userData) {
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
  }
};

//login function
const loadLogin = async (req, res) => {
  try {
    res.render("users/login");
  } catch (error) {
    console.log(error.message);
  }
};


// verifyLogin
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if(!userData.is_verified){
      return res.render("users/login", { verif_message: "You email is not verified" });
    }
    if (!userData.isBlocked) {
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          req.session.user_id = userData._id;
          res.redirect("/home");
        } else {
          res.render("users/login", {
            message: "Email and password is incorrect",
          });
        }
      } else {
        res.render("users/login", {
          message: "Email and password is incorrect",
        });
      }
    } else {
      res.render("users/login", { message: "You have been blocked" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loading home
const loadHome = async (req, res) => {
  try {
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

    const products = await Product.find({
      is_listed: true,
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

    const count = await Product.find({
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { description: { $regex: ".*" + search + ".*", $options: "i" } },
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();

    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("users/home", {
        user: userData,
        products: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } else {
      res.render("users/home", {
        products: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//load user account details
const loadAccount = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    const address = await Address.find({userId:req.session.user_id})
    console.log(address);
    res.render("users/account", { user: userData , address:address});
  } catch (error) {
    console.log(error.message);
  }
};

// logout functionality
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

// shop loading
const loadShop = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 9;

    const products = await Product.find({
      is_listed: true,
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

    const count = await Product.find({
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { description: { $regex: ".*" + search + ".*", $options: "i" } },
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();

    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("users/shop", {
        user: userData,
        products: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } else {
      res.render("users/shop", {
        products: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    }
  } catch (error) {
    console.log(error.message);
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

      //finding sum of all products in the cart    

    if (cart) {
      let totalAmount = 0;
        cart.products.forEach((product, index) => {
            if (index === 0) {
              totalAmount = 0;
            }
            totalAmount += product.productId.actualPrice * product.quantity;
        });
      res.render("users/shopping-cart", { user: userData, cart: cart , totalAmount: totalAmount});
    } else {
      res.render("users/shopping-cart", { user: userData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//loading productview
const loadProductView = async (req, res) => {
  try {
    const product_id = req.query.id;
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId });
    const product = await Product.findOne({ _id: product_id });

    res.render("users/productView", { product: product, user: user });
  } catch (error) {
    console.log(error.message);
  }
};

//add to cart
const addtoCart = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const user = await User.findOne({ _id: user_id }); //current user details
    console.log("User name is " + user.firstname + " " + user.lastname);

    const product_id = req.params.prodId; //current product id
    const quantity = req.body.quantity ?? 1;

    const cartExist = await Cart.findOne({ userId: user_id });
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
      console.log("New cart added to user");
      res.json({
        message: "Created a new Cart and added to cart successfully",
      });

      //if cart is present
    } else {
      //checking if product already exists in the cart
      const productExist = cartExist.products.find(
        (element) => element.productId.toString() === product_id
      );

      if (productExist) {
        console.log("Product found");

        const result = await Cart.updateOne(
          { userId: user_id, "products.productId": product_id },
          { $inc: { "products.$.quantity": 1 } } // Use "$" to identify the matched array element
        );

        console.log("Quantity incremented successfully");
        //if same product doesnt exist in the cart
      } else {
        const newProduct = {
          productId: product_id,
          quantity: quantity,
        };

        cartExist.products.push(newProduct);
        await cartExist.save(); // Save the updated cart
        console.log("Product added to the cart");
      }
    }
  } catch (error) {
    console.log(error.message);
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
  }
};

//delete product in cart function
const deleteCartProduct = async (req, res, next) => {
  try {
    console.log("reachinggggggg");
    const user_id = req.session.user_id;
    const product_id = req.params.prodId;

    const result = await Cart.updateOne(
      { userId: user_id },
      { $pull: { products: { productId: product_id } } }
    );
    res.redirect("/cart");
    next();
  } catch (error) {
    console.log(error.message);
  }
};

//loading checkout page
const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({_id:userId})
    const cartDetails = await Cart.findOne({userId:userId})
    .populate('userId')
    .populate("products.productId");

     //finding sum of all products in the cart
     let totalAmount = 0;
     cartDetails.products.forEach((product, index) => {
         if (index === 0) {
           totalAmount = 0;
         }
         totalAmount += product.productId.actualPrice * product.quantity;
     });


    res.render("users/checkout",{cart:cartDetails , totalAmount:totalAmount});
  } catch (error) {
    console.log(error.message);
  }
};


//show zoom
const showZoom = async (req,res)=>{
  res.render('users/zoom')
}


// edit and update user data
const editUserData = async (req,res)=>{
  try {
    const {email, fname ,lname , mobile} = req.body 
   
    const userData = await User.findOne({email:email})

  if(userData){
    const updatedUserData = await User.updateOne(
      { _id: userData._id }, 
      {
        $set: {
          firstname: fname ?? userData.firstname,
          lastname: lname ?? userData.lastname,
          mobile: mobile ?? userData.mobile
          
        },
      }
    );
    res.json({ message: "User Updated Successfully" });
  }else{
    console.log('No User found');
  }
  } catch (error) {
    console.log(error.message);
  }
}



// adding and updating new address
const updateAddress = async (req,res)=>{
  try {
    const [ houseName , city ,state ,country ,pincode ,email ] = req.body
    const userData = await User.findOne({email:email})

    const address = new Address({
      userId: userData._id,
      fullname: userData.firstname +" "+ userData.lastname,
      mobile: userData.mobile,
      houseName: houseName,
      city: city,
      state: state,
      country: country,
      pincode: pincode,
      
    });

    //returning a promise
    const newAddress = await address.save();
    console.log("Done address");
    res.json({ message: "Address Addes Successfully" });
  } catch (error) {
    console.log(error.message);
  }
}


// updating edited address
const updateEditedAddress = async (req,res)=>{
  try {
    const {houseName ,city , state ,country ,pincode , email} = req.body;
    const user = await User.findOne({email:email})
    console.log(user);
    const address = await Address.find({userId : user._id})
    if (address && address.length > 0) {
      const firstAddress = address[0];
    
      firstAddress.houseName = houseName;
      firstAddress.city = city;
      firstAddress.state = state;
      firstAddress.country = country;
      firstAddress.pincode = pincode;
      
  //save the changes
      await firstAddress.save();
    
      console.log('First address updated successfully');
    
    }
    res.json({ message: "Address Addes Successfully" });

  } catch (error) {
    console.log(error.message);
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
  loadcart,
  loadProductView,
  addtoCart,
  cartIncreaseDecrease,
  deleteCartProduct,
  loadCheckout,

  showZoom,

  editUserData,
  updateAddress,
  updateEditedAddress
};
