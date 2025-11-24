const express = require('express');

const router = express.Router();

// validators
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require('../utils/validators/productValidator');
// services
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require('../services/productService');
// Auth
const authService = require('../services/authService');
// Route
const reviewsRoute = require('./reviewRoute');

// Nested Route
router.use('/:productId/reviews', reviewsRoute);
router.use('/:productId/reviews/:reviewId', reviewsRoute);

router
  .route('/')
  .get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo('manager', 'admin'),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo('manager', 'admin'),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo('manager'),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
