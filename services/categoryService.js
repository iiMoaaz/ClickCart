const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const Category = require('../models/categoryModel');
const factory = require('./handlersFactory');
const { uploadSingleImg } = require('../middlewares/uploadImgMidlleware');

/** Imgs Upload **/
exports.uploadCategoryImg = uploadSingleImg('image');
// resize img - Sharp
exports.resizeImg = asyncHandler(async (req, res, next) => {
  const filename = `categories-${uuidv4()}-${Date.now()}.jpeg `;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);
  }

  // save img into DB
  req.body.image = filename;

  next();
});

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = factory.getAll(Category);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
