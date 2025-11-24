const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const Coupon = require('../models/couponModel');

// @desc    Get list of coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin-Manager
exports.getCoupons = factory.getAll(Coupon);

// @desc    Get specific coupons by id
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.getCoupon = factory.getOne(Coupon);

// @desc    Create coupons
// @route   POST  /api/v1/coupons
// @access  Private/Admin-Manager
exports.createCoupon = factory.createOne(Coupon);

// @desc    Update specific coupons
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc    Delete specific coupons
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);
