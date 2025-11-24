const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const factory = require('./handlersFactory');
const { uploadSingleImg } = require('../middlewares/uploadImgMidlleware');

/** Img Upload **/
exports.uploadUserImage = uploadSingleImg('profileImg');
// img processing
exports.resizeImg = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // save img to DB
    req.body.profileImg = filename;
  }

  next();
});

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private
exports.createUser = factory.createOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const document = await User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }

  res.status(200).json({ data: document });
});

// @desc    Update specific user passowrd
// @route   PUT /api/v1/users/updatePassword/:id
// @access  Private
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const document = await User.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordUpdatedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }

  res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = factory.deleteOne(User);
