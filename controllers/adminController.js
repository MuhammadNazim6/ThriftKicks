const UserAddressModel = require("../models/userModel");
const ProductsModel = require("../models/productsModel");
const CategoryModel = require("../models/categoryModel");
const User = UserAddressModel.User;
const Address = UserAddressModel.Address;
const Product = ProductsModel.Product;
const Category = CategoryModel.Category;
const bcrypt = require("bcrypt")
const path = require('path')




// const load = async (req,res)=>{
//   res.render('admin/test')
// }

// const categoryByProduct = async (req,res)=>{
//   const productData = await Product.find({_id:'65416848a43ee5b5ac829f1f'})
//   console.log(productData);
// }



// for encrypted password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//loading admin login
const loadAdminLogin = async (req, res) => {
  try {
    res.render("admin/loginAdmin");
  } catch (error) {
    console.log(error.message);
  }
};

//load Admin Dashboard
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("admin/loginAdmin", {
            message: "Email and password incorrect",
          });
        } else {
          req.session.user_id = userData._id;
          res.redirect("admin/dashboard");
        }
      } else {
        res.render("admin/loginAdmin", {
          message: "Email and password incorrect",
        });
      }
    } else {
      res.render("admin/loginAdmin", {
        message: "Email and password incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loading dashboard
const loadDashboard = async (req, res) => {
  try {
    res.render("admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

// logout function
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//dashboard function
const admDashboard = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const fullUserdata = await User.find({
      is_admin: 0,
      $or: [
        { firstname: { $regex: ".*" + search + ".*", $options: "i" } },
        { lastname: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
        // { mobile: {$regex:".*"+ search +".*",$options: "i"}}
      ],
    });

    res.render("admin/users", { users: fullUserdata });
  } catch (error) {
    console.log(error.message);
  }
};

//function for editing user data
const editUserload = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("admin/edit-user", { user: userData });
    } else {
      res.redirect("/admin/users");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//updating edited users
const updateUsers = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          firstname: req.body.fname,
          lastname: req.body.lname,
          email: req.body.email,
          mobile: req.body.mobile,
        },
      }
    );
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

//blocking user
const blockUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = true;

    await user.save();
    res.json({ message: "User blocked successfully" });
    next();
  } catch (error) {
    console.log(error.message);
  }
};

// unblocking user
const unblockUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = false;

    await user.save();
    res.json({ message: "User Unblocked successfully" });
    next();
  } catch (error) {
    console.log(error.message);
  }
};

//loading Products in admin
const loadProducts = async (req, res) => {
  try {
    // const category = await Category.find()
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const fullProducts = await Product.find({
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { description: { $regex: ".*" + search + ".*", $options: "i" } },
        { size: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    });



    res.render("admin/products", { products: fullProducts });
  } catch (error) {
    console.log(error.message);
  }
};

//Loading add product
const loadAddProduct = async (req, res) => {
  try {
    const fullCategory = await Category.find();

    res.render("admin/addProduct", { category: fullCategory });
  } catch (error) {
    console.log(error.message);
  }
};

//adding products
const addProduct = async (req, res) => {
  try {
    const filePaths = req.files.map(file => file.path);
    const Path1 = "\\Images\\" + path.basename(filePaths[0]);
    const Path2 = "\\Images\\" + path.basename(filePaths[1]);
    const Path3 = "\\Images\\" + path.basename(filePaths[2]);

    const product = new Product({
      productName: req.body.productName,
      description: req.body.description,
      actualPrice: req.body.actualPrice,
      size: req.body.size,
      image: {
        contentType: 'image/png',
        path1: Path1,
        path2: Path2,
        path3: Path3

      },
      category_id: req.body.category,
      offerPrice: req.body.offerPrice,
      stock: req.body.stock,
    });
    const newProduct = await product.save();
    const categoryFull = await Category.find();
    if (newProduct) {
      res.render("admin/addProduct", {
        smessage: "Product Added Successfully.",
        category: categoryFull
      });
    } else {
      res.render("admin/addProduct", {
        fmessage: "Failed to add product.",
        category: categoryFull
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Load categories
const loadCategories = async (req, res) => {
  try {
    const categories = await Category.find()
    res.render('admin/categories', { category: categories })
  } catch (error) {
    console.log(error.message);
  }
}


//load add category
const loadAddCategory = async (req, res) => {
  try {
    res.render("admin/addCategory");
  } catch (error) {
    console.log(error.message);
  }
};


//Add category
const addCategory = async (req, res) => {
  try {
    let checkCategory = req.body.categoryName;
    let casedCategory = checkCategory.charAt(0).toUpperCase() + checkCategory.slice(1).toLowerCase();

    const existCategory = await Category.findOne({ categoryName: casedCategory })

    if (!existCategory) {
      const category = new Category({
        categoryName: req.body.categoryName,
        description: req.body.description,
      });
      const newCategory = await category.save();

      if (newCategory) {
        res.render("admin/addCategory", {
          smessage: "Category Added Successfully.",
        });
      } else {
        res.render("admin/addCategory", {
          fmessage: "Failed to add Category.",
        });
      }
    } else {
      res.render("admin/addCategory", {
        fmessage: "This Category already exists",
      });
    }

  } catch (error) {
    console.log(error.message);
  }
};


//loading edit Product
const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const products = await Product.findOne({ _id: id })
    res.render('admin/editProduct', { products: products })
  } catch (error) {
    console.log(error.message);
  }
}


const updateProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(

      { _id: req.body.id },
      {
        $set: {
          productName: req.body.productName,
          description: req.body.description,
          size: req.body.size,
          actualPrice: req.body.actualPrice,
          stock: req.body.stock,

        },
      }
    );

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadAdminLogin,
  verifyLogin,
  loadDashboard,
  logout,
  admDashboard,
  editUserload,
  updateUsers,
  blockUser,
  unblockUser,
  loadProducts,
  loadAddProduct,
  addProduct,
  loadCategories,
  loadAddCategory,
  addCategory,
  loadEditProduct,
  updateProduct
};
