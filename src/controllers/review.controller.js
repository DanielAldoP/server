const ReviewService = require('../services/review.service');
const { successResponse } = require('../helpers/response.helper');

const createReview = async (req, res, next) => {
  try {
    const { daily_order_id, rating, review } = req.body;
    const customer_id = req.user.id;

    const createdReview = await ReviewService.createReview({
      daily_order_id, rating, review
    }, customer_id);

    res.status(201).json(successResponse(createdReview, 'Review created successfully'));
  } catch (error) {
    next(error);
  }
};

const getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurant_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await ReviewService.getRestaurantReviews(restaurant_id, page, limit);

    res.json(successResponse(result, 'Restaurant reviews retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (req, res, next) => {
  try {
    const customer_id = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await ReviewService.getMyReviews(customer_id, page, limit);

    res.json(successResponse(result, 'Your reviews retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const customer_id = req.user.id;

    const updatedReview = await ReviewService.updateReview(id, {
      rating, review
    }, customer_id);

    res.json(successResponse(updatedReview, 'Review updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const result = await ReviewService.deleteReview(id, user_id, userRole);

    res.json(successResponse(result, 'Review deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getRestaurantReviews,
  getMyReviews,
  updateReview,
  deleteReview
};