const { check, body } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  validatorMiddleware,
];

exports.createBrandValidator = [
  check('name')
    .notEmpty()
    .withMessage('Brand required')
    .isLength({ min: 3 })
    .withMessage('Too short Brand name')
    .isLength({ max: 32 })
    .withMessage('Too long Brand name')
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  body('name')
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  validatorMiddleware,
];
