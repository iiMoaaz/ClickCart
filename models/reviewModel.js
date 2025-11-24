const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    ratings: {
      type: Number,
      required: [true, 'review ratings required'],
      min: [1, 'minimum rating value 1.0'],
      max: [5, 'maximum rating value 5.0'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name profileImg' });

  next();
});

// Calculate Quantity And AvgRatings
reviewSchema.statics.calcQuantityAndAvgRatings = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },

    {
      $group: {
        _id: 'product',
        avgRatings: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findOneAndUpdate(productId, {
      ratingsQuantity: result[0].ratingsQuantity,
      ratingsAverage: result[0].avgRatings,
    });
  }
};

// Trigger
reviewSchema.post('save', async function (doc) {
  await this.constructor.calcQuantityAndAvgRatings(doc.product);
});
reviewSchema.post('remove', async function (doc) {
  await this.constructor.calcQuantityAndAvgRatings(doc.product);
});

module.exports = mongoose.model('Review', reviewSchema);
