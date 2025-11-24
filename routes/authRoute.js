const express = require('express');

const router = express.Router();

const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require('../services/authService');
const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyPassResetCode', verifyPassResetCode);
router.put('/resetPassword', resetPassword);

module.exports = router;
