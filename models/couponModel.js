const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Coupon name required'],
      unique: [true, 'This coupon already exists'],
    },
    expire: {
      type: Date,
      required: [true, 'Coupon expiry date required'],
    },
    discount: {
      type: Number,
      required: [true, 'Coupon discount value required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
