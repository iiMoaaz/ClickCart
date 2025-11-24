const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer();

// services
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  uploadUserImage,
  resizeImg,
} = require('../services/userService');
// validators
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateUserPasswordValidator,
} = require('../utils/validators/userValidator');
// Auth
const authService = require('../services/authService');

router
  .route('/')
  .get(/* authService.protect, authService.allowedTo('admin'), */ getUsers)
  .post(
    authService.protect,
    authService.allowedTo('admin'),
    uploadUserImage,
    resizeImg,
    createUserValidator,
    createUser
  );
router
  .route('/:id')
  .get(
    authService.protect,
    authService.allowedTo('admin'),
    getUserValidator,
    getUser
  )
  .put(
    authService.protect,
    authService.allowedTo('admin'),
    uploadUserImage,
    resizeImg,
    updateUserValidator,
    updateUser
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteUserValidator,
    deleteUser
  );

// Update user password  route
router.put(
  '/updatePassword/:id',
  updateUserPasswordValidator,
  updateUserPassword
);

module.exports = router;
