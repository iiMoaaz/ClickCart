const express = require('express');

// mergeParams: Allow us to access parameters on other routers
// ex: We need to access categoryId from category router
const router = express.Router({ mergeParams: true });

// services
const {
  createSubCategory,
  getSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
} = require('../services/subCategoryService');
// validators
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require('../utils/validators/subCategoryValidator');
// Auth
const authService = require('../services/authService');

router
  .route('/')
  .post(
    authService.protect,
    authService.allowedTo('manager', 'admin'),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObj, getSubCategories);
router
  .route('/:id')
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authService.protect,
    authService.allowedTo('manager', 'admin'),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo('manager'),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
