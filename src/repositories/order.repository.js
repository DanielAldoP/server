const BaseRepository = require('./base.repository');
const { Order, DailyOrder, DailyOrderItem, User, Menu, Restaurant } = require('../models');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findByIdWithDetails(id, user_id = null, user_role = null) {
    const whereClause = { id };
    if (user_role === 'customer') {
      whereClause.customer_id = user_id;
    }

    return await this.findOne(whereClause, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone_number']
        },
        {
          model: DailyOrder,
          as: 'dailyOrders',
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name', 'city']
            },
            {
              model: DailyOrderItem,
              as: 'items',
              include: [
                {
                  model: Menu,
                  as: 'menu',
                  attributes: ['id', 'name', 'price', 'description']
                }
              ]
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
        }
      ]
    });
  }

  async findByCustomer(customer_id, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ customer_id, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: DailyOrder,
          as: 'dailyOrders',
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name', 'city']
            },
            {
              model: DailyOrderItem,
              as: 'items',
              include: [
                {
                  model: Menu,
                  as: 'menu',
                  attributes: ['id', 'name', 'price']
                }
              ]
            }
          ]
        },
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findAllOrders(page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause(filters);

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: DailyOrder,
          as: 'dailyOrders',
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async createOrder(orderData) {
    return await this.transaction(async (t) => {
      const order = await this.create(orderData, { transaction: t });
      return await this.findByIdWithDetails(order.id);
    });
  }

  async getOrderStats() {
    const stats = await this.findOne({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalOrders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'totalRevenue'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = \'paid\' THEN 1 END')), 'paidOrders']
      ]
    });

    return {
      totalOrders: parseInt(stats?.dataValues?.totalOrders || 0),
      totalRevenue: parseFloat(stats?.dataValues?.totalRevenue || 0),
      paidOrders: parseInt(stats?.dataValues?.paidOrders || 0)
    };
  }

  async getCustomerOrderStats(customer_id) {
    const stats = await this.findOne({
      where: { customer_id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalOrders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'totalSpent']
      ]
    });

    return {
      totalOrders: parseInt(stats?.dataValues?.totalOrders || 0),
      totalSpent: parseFloat(stats?.dataValues?.totalSpent || 0)
    };
  }
}

module.exports = new OrderRepository();