const UserAddressModel = require("../models/userModel");
const User = UserAddressModel.User;

const isBlocked = async (req,res,next)=>{
  try {
    if(req.session.user_id){
      const user = await User.findOne({_id:req.session.user_id})
      if(user.isBlocked){
        res.render('users/blocked')
      }

    }

    next()
    
  } catch (error) {
    console.log(error.message);
  }
}




module.exports = {
  isBlocked
};
