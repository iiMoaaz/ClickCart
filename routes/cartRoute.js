const express = require('express');

const router = express.Router();

// services
const {
  addProductToCart,
  getLoggedUserCart,
  removeCartItem,
  clearCart,
  applyCoupon,
} = require('../services/cartService');
// Auth
const authService = require('../services/authService');

router.use(authService.protect, authService.allowedTo('user'));
router
  .route('/')
  .get(getLoggedUserCart)
  .post(addProductToCart)
  .delete(clearCart);
router.route('/:cartItemId').delete(removeCartItem);
router.route('/applyCoupon').put(applyCoupon);

module.exports = router;
