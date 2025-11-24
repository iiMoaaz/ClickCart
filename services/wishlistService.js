const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Product added to wishlist successfully',
    data: user.wishlist,
  });
});

// @desc    Remove product to wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Protected/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Product removed from wishlist successfully',
    data: user.wishlist,
  });
});
