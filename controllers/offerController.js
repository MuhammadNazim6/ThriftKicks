const { Category } = require("../models/categoryModel");
const OfferModel = require("../models/offerModel");
const { Product } = require("../models/productsModel");

const Offer = OfferModel.Offer;

//loading offer page
const loadOfferPage = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.render("admin/offers", { offers });
  } catch (error) {
    console.log("unable to load offer page");
  }
};

//add new offer function
const addNewOffer = async (req, res) => {
  try {
    const { formValues } = req.body;

    const offerName = formValues[0];
    const offerDiscount = parseInt(formValues[1]);
    const expiry = formValues[2];

    if (offerName.length < 3) {
      return res.json({ errMsg: "Enter a proper offer name" });
    }

    if (offerDiscount < 0 || isNaN(offerDiscount) || offerDiscount > 60) {
      return res.json({
        errMsg: "Discount should be more than 2% and less than 50%",
      });
    }

    const expiryDate = new Date(expiry);
    if (isNaN(expiryDate) || expiryDate < Date.now()) {
      return res.json({
        errMsg: "The expiry date cannot be a past date or null",
      });
    }

    const newOffer = new Offer({
      offerName: offerName,
      offerDiscount: offerDiscount,
      expiryDate: expiry,
    });
    const offerId = newOffer._id
    await newOffer.save();
    res.json({ message: "New offer added successfully" ,offerId });
  } catch (error) {
    console.log("Unable to add offer ");
    console.log(error.message);
  }
};

//applying offer to product
const applyOfferToProduct = async (req, res) => {
  try {
    const { prodId, offerId } = req.body;

    const product = await Product.findById(prodId);
    const offer = await Offer.findById(offerId);

    product.offers = [];
    product.offers.push(offer);
    const offerPrice = Math.floor(
      product.actualPrice - (product.actualPrice * (offer.offerDiscount / 100))
    );
    product.offerPrice = offerPrice;

    await product.save();
   

    res.json({
      message:
        "Added " + offer.offerName + " to product " + product.productName,
    });
  } catch (error) {
    console.log(error.message);
  }
};


//Function for removing product offer
const removeProdOfferFn = async (req, res) => {
  try {
    const { prodId } = req.body;
    const product = await Product.findById(prodId);
    product.offers = [];
    product.offerPrice = product.actualPrice;

    await product.save();
    res.json({ message: "Product offer removed" });
  } catch (error) {
    console.log(error.message);
    console.log("Unable to remove offer");
  }
};



//Appplying offer to categories
const applyOfferToCategory = async (req, res) => {
  try {
    const { categoryId, offerId } = req.body;
    const offer = await Offer.findById(offerId);
    const category = await Category.findById(categoryId)
    const categoryProducts = await Product.find({category_id:categoryId});

    //Adding category offer in category
    category.offers = []
    category.offers.push(offer)
    await category.save()


    //changing each product discount price and adding offer in the offers array
      categoryProducts.forEach(async (product) => {
      product.offers = [];
      product.offers.push(offer);
      const offerPrice = Math.floor(product.actualPrice - (product.actualPrice * (offer.offerDiscount / 100)) );
      product.offerPrice = offerPrice;

      await product.save();
    });
    

    res.json({
      message:'Offer added to Category' });

  } catch (error) {
    console.log(error.message);
  }
};



//Function for removing category offer
const removeCategoryOfferFn = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const category = await Category.findById(categoryId);
    //making offers in category an empty array
    category.offers = [];
    await category.save()
    
    const products = await Product.find({category_id:categoryId});

    //making offrs in products an empty array
    products.forEach(async (product) => {
      product.offerPrice = product.actualPrice;
      product.offers = []
      await product.save()
    })

    res.json({ message: "Category offer removed" });
  } catch (error) {
    console.log(error.message);
    console.log("Unable to remove offer");
  }
};


//Deleting offer function
const deleteOfferFn = async (req,res)=>{

  try {
    const { offerId } = req.body;
    
    await Offer.deleteOne({_id:offerId})
   
    res.json({ message: "Offer Deleted Successfully" });
  } catch (error) {
    res.json({ fmessage: "Unable to delete the offer" });
  }
}



module.exports = {
  loadOfferPage,
  addNewOffer,
  applyOfferToProduct,
  removeProdOfferFn,
  applyOfferToCategory,
  removeCategoryOfferFn,
  deleteOfferFn
};
