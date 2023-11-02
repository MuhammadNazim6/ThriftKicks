const UserAddressModel = require("../models/userModel");
const User = UserAddressModel.User;
//if login
const isLogin = async (req, res, next) => {
  try {
    const admin = await User.findOne({is_admin : 1})
    const logging = await User.findOne({_id:req.session.user_id})

    if (req.session.user_id && admin.email == logging.email) {
    } else {
      res.redirect("/admin");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

// if logout
const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id && req.body.email == "nazimnazz66@gmail.com") {
      res.redirect("/");
    }

    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
