const mongoose = require ('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  shippingAddress: {
    country: {
      type: String,
      required: true,
    },
    houseName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String, 
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    }
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unitPrice:{
        type:Number,
        require: true
      },
      ProductOrderStatus: {
        type:String,
        require:true
      },
      returnOrderStatus:{
        status:{
          type:String
        },
        reason:{
          type:String
        },
        date:{
          type:Date,
        }
        
      }
    }
  ],
  OrderStatus:{
    type:String,
    require:true
  },
  StatusLevel:{
    type: Number,
    required: true
  },
  paymentStatus:{
    type:String,
    require:true
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod:{
    type:String,
    require:true
  },
  coupon:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  trackId:{
    type: String,
    require:true
  },
  updatedAt:{
    type:Date,
    default:Date.now
  }
})




const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount_amount: {
    type: Number,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  couponName: {
    type: String,
    require:true
  },
  minimumSpend: {
    type: Number,
    require:true
  },
  maxUsers: {
    type: Number,
    require:true
  },
  usersUsed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model for tracking users who used the coupon
    },
  ],
});




const Order = mongoose.model("Order",orderSchema);
const Coupon = mongoose.model("Coupon",couponSchema);

module.exports = {
  Order,
  Coupon

};
