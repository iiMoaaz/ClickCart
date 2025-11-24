const { check, body } = require('express-validator');
const Review = require('../../models/reviewModel');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createReviewValidator = [
  check('title').optional(),
  check('ratings')
    .notEmpty()
    .withMessage('ratings value required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('ratings value must be between 1 to 5'),
  check('user').isMongoId().withMessage('Invalid review ID format'),
  check('product')
    .isMongoId()
    .withMessage('Invalid review ID format')
    .custom(async (value, { req }) => {
      // check if logged user create review before
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });

      if (review) {
        throw new Error('You have already create a review for this product');
      }
    }),
  validatorMiddleware,
];
exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review id format'),
  validatorMiddleware,
];
exports.updateReviewValidator = [
  body('title').optional(),
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (value, { req }) => {
      // check review ownership before update
      const review = await Review.findById(value);

      if (!review) {
        throw new Error('No review with this id');
      }
      if (review.user._id.toString() !== req.user._id.toString())
        throw new Error("You cant modify someone else's review");
    }),
  check('ratings')
    .optional()
    .isFloat({ min: 1.0, max: 5.0 })
    .withMessage('Ratings must be a value between 1.0 to 5.0'),
  validatorMiddleware,
];
exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (value, { req }) => {
      if (req.user.role === 'user') {
        const review = await Review.findById(value);

        if (review.user.toString() === req.user._id.toString()) {
          throw new Error("You cant delete someone else's review");
        }
      }
      return true;
    }),
  validatorMiddleware,
];
