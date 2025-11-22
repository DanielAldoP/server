const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const restaurantController = require('../controllers/restaurant.controller');
const { validateDynamic } = require('../middleware/dynamic-validation.middleware');

// Public routes
router.get('/', restaurantController.getRestaurants);
router.get('/:id', auth, restaurantController.getRestaurantById);

// Protected routes - merchants only
router.post('/', auth, authorize('merchant'), validateDynamic('restaurant.create'), restaurantController.createRestaurant);
router.get('/my/restaurants', auth, authorize('merchant'), restaurantController.getMyRestaurants);
router.put('/:id', auth, authorize('merchant'), validateDynamic('restaurant.update'), restaurantController.updateRestaurant);

// Admin only routes
router.put('/:id/verify', auth, authorize('admin'), validateDynamic('restaurant.verify'), restaurantController.verifyRestaurant);

module.exports = router;