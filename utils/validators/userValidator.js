const { check, body } = require('express-validator');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.createUserValidator = [
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

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number, only EG & SA are allowed'),

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

  check('profileImg').optional(),
  check('role').optional(),

  validatorMiddleware,
];

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('name')
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val) => {
      const result = await User.findOne({ email: val });
      if (!result) {
        return Promise.reject(new Error('E-mail is already exist'));
      }
    }),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number, only EG & SA are allowed'),

  check('profileImg').optional(),
  check('role').optional(),
  validatorMiddleware,
];

exports.updateUserPasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password requried'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirmation password requried'),

  body('password')
    .notEmpty()
    .withMessage('Password required')
    .custom(async (value, { req }) => {
      // 1) Verify Current Paswword
      const user = await User.findById(req.params.id);

      if (!user) {
        throw new Error('No user found for this ID');
      }

      const isCurrentPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isCurrentPassword) {
        throw new Error('Incorrect current password');
      }

      // 2) Verify Paswword Confirmation
      if (value !== req.body.confirmPassword) {
        throw new Error('Passowrd Confirmation incorrect');
      }

      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware,
];
