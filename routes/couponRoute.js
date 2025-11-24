const express = require('express');

const router = express.Router();

// services
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../services/couponService');
// Auth
const authService = require('../services/authService');

// Routes
router.use(authService.protect, authService.allowedTo('manager', 'admin'));

router.route('/').get(getCoupons).post(createCoupon);

router.route('/:id').get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
