const express = require('express');

const router = express.Router();

// Service
const {
  addProductToWishlist,
  removeProductFromWishlist,
} = require('../services/wishlistService');
// Auth
const authService = require('../services/authService');

// Routes
router.post(
  '/',
  authService.protect,
  authService.allowedTo('user'),
  addProductToWishlist
);

router.delete(
  '/:productId',
  authService.protect,
  authService.allowedTo('user'),
  removeProductFromWishlist
);

module.exports = router;
