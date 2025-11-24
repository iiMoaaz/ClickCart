const express = require('express');

const router = express.Router({ mergeParams: true });

// services
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
} = require('../services/reviewService');
// validators
const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviewValidator');
// Auth
const authService = require('../services/authService');

router
  .route('/')
  .get(createFilterObj, getReviews)
  .post(
    authService.protect,
    authService.allowedTo('user'),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo('user'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin', 'manager', 'user'),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
