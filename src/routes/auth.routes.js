const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const { validateDynamic } = require('../middleware/dynamic-validation.middleware');

// Public routes
router.post('/register', validateDynamic('auth.register'), authController.register);
router.post('/login', validateDynamic('auth.login'), authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, validateDynamic('auth.updateProfile'), authController.updateProfile);
router.put('/change-password', auth, validateDynamic('auth.changePassword'), authController.changePassword);

module.exports = router;