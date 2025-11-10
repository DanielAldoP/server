const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validation.middleware');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../validators/auth.validator');

// Public routes
router.post('/register', validateRequest(registerValidation), authController.register);
router.post('/login', validateRequest(loginValidation), authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, validateRequest(updateProfileValidation), authController.updateProfile);
router.put('/change-password', auth, validateRequest(changePasswordValidation), authController.changePassword);

module.exports = router;