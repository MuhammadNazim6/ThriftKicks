//to check weather user is logged in or not
const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
    } else {
      return res.redirect("/");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};


const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/home");
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
