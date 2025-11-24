const express = require('express');

const router = express.Router();

// services
const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImg,
  resizeImg,
} = require('../services/brandService');
// validators
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../utils/validators/brandValidator');
// Auth
const authService = require('../services/authService');

router
  .route('/')
  .get(getBrands)
  .post(
    authService.protect,
    authService.allowedTo('manager', 'admin'),
    uploadBrandImg,
    resizeImg,
    createBrandValidator,
    createBrand
  );
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .put(
    authService.protect,
    authService.allowedTo('manager', 'admin'),
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authService.protect,
    authService.allowedTo('manager'),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
