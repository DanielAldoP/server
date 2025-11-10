const { Review, DailyOrder, User, Restaurant, Order } = require('../models');
const { NotFoundError, ForbiddenError, ValidationError } = require('../helpers/error.helper');
const { validateNumber, validateRequired } = require('../helpers/validation.helper');

class ReviewService {
  static async createReview(reviewData, customer_id) {
    const { daily_order_id, rating, review } = reviewData;

    validateRequired(daily_order_id, 'Daily order ID');
    validateNumber(rating, 'Rating', 1, 5);

    // Check if daily order exists and belongs to the user
    const dailyOrder = await DailyOrder.findByPk(daily_order_id, {
      include: [
        {
          model: Order,
          as: 'order',
          where: { customer_id }
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!dailyOrder) {
      throw new NotFoundError('Daily order');
    }

    if (dailyOrder.status !== 'delivered') {
      throw new ValidationError('Can only review delivered orders');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: { customer_id, daily_order_id }
    });

    if (existingReview) {
      throw new ValidationError('You have already reviewed this order');
    }

    // Create review
    const newReview = await Review.create({
      customer_id,
      restaurant_id: dailyOrder.restaurant_id,
      daily_order_id,
      rating,
      review
    });

    // Get created review with associations
    const createdReview = await Review.findByPk(newReview.id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['name']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name']
        }
      ]
    });

    return createdReview;
  }

  static async getRestaurantReviews(restaurant_id, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    const { count, rows } = await Review.findAndCountAll({
      where: { restaurant_id, is_active: true },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['name']
        },
        {
          model: DailyOrder,
          as: 'daily_order',
          attributes: ['delivery_date']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Calculate average rating
    const avgRating = await Review.findOne({
      where: { restaurant_id, is_active: true },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating']
      ]
    });

    return {
      reviews: rows,
      averageRating: avgRating?.dataValues.averageRating || 0,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async getMyReviews(customer_id, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: { customer_id },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        },
        {
          model: DailyOrder,
          as: 'daily_order',
          attributes: ['delivery_date', 'totalAmount']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      reviews: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async updateReview(id, updateData, customer_id) {
    const { rating, review } = updateData;

    const existingReview = await Review.findOne({
      where: { id, customer_id }
    });

    if (!existingReview) {
      throw new NotFoundError('Review');
    }

    const updateObj = {};
    if (rating !== undefined) {
      validateNumber(rating, 'Rating', 1, 5);
      updateObj.rating = rating;
    }
    if (review !== undefined) {
      updateObj.review = review;
    }

    await existingReview.update(updateObj);

    // Get updated review with associations
    const updatedReview = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['name']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name']
        }
      ]
    });

    return updatedReview;
  }

  static async deleteReview(id, userId, userRole) {
    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id']
            }
          ]
        }
      ]
    });

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Check permissions (customer who wrote the review, restaurant owner, or admin)
    const canDelete = review.customer_id === userId ||
                     review.restaurant.owner.id === userId ||
                     userRole === 'admin';

    if (!canDelete) {
      throw new ForbiddenError('You can only delete your own reviews or reviews for your restaurants');
    }

    // Soft delete by setting is_active to false
    await review.update({ is_active: false });

    return { message: 'Review deleted successfully' };
  }

  static async validateReviewEligibility(customer_id, daily_order_id) {
    const dailyOrder = await DailyOrder.findByPk(daily_order_id, {
      include: [
        {
          model: Order,
          as: 'order',
          where: { customer_id }
        }
      ]
    });

    if (!dailyOrder) {
      throw new NotFoundError('Daily order');
    }

    if (dailyOrder.status !== 'delivered') {
      throw new ValidationError('Can only review delivered orders');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: { customer_id, daily_order_id }
    });

    if (existingReview) {
      throw new ValidationError('You have already reviewed this order');
    }

    return dailyOrder;
  }

  static async getReviewStats(restaurant_id) {
    const stats = await Review.findOne({
      where: { restaurant_id, is_active: true },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReviews'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating = 5 THEN 1 END')), 'fiveStarReviews'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating >= 4 THEN 1 END')), 'fourPlusStarReviews']
      ]
    });

    return {
      totalReviews: parseInt(stats.dataValues.totalReviews || 0),
      averageRating: parseFloat(stats.dataValues.averageRating || 0),
      fiveStarReviews: parseInt(stats.dataValues.fiveStarReviews || 0),
      fourPlusStarReviews: parseInt(stats.dataValues.fourPlusStarReviews || 0)
    };
  }

  static async getCustomerReviewStats(customer_id) {
    const stats = await Review.findOne({
      where: { customer_id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReviews'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating']
      ]
    });

    return {
      totalReviews: parseInt(stats.dataValues.totalReviews || 0),
      averageRating: parseFloat(stats.dataValues.averageRating || 0)
    };
  }

  static async validateReviewOwnership(reviewId, userId) {
    const review = await Review.findOne({
      where: { id: reviewId, customer_id: userId }
    });

    if (!review) {
      throw new ForbiddenError('You can only access your own reviews');
    }

    return review;
  }
}

module.exports = ReviewService;