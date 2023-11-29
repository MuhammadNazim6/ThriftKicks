
//if login
const isLogin = async (req, res, next) => {
  try {

    if (req.session.admin) {
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

    if (req.session.admin ) {
      res.redirect("admin/dashboard");
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
