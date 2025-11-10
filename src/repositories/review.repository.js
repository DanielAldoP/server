const BaseRepository = require('./base.repository');
const { Review, User, DailyOrder, Restaurant } = require('../models');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByIdWithDetails(id) {
    return await this.findById(id, {
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
  }

  async findByRestaurant(restaurant_id, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ restaurant_id, is_active: true, ...filters });

    const { data, pagination } = await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['name']
        },
        {
          model: DailyOrder,
          as: 'dailyOrder',
          attributes: ['delivery_date']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate average rating
    const avgRating = await this.findOne({
      where: { restaurant_id, is_active: true },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating']
      ]
    });

    return {
      reviews: data,
      averageRating: avgRating?.dataValues?.averageRating || 0,
      pagination
    };
  }

  async findByCustomer(customer_id, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ customer_id, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        },
        {
          model: DailyOrder,
          as: 'dailyOrder',
          attributes: ['delivery_date', 'total_amount']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async createReview(reviewData) {
    return await this.transaction(async (t) => {
      const review = await this.create(reviewData, { transaction: t });
      return await this.findByIdWithDetails(review.id);
    });
  }

  async updateReview(id, updateData) {
    const { rating, review } = updateData;

    const updateFields = {};
    if (rating !== undefined) updateFields.rating = rating;
    if (review !== undefined) updateFields.review = review;

    await this.update(updateFields, { id });

    return await this.findByIdWithDetails(id);
  }

  async softDelete(id) {
    return await this.update({ is_active: false }, { id });
  }

  async validateReviewEligibility(customer_id, daily_order_id) {
    const dailyOrder = await DailyOrder.findByPk(daily_order_id, {
      include: [
        {
          model: Review,
          as: 'reviews',
          where: { customer_id }
        }
      ]
    });

    if (!dailyOrder) {
      throw new Error('Daily order not found');
    }

    if (dailyOrder.status !== 'delivered') {
      throw new Error('Can only review delivered orders');
    }

    if (dailyOrder.reviews && dailyOrder.reviews.length > 0) {
      throw new Error('You have already reviewed this order');
    }

    return dailyOrder;
  }

  async getReviewStats(restaurant_id) {
    const stats = await this.findOne({
      where: { restaurant_id, is_active: true },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReviews'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating = 5 THEN 1 END')), 'fiveStarReviews'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating >= 4 THEN 1 END')), 'fourPlusStarReviews']
      ]
    });

    return {
      totalReviews: parseInt(stats?.dataValues?.totalReviews || 0),
      averageRating: parseFloat(stats?.dataValues?.averageRating || 0),
      fiveStarReviews: parseInt(stats?.dataValues?.fiveStarReviews || 0),
      fourPlusStarReviews: parseInt(stats?.dataValues?.fourPlusStarReviews || 0)
    };
  }

  async getCustomerReviewStats(customer_id) {
    const stats = await this.findOne({
      where: { customer_id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReviews'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating']
      ]
    });

    return {
      totalReviews: parseInt(stats?.dataValues?.totalReviews || 0),
      averageRating: parseFloat(stats?.dataValues?.averageRating || 0)
    };
  }

  async validateReviewOwnership(review_id, user_id) {
    const review = await this.findOne({
      where: { id: review_id, customer_id: user_id }
    });

    if (!review) {
      throw new Error('You can only access your own reviews');
    }

    return review;
  }

  async validateDeletePermission(review_id, user_id, user_role) {
    const review = await this.findById(review_id, {
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
      throw new Error('Review not found');
    }

    const canDelete = review.customer_id === user_id ||
                     review.restaurant.owner.id === user_id ||
                     user_role === 'admin';

    if (!canDelete) {
      throw new Error('You can only delete your own reviews or reviews for your restaurants');
    }

    return review;
  }

  async transaction(callback) {
    const sequelize = require('../models').sequelize;
    return await sequelize.transaction(callback);
  }
}

module.exports = new ReviewRepository();