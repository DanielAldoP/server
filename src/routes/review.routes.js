const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const reviewController = require('../controllers/review.controller');
const { validateRequest } = require('../middleware/validation.middleware');
const {
  createReviewValidation,
  updateReviewValidation
} = require('../validators/review.validator');

// Protected routes - customers
router.post('/', auth, validateRequest(createReviewValidation), reviewController.createReview);
router.get('/my', auth, reviewController.getMyReviews);
router.put('/:id', auth, validateRequest(updateReviewValidation), reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

// Public routes
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

module.exports = router;