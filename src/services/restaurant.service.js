const { Restaurant, RestaurantWallet, User, Menu, DailyMenu, Review } = require('../models');
const { createNotification } = require('../helpers/notification.helper');
const { NotFoundError, ForbiddenError, ValidationError } = require('../helpers/error.helper');

class RestaurantService {
  static async createRestaurant(restaurantData, owner_id) {
    const { name, full_address, city, description, photo } = restaurantData;

    // Create restaurant
    const restaurant = await Restaurant.create({
      owner_id,
      name,
      full_address,
      city,
      description,
      photo,
      status: 'pending_verification'
    });

    // Create restaurant wallet
    await RestaurantWallet.create({
      restaurant_id: restaurant.id,
      balance: 0.00
    });

    // Notify admin about new restaurant registration
    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    for (const admin of adminUsers) {
      await createNotification(
        admin.id,
        `New restaurant "${name}" is pending verification`,
        'restaurant_approved',
        null,
        null
      );
    }

    return restaurant;
  }

  static async getRestaurants(page = 1, limit = 20, city) {
    const offset = (page - 1) * limit;

    const where = { status: 'active' };
    if (city) {
      where.city = city;
    }

    const { count, rows } = await Restaurant.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'phone_number']
        },
        {
          model: RestaurantWallet,
          as: 'wallet',
          attributes: ['balance']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      restaurants: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async getRestaurantById(id, userCity, userRole, userId) {
    const restaurant = await Restaurant.findOne({
      where: {
        id,
        status: 'active',
        city: userCity
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name']
        },
        {
          model: Menu,
          as: 'menus',
          where: { is_active: true },
          required: false
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['name']
            }
          ]
        }
      ]
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    // Mask address for non-owners and non-admins
    if (userRole !== 'admin' && userId !== restaurant.owner_id) {
      restaurant.full_address = `${restaurant.city} (Address hidden for privacy)`;
    }

    return restaurant;
  }

  static async updateRestaurant(id, updateData, userId, userRole) {
    const { name, full_address, city, description, photo } = updateData;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    // Check permissions
    if (userRole !== 'admin' && restaurant.owner_id !== userId) {
      throw new ForbiddenError('You can only update your own restaurants');
    }

    // Update restaurant
    await restaurant.update({
      ...(name && { name }),
      ...(full_address && { full_address }),
      ...(city && { city }),
      ...(description !== undefined && { description }),
      ...(photo !== undefined && { photo })
    });

    return restaurant;
  }

  static async getMyRestaurants(owner_id, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Restaurant.findAndCountAll({
      where: { owner_id },
      include: [
        {
          model: RestaurantWallet,
          as: 'wallet',
          attributes: ['balance']
        },
        {
          model: Menu,
          as: 'menus',
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      restaurants: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async verifyRestaurant(id, status, rejection_reason) {
    // Basic validation is handled by middleware

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    await restaurant.update({
      status,
      rejection_reason: status === 'rejected' ? rejection_reason : null
    });

    // Notify restaurant owner
    await createNotification(
      restaurant.owner_id,
      `Your restaurant "${restaurant.name}" has been ${status}`,
      `restaurant_${status}`,
      null,
      null
    );

    return restaurant;
  }

  static async getRestaurantForManagement(restaurant_id, userId, userRole) {
    const whereClause = { id: restaurant_id };

    // Only add ownership constraint for non-admin users
    if (userRole !== 'admin') {
      whereClause.owner_id = userId;
    }

    const restaurant = await Restaurant.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone_number']
        },
        {
          model: RestaurantWallet,
          as: 'wallet',
          attributes: ['balance']
        },
        {
          model: Menu,
          as: 'menus',
          required: false
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['name']
            }
          ]
        }
      ]
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    return restaurant;
  }

  static async getRestaurantStats(restaurant_id, userId, userRole) {
    // Verify restaurant ownership
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    if (userRole !== 'admin' && restaurant.owner_id !== userId) {
      throw new ForbiddenError('You can only view stats for your own restaurants');
    }

    // Get menu statistics
    const menuStats = await Menu.findOne({
      where: { restaurant_id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalMenus'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN is_active = true THEN 1 END')), 'activeMenus'],
        [require('sequelize').fn('AVG', require('sequelize').col('price')), 'averagePrice']
      ]
    });

    // Get review statistics
    const reviewStats = await Review.findOne({
      where: { restaurant_id, is_active: true },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReviews'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating']
      ]
    });

    // Get daily order statistics
    const dailyOrderStats = await require('../models').DailyOrder.findOne({
      where: { restaurant_id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalOrders'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = \'delivered\' THEN 1 END')), 'completedOrders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'totalRevenue']
      ]
    });

    return {
      menus: {
        total: parseInt(menuStats.dataValues.totalMenus || 0),
        active: parseInt(menuStats.dataValues.activeMenus || 0),
        averagePrice: parseFloat(menuStats.dataValues.averagePrice || 0)
      },
      reviews: {
        total: parseInt(reviewStats.dataValues.totalReviews || 0),
        averageRating: parseFloat(reviewStats.dataValues.averageRating || 0)
      },
      orders: {
        total: parseInt(dailyOrderStats.dataValues.totalOrders || 0),
        completed: parseInt(dailyOrderStats.dataValues.completedOrders || 0),
        totalRevenue: parseFloat(dailyOrderStats.dataValues.totalRevenue || 0)
      }
    };
  }

  static async validateRestaurantOwnership(restaurant_id, userId, userRole) {
    const restaurant = await Restaurant.findByPk(restaurant_id);

    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    if (userRole !== 'admin' && restaurant.owner_id !== userId) {
      throw new ForbiddenError('You can only access your own restaurants');
    }

    return restaurant;
  }

  static async deactivateRestaurant(restaurant_id, userId, userRole) {
    const restaurant = await this.validateRestaurantOwnership(restaurant_id, userId, userRole);

    await restaurant.update({ status: 'inactive' });

    // Notify restaurant owner
    await createNotification(
      restaurant.owner_id,
      `Your restaurant "${restaurant.name}" has been deactivated`,
      'restaurant_deactivated',
      null,
      null
    );

    return restaurant;
  }

  static async activateRestaurant(restaurant_id, userId, userRole) {
    const restaurant = await this.validateRestaurantOwnership(restaurant_id, userId, userRole);

    await restaurant.update({ status: 'active' });

    // Notify restaurant owner
    await createNotification(
      restaurant.owner_id,
      `Your restaurant "${restaurant.name}" has been activated`,
      'restaurant_activated',
      null,
      null
    );

    return restaurant;
  }
}

module.exports = RestaurantService;