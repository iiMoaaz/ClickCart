const express = require('express');

const router = express.Router();

// Service
const { addAddress, removeAddress } = require('../services/addressService');
// Auth
const authService = require('../services/authService');

// Routes
router.post(
  '/',
  authService.protect,
  authService.allowedTo('user'),
  addAddress
);

router.delete(
  '/:addressId',
  authService.protect,
  authService.allowedTo('user'),
  removeAddress
);

module.exports = router;
