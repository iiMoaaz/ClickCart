const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
// Models
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subCategoryModel');
const subCategoryModel = require('../../models/subCategoryModel');

exports.createProductValidator = [
  check('title')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars')
    .notEmpty()
    .withMessage('Product required')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Too long description'),
  check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check('sold')
    .optional()
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Product price must be a number')
    .isLength({ max: 32 })
    .withMessage('To long price'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('Product priceAfterDiscount must be a number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error('priceAfterDiscount must be lower than price');
      }
      return true;
    }),

  check('colors')
    .optional()
    .isArray()
    .withMessage('availableColors should be array of string'),
  check('imageCover').notEmpty().withMessage('Product imageCover is required'),
  check('images')
    .optional()
    .isArray()
    .withMessage('images should be array of string'),
  check('category')
    .notEmpty()
    .withMessage('Product must belong to a category')
    .isMongoId()
    .withMessage('Invalid ID format')
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);
      if (!category)
        return Promise.reject(
          new Error("The provided category id doesn't exist")
        );
    }),
  check('subcategories')
    .optional()
    .isMongoId()
    .withMessage('Invalid ID format')
    // Check if subcategories coming from body exist in DB
    .custom(async (value) => {
      const dbSubCategoriesIDs = (await SubCategory.find({}).select('_id')).map(
        (id) => id._id.toString()
      );
      const checker = value.every((subCategory) => {
        return dbSubCategoriesIDs.includes(subCategory);
      });

      if (!checker)
        return Promise.reject(
          new Error('One or more of the provided subcategories do not exist')
        );
    })
    // Redundancy checker
    .custom((value) => {
      const uniqueIDs = new Set(value.map((subCatId) => subCatId));

      if (uniqueIDs.size !== value.length)
        throw new Error('Duplicate subcategory IDs are not allowed');

      return true;
    })
    // Check if subcategories coming from body belong to parent category in DB
    .custom(async (value, { req }) => {
      const subCategories = await SubCategory.find({
        category: req.body.category,
      });

      // Extrcats only IDs
      const subCategoriesIDs = subCategories.map((subCategory) =>
        subCategory._id.toString()
      );

      const checker = value.every((subCategoryId) =>
        subCategoriesIDs.includes(subCategoryId)
      );

      if (!checker) {
        return Promise.reject(
          new Error(
            'The provided subcategories do not belong to the provided parent category'
          )
        );
      }
    }),
  check('brand').optional().isMongoId().withMessage('Invalid ID format'),
  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('ratingsAverage must be a number')
    .isLength({ min: 1 })
    .withMessage('Rating must be above or equal 1.0')
    .isLength({ max: 5 })
    .withMessage('Rating must be below or equal 5.0'),
  check('ratingsQuantity')
    .optional()
    .isNumeric()
    .withMessage('ratingsQuantity must be a number'),

  validatorMiddleware,
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  // check('category')
  //   .notEmpty()
  //   .withMessage('Product must belong to a category')
  //   .isMongoId()
  //   .withMessage('Invalid ID format')
  //   .custom(async (categoryId) => {
  //     const category = await Category.findById(categoryId);
  //     if (!category)
  //       return Promise.reject(
  //         new Error("The provided category id doesn't exist")
  //       );
  //   }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];
