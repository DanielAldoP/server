const BaseRepository = require('./base.repository');
const { DailyOrder, DailyOrderItem, Order, Restaurant, User, Review } = require('../models');

class DailyOrderRepository extends BaseRepository {
  constructor() {
    super(DailyOrder);
  }

  async findByIdWithDetails(id) {
    return await this.findById(id, {
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'owner_id', 'name']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'customer_id']
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
    });
  }

  async findByRestaurant(restaurant_id, user_id, user_role, page = 1, limit = 20, filters = {}) {
    // Verify restaurant ownership first
    const restaurant = await require('./restaurant.repository').findById(restaurant_id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (restaurant.owner_id !== user_id && user_role !== 'admin') {
      throw new Error('You can only view orders for your own restaurants');
    }

    const whereClause = this.buildWhereClause({ restaurant_id, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'name', 'phone_number']
            }
          ]
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
      ],
      order: [['delivery_date', 'DESC'], ['created_at', 'DESC']]
    });
  }

  async findByStatus(status, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ status, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'total_amount']
        }
      ],
      order: [['delivery_date', 'DESC'], ['created_at', 'DESC']]
    });
  }

  async createDailyOrder(dailyOrderData, orderItems) {
    return await this.transaction(async (t) => {
      const dailyOrder = await this.create(dailyOrderData, { transaction: t });

      if (dailyOrder && orderItems.length > 0) {
        const itemsWithOrder = orderItems.map(item => ({
          ...item,
          daily_order_id: dailyOrder.id
        }));

        await DailyOrderItem.bulkCreate(itemsWithOrder, { transaction: t });
      }

      return await this.findByIdWithDetails(dailyOrder.id);
    });
  }

  async updateStatus(id, status) {
    await this.update({ status }, { id });
    return await this.findByIdWithDetails(id);
  }

  async updateDeliveryConfirmation(id, updateField) {
    await this.update({ [updateField]: true }, { id });
    return await this.findByIdWithDetails(id);
  }

  async markAsDelivered(id) {
    await this.update({ status: 'delivered' }, { id });
    return await this.findByIdWithDetails(id);
  }

  async getDailyOrderStats(restaurant_id = null) {
    const whereClause = restaurant_id ? { restaurant_id } : {};

    const stats = await this.findOne({
      where: whereClause,
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalOrders'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = \'delivered\' THEN 1 END')), 'completedOrders'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = \'pending\' THEN 1 END')), 'pendingOrders'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = \'confirmed\' THEN 1 END')), 'confirmedOrders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'totalRevenue']
      ]
    });

    return {
      totalOrders: parseInt(stats?.dataValues?.totalOrders || 0),
      completedOrders: parseInt(stats?.dataValues?.completedOrders || 0),
      pendingOrders: parseInt(stats?.dataValues?.pendingOrders || 0),
      confirmedOrders: parseInt(stats?.dataValues?.confirmedOrders || 0),
      totalRevenue: parseFloat(stats?.dataValues?.totalRevenue || 0)
    };
  }

  async validateStatusTransition(daily_order_id, new_status, user_id, user_role) {
    const dailyOrder = await this.findByIdWithDetails(daily_order_id);

    if (!dailyOrder) {
      throw new Error('Daily order not found');
    }

    const isMerchant = dailyOrder.restaurant.owner_id === user_id;
    const isCustomer = dailyOrder.order.customer_id === user_id;
    const isAdmin = user_role === 'admin';

    if (!isMerchant && !isCustomer && !isAdmin) {
      throw new Error('Insufficient permissions');
    }

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[dailyOrder.status].includes(new_status)) {
      throw new Error(`Cannot change status from ${dailyOrder.status} to ${new_status}`);
    }

    if (new_status === 'confirmed' && !isMerchant && !isAdmin) {
      throw new Error('Only merchants or admins can confirm orders');
    }

    if (new_status === 'delivered' && !isMerchant && !isAdmin) {
      throw new Error('Only merchants or admins can mark orders as delivered');
    }

    if (new_status === 'cancelled' && !isMerchant && !isCustomer && !isAdmin) {
      throw new Error('Only merchants, customers, or admins can cancel orders');
    }

    return dailyOrder;
  }

  async canConfirmDelivery(daily_order_id, user_id, type) {
    const dailyOrder = await this.findByIdWithDetails(daily_order_id);

    if (!dailyOrder) {
      throw new Error('Daily order not found');
    }

    if (dailyOrder.status !== 'confirmed') {
      throw new Error('Can only confirm delivery for confirmed orders');
    }

    if (type === 'merchant' && dailyOrder.restaurant.owner_id !== user_id) {
      throw new Error('Only restaurant owner can confirm merchant delivery');
    }

    if (type === 'customer' && dailyOrder.order.customer_id !== user_id) {
      throw new Error('Only customer can confirm customer delivery');
    }

    return dailyOrder;
  }
}

module.exports = new DailyOrderRepository();