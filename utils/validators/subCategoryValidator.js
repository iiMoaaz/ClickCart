const { check, body } = require('express-validator');
const { default: slugify } = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory id format'),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('SubCategory required')
    .isLength({ min: 2 })
    .withMessage('Too short Subcategory name')
    .isLength({ max: 32 })
    .withMessage('Too long Subcategory name')
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check('category')
    .notEmpty()
    .withMessage('subCategory must be belong to category')
    .isMongoId()
    .withMessage('Invalid Category id format'),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory id format'),
  body('name')
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid SubCategory id format'),
  validatorMiddleware,
];
