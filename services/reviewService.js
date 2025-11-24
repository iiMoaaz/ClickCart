const factory = require('./handlersFactory');
const Review = require('../models/reviewModel');

// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObj = {};

  if (req.params.productId) filterObj = { product: req.params.productId };
  if (req.params.reviewId) filterObj = { review: req.params.reviewId };

  req.filterObj = filterObj;

  next();
};

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// Nested Route
// POST /api/v1/product/:prodcutId/reviews
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  if (!req.body.product) req.body.product = req.params.productId;

  next();
};

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User | Admin | Manager
exports.deleteReview = factory.deleteOne(Review);
