const asyncHandler = require('express-async-handler');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/apiError');
const Product = require('../models/productModel');
const factory = require('./handlersFactory');
const { uploadMixOfImgs } = require('../middlewares/uploadImgMidlleware');

/** Img Uploading **/
exports.uploadProductImages = uploadMixOfImgs([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 5,
  },
]);
// img processing
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // 1) Image Processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `products-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/imageCover/${imageCoverFileName}`);

    // save image into DB
    req.body.imageCover = imageCoverFileName;
  }

  // 2) Image Processing for images
  if (req.files.images) {
    req.body.images = [];

    // Logic
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `products-${uuidv4()}-${Date.now()}-${
          index + 1
        }.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/images/${imageName}`);

        // save image into DB
        req.body.images.push(imageName);
      })
    );
  }

  next();
});

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(Product, 'products');

// @desc    Get specific product by id
// @route   GET /api/v1/productss/:id
// @access  Public
exports.getProduct = factory.getOne(Product, 'reviews');

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private
exports.createProduct = factory.createOne(Product);

// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);
