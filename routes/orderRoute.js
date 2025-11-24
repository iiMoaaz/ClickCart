const express = require('express');
// services
const {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require('../services/orderService');
// Auth
const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);

// Get Checkout Session
router.get(
  '/checkout-session/:id',
  authService.allowedTo('user'),
  checkoutSession
);

router.post('/:cartId', createCashOrder);
router.get('/:id', getSpecificOrder);
router.get('/', filterOrderForLoggedUser, getAllOrders);
router.put(
  '/:id/pay',
  authService.allowedTo('admin', 'manager'),
  updateOrderToPaid
);
router.put(
  '/:id/deliver',
  authService.allowedTo('admin', 'manager'),
  updateOrderToDelivered
);
module.exports = router;
