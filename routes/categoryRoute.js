const express = require('express');

const router = express.Router();

// validators
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');
// services
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImg,
  resizeImg,
} = require('../services/categoryService');
// Auth
const authService = require('../services/authService');

const subcategoriesRoute = require('./subCategoryRoute');

router.use('/:categoryId/subcategories', subcategoriesRoute);

router
  .route('/')
  .get(getCategories)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadCategoryImg,
    resizeImg,
    createCategoryValidator,
    createCategory
  );
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .put(
    authService.protect,
    authService.allowedTo('manager', 'admin'),
    uploadCategoryImg,
    resizeImg,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo('manager'),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
