const { check } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.signupValidator = [
  check('name')
    .notEmpty()
    .withMessage('User name required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val) => {
      const result = await User.findOne({ email: val });
      if (result) {
        return Promise.reject(new Error('E-mail is already exist'));
      }
    }),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 character')
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        console.log(req.body.passwordConfirm);
        throw new Error('Password Confirmation incorrect');
      }

      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation requried'),

  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address'),
  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 character'),
  validatorMiddleware,
];
