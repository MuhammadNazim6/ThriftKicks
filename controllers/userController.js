const UserAddressModel = require("../models/userModel");
const ProductsModel = require("../models/productsModel");
const User = UserAddressModel.User;
const Address = UserAddressModel.Address;
const Cart = UserAddressModel.Cart;
const Product = ProductsModel.Product;
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const mailFunction = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: NUMBER(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });

    console.log("email sent successfully");
  } catch (error) {
    console.log("email Not Sent");

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

//insert user
const insertUser = async (req, res) => {
  try {
    const mail = await User.findOne({ email: req.body.email });
    const currentValue = req.body;
    if (currentValue.fname.includes(" ") || /^[0-9]+$/.test(req.body.fname)) {
      res.render("users/registration", {
        msgFname: "Enter a valid Name",
        currentValue: currentValue,
      });
    }
    if (
      currentValue.lname.includes(" ") ||
      /^[0-9]+$/.test(currentValue.lname)
    ) {
      res.render("users/registration", {
        msgLname: "Enter a valid Name",
        currentValue: currentValue,
      });
    }
    if (mail) {
      res.render("users/registration", {
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
      res.render("users/registration", {
        msgMobile: "Enter a Proper Mobile number",
        currentValue: currentValue,
      });
    }
    if (currentValue.password.length < 6) {
      res.render("users/registration", {
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
        res.render("users/registration", {
          message: "Your registration is successful.",
        });
      } else {
        res.render("users/registration", {
          message: "Your registration has failed.",
          currentValue: currentValue,
        });
      }
    } else {
      res.render("users/registration", {
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
    res.render("users/account", { user: userData });
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
    const limit = 6;

    const products = await Product.find({
      is_listed: true,
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { description: { $regex: ".*" + search + ".*", $options: "i" } },
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
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
      .populate("productId");

    res.render("users/shopping-cart", { user: userData });
    // }else{
    // res.render('users/shopping-cart',{data:"Login or Signup for Using Cart"});
    // res.render('users/shopping-cart');
  } catch (error) {
    console.log(error.message);
  }
};

const loadProductView = async (req, res) => {
  try {
    const product_id = req.query.id;
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId });
    const product = await Product.findOne({ _id: product_id});

    res.render("users/productView", { product: product ,user:user});
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
    console.log(cartExist);
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
      console.log(cartAdded);
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
          { userId:user_id,"products.productId": product_id},
          { $inc: { "products.$.quantity": 1 } } // Use "$" to identify the matched array element
        );

        console.log( "Quantity incremented successfully");

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

module.exports = {
  loadLogin,
  loadRegister,
  insertUser,
  verifyLogin,
  loadHome,
  loadAccount,
  userLogout,
  loadShop,
  loadcart,
  loadProductView,
  addtoCart,
};
