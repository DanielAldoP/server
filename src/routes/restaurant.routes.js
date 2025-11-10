const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const restaurantController = require('../controllers/restaurant.controller');
const { validateRequest } = require('../middleware/validation.middleware');
const {
  createRestaurantValidation,
  updateRestaurantValidation,
  verifyRestaurantValidation
} = require('../validators/restaurant.validator');

// Public routes
router.get('/', restaurantController.getRestaurants);
router.get('/:id', auth, restaurantController.getRestaurantById);

// Protected routes - merchants only
router.post('/', auth, authorize('merchant'), validateRequest(createRestaurantValidation), restaurantController.createRestaurant);
router.get('/my/restaurants', auth, authorize('merchant'), restaurantController.getMyRestaurants);
router.put('/:id', auth, authorize('merchant'), validateRequest(updateRestaurantValidation), restaurantController.updateRestaurant);

// Admin only routes
router.put('/:id/verify', auth, authorize('admin'), validateRequest(verifyRestaurantValidation), restaurantController.verifyRestaurant);

module.exports = router;