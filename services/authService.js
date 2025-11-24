const crypto = require('crypto');
const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

// generate token
const generateToken = (payload) => {
  return jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

// @desc    Signup
// @route   GET /api/v1/auth/signup
// @desc    Public
exports.signup = asynchandler(async (req, res, next) => {
  // 1) Create User
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2) Generate Token
  const token = generateToken(user._id);

  // 3) send
  res.status(201).json({ data: user, token });
});

// @desc    Login
// @route   GET /api/v1/auth/login
// @desc    Public
exports.login = asynchandler(async (req, res, next) => {
  // check user
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect email or password', 401));
  }

  // 2) Generate Token
  const token = generateToken(user._id);

  // 3) send
  res.status(200).json({ data: user, token });
});

// @desc makes sure user is logged
exports.protect = asynchandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError('This account does not exist, please signup'));
  }

  // 2) verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) check if user exists
  const user = await User.findById(decoded.userId);

  if (!user) return next(new ApiError('No User for this token', 401));

  // 4) Check if user updated his password after token created
  if (user.passwordUpdatedAt) {
    const passwordUpdateTime = parseInt(
      user.passwordUpdatedAt.getTime() / 1000,
      10
    );

    if (passwordUpdateTime > decoded.iat) {
      return next(
        new ApiError(
          'User password has been changed recently, please login again',
          401
        )
      );
    }
  }

  // attach cuurent user in requset object
  req.user = user;

  next();
});

// @desc   Authorization (User Permissions)
exports.allowedTo = (...roles) =>
  asynchandler(async (req, res, next) => {
    // 1) access roels => parameter (...rest)
    // 2) access registered user => (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      );
    }

    next();
  });

// @desc    Forget password
// @route   POST /api/v1/auth/forgotpassword
// @desc    Public
exports.forgotPassword = asynchandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError('No User for this email, please try again'), 404);
  }

  // 2) if user exists => Generate has reset random 6 digits => save in db
  // Generate
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hased reset code
  user.passwordResetCode = hashedResetCode;
  // Add Expiration time for reset code (10 min)
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  // Add passwordResetVerified Status
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send the reset code via email
  const message = `Hi ${user.name}, \nWe have recieved a request to reset the password on your E_Commerce Account.\n ${resetCode} \nEnter this code to emplete the reset \nThanks.`;

  await sendEmail({
    email: user.email,
    subject: 'Your password reset code (valid for 10 min)',
    message,
  });

  res
    .status(200)
    .json({ status: 'Success', message: 'Reset Code sent to email' });
});

// @desc    Verify reset password code
// @route   POST /api/v1/auth/verifyPassResetCode
// @desc    Public
exports.verifyPassResetCode = asynchandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode.toString())
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError('Reset code invalid or expired', 404));
  }

  // 2) Reser code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: 'Success' });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @desc    Public
exports.resetPassword = asynchandler(async (req, res, next) => {
  // Get User based on email
  const user = await User.findOne({ email: req.body.email });
  console.log(1);

  if (!user) {
    return next(new ApiError('Reset code invalid or expired', 404));
  }
  console.log(2);

  // check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError('Reset code not verified'));
  }
  console.log(3);

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetVerified = undefined;
  console.log(4);

  await user.save();

  console.log(5);
  // Generate Token
  const token = generateToken(user.id);
  console.log(6);
  res.status(200).json({ token });
});
