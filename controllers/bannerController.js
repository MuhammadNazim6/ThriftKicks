
const BannerModel = require('../models/bannerModel')

const Banner = BannerModel.Banner;




///loading banners
const loadBanners = async (req,res)=>{
  try {
    const banner = await Banner.find()
    res.render('admin/banners',{banner})
  } catch (error) {
    res.status(404).render('users/404') 
  }
}


//Adding banner function
const addBanner = async (req,res)=>{
  try {
    const image = req.file; // Access the uploaded image file

    // Access other form fields in req.body
    const titleValue = req.body.titleValue;
    const descrValue = req.body.descrValue;
    const link = req.body.link;

    imagePath = image.path.slice(6);

    const banner = new Banner({
      imageUrl: imagePath,
      title: titleValue,
      description: descrValue,
      href: link,

    })
    const newBanner = await banner.save()
    res.json({success:"Banner added"})

  } catch (error) {
    console.log("Unable to add Banner");
  }
}


//unlist banner fn
const unlistBannerFn = async (req,res)=>{
  try {
    const {bannerId} = req.body;
    const banner = await Banner.findById(bannerId)

    banner.is_listed = false;
    await banner.save()

    res.json({ message: "Banner Unlisted successfully" });

  } catch (error) {
    console.log("Unable to unlist Banner");
  }
}

//list banner fn
const listBannerFn = async (req,res)=>{
  try {
    const {bannerId} = req.body;
    const banner = await Banner.findById(bannerId)

    banner.is_listed = true;
    await banner.save()

    res.json({ message: "Banner listed successfully" });

  } catch (error) {
    console.log("Unable to list Banner");
  }
}

//delete banner 
const deleteBannerFn = async(req,res)=>{
  try {
    const {bannerId} = req.body
    const banner = await Banner.deleteOne({_id:bannerId})
    res.json({message:'Banner deleted successfully'})

  } catch (error) {
    console.log('Unable to delete banner');
  }
}



module.exports = {
  loadBanners,
  addBanner,
  unlistBannerFn,
  listBannerFn,
  deleteBannerFn

};