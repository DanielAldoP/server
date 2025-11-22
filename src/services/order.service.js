const { Order, DailyOrder, DailyOrderItem, Menu, Restaurant, User, UserWallet, RestaurantWallet, WalletTransaction, Review, Notification, Address, City } = require('../models');
const { createNotification } = require('../helpers/notification.helper');
const { validateNumber, validateRequired } = require('../helpers/validation.helper');
const { NotFoundError, ForbiddenError, ValidationError } = require('../helpers/error.helper');

class OrderService {
  static async createOrder(items, customer_id, userCity) {
    validateRequired(items, 'Order items');
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Order items must be a non-empty array');
    }

    // Group items by restaurant and delivery date
    const groupedOrders = {};
    let total_amount = 0;

    for (const item of items) {
      const { menu_id, quantity, delivery_date } = item;

      validateRequired(menu_id, 'Menu ID');
      validateNumber(quantity, 'Quantity', 1);
      validateRequired(delivery_date, 'Delivery date');

      // Get menu details
      const menu = await Menu.findByPk(menu_id, {
        include: [
          {
            model: Restaurant, as: 'restaurant',
            attributes: ['id', 'owner_id', 'name', 'status'],
            include: [
              {
                model: Address,
                as: 'address',
                include: [
                  {
                    model: City,
                    as: 'city'
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!menu || !menu.is_active) {
        throw new ValidationError(`Menu with ID ${menu_id} is not available`);
      }

      if (menu.restaurant.status !== 'active') {
        throw new ValidationError(`Restaurant ${menu.restaurant.name} is not active`);
      }

      // Check if restaurant is in user's city
      const restaurantCity = menu.restaurant.address?.city;
      if (!restaurantCity) {
        throw new ValidationError(`Restaurant ${menu.restaurant.name} has no valid address`);
      }

      let userCityValue = userCity;
      if (typeof userCity === 'object' && userCity.name) {
        userCityValue = userCity.name.toLowerCase();
      } else if (typeof userCity === 'string') {
        userCityValue = userCity.toLowerCase();
      } else if (typeof userCity === 'number') {
        // Compare by city ID
        if (restaurantCity.id !== userCity) {
          throw new ValidationError(`Restaurant ${menu.restaurant.name} is not in your city`);
        }
      }

      // Compare city names if we have string values
      if (typeof userCityValue === 'string' && restaurantCity.name.toLowerCase() !== userCityValue) {
        throw new ValidationError(`Restaurant ${menu.restaurant.name} is not in your city`);
      }

      const itemTotal = menu.price * quantity;
      total_amount += itemTotal;

      const key = `${menu.restaurant_id}-${delivery_date}`;
      if (!groupedOrders[key]) {
        groupedOrders[key] = {
          restaurant_id: menu.restaurant_id,
          delivery_date,
          items: [],
          amount: 0
        };
      }

      groupedOrders[key].items.push({
        menu_id,
        quantity,
        unitPrice: menu.price,
        totalPrice: itemTotal
      });

      groupedOrders[key].amount += itemTotal;
    }

    // Check user wallet balance
    const userWallet = await UserWallet.findOne({ where: { user_id: customer_id } });
    if (!userWallet || userWallet.balance < total_amount) {
      throw new ValidationError('Insufficient wallet balance');
    }

    // Create master order
    const order = await Order.create({
      customer_id,
      total_amount,
      status: 'paid',
      payment_method: 'wallet',
      payment_date: new Date()
    });

    // Create daily orders and items
    const dailyOrders = [];
    for (const groupedOrder of Object.values(groupedOrders)) {
      const dailyOrder = await DailyOrder.create({
        order_id: order.id,
        restaurant_id: groupedOrder.restaurant_id,
        delivery_date: groupedOrder.delivery_date,
        total_amount: groupedOrder.amount,
        status: 'pending'
      });

      for (const item of groupedOrder.items) {
        await DailyOrderItem.create({
          daily_order_id: dailyOrder.id,
          ...item
        });
      }

      dailyOrders.push(dailyOrder);

      // Notify restaurant owner
      const restaurant = await Restaurant.findByPk(groupedOrder.restaurant_id);
      await createNotification(
        restaurant.owner_id,
        `New order received for delivery on ${groupedOrder.delivery_date}`,
        'order_paid',
        order.id,
        dailyOrder.id
      );
    }

    // Process payment
    await this.processOrderPayment(userWallet, total_amount, order.id);

    // Notify customer
    await createNotification(
      customer_id,
      'Your order has been placed successfully',
      'payment_success',
      order.id,
      null
    );

    return { order, dailyOrders };
  }

  static async processOrderPayment(userWallet, total_amount, order_id) {
    // Deduct from user wallet
    await userWallet.update({
      balance: userWallet.balance - total_amount
    });

    // Create wallet transaction
    await WalletTransaction.create({
      user_wallet_id: userWallet.id,
      type: 'payment_out',
      amount: total_amount,
      description: `Payment for order #${order_id}`,
      related_order_id: order_id,
      previous_balance: userWallet.balance + total_amount,
      new_balance: userWallet.balance
    });
  }

  static async getMyOrders(customer_id, page = 1, limit = 20, status) {
    const offset = (page - 1) * limit;

    const where = { customer_id };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: DailyOrder,
          as: 'daily_orders',
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
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      orders: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async getOrderById(id, userId, userRole) {
    const whereClause = {};
    if (userRole === 'customer') {
      whereClause.customer_id = userId;
    }

    const order = await Order.findOne({
      where: { id, ...whereClause },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone_number']
        },
        {
          model: DailyOrder,
          as: 'daily_orders',
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

    if (!order) {
      throw new NotFoundError('Order');
    }

    return order;
  }

  static async getRestaurantDailyOrders(restaurant_id, userId, userRole, page = 1, limit = 20, status, delivery_date) {
    // Verify restaurant ownership
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    if (restaurant.owner_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only view orders for your own restaurants');
    }

    const where = { restaurant_id };
    if (status) where.status = status;
    if (delivery_date) where.delivery_date = delivery_date;

    const offset = (page - 1) * limit;

    const { count, rows } = await DailyOrder.findAndCountAll({
      where,
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
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['delivery_date', 'DESC'], ['created_at', 'DESC']]
    });

    return {
      dailyOrders: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async updateDailyOrderStatus(id, status, userId, userRole) {
    validateRequired(status, 'Status');

    const dailyOrder = await DailyOrder.findByPk(id, {
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
        }
      ]
    });

    if (!dailyOrder) {
      throw new NotFoundError('Daily order');
    }

    // Check permissions
    const isMerchant = dailyOrder.restaurant.owner_id === userId;
    const isCustomer = dailyOrder.order.customer_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isMerchant && !isCustomer && !isAdmin) {
      throw new ForbiddenError('Insufficient permissions');
    }

    // Validate status transitions
    this.validateStatusTransition(dailyOrder.status, status, isMerchant, isCustomer, isAdmin);

    const previousStatus = dailyOrder.status;
    await dailyOrder.update({ status });

    // Handle status change consequences
    await this.handleStatusChangeConsequences(dailyOrder, status, previousStatus);

    return dailyOrder;
  }

  static validateStatusTransition(currentStatus, newStatus, isMerchant, isCustomer, isAdmin) {
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ValidationError(`Cannot change status from ${currentStatus} to ${newStatus}`);
    }

    // Check who can perform which actions
    if (newStatus === 'confirmed' && !isMerchant && !isAdmin) {
      throw new ForbiddenError('Only merchants or admins can confirm orders');
    }

    if (newStatus === 'delivered' && !isMerchant && !isAdmin) {
      throw new ForbiddenError('Only merchants or admins can mark orders as delivered');
    }

    if (newStatus === 'cancelled' && !isMerchant && !isCustomer && !isAdmin) {
      throw new ForbiddenError('Only merchants, customers, or admins can cancel orders');
    }
  }

  static async handleStatusChangeConsequences(dailyOrder, newStatus, previousStatus) {
    if (newStatus === 'delivered' && previousStatus !== 'delivered') {
      await this.processOrderDelivery(dailyOrder);
    } else if (newStatus === 'cancelled') {
      await this.processOrderCancellation(dailyOrder);
    } else if (newStatus === 'confirmed') {
      await this.processOrderConfirmation(dailyOrder);
    }
  }

  static async processOrderDelivery(dailyOrder) {
    // Transfer funds to restaurant wallet
    const restaurantWallet = await RestaurantWallet.findOne({
      where: { restaurant_id: dailyOrder.restaurant_id }
    });

    if (restaurantWallet) {
      await restaurantWallet.update({
        balance: restaurantWallet.balance + dailyOrder.total_amount
      });

      // Create wallet transaction
      await WalletTransaction.create({
        restaurant_wallet_id: restaurantWallet.id,
        type: 'payment_in',
        amount: dailyOrder.total_amount,
        description: `Payment for daily order #${dailyOrder.id}`,
        related_daily_order_id: dailyOrder.id,
        previous_balance: restaurantWallet.balance - dailyOrder.total_amount,
        new_balance: restaurantWallet.balance
      });
    }

    // Notify restaurant owner
    await createNotification(
      dailyOrder.restaurant.owner_id,
      `Order for ${dailyOrder.delivery_date} has been delivered. Funds transferred to your wallet.`,
      'order_complete',
      dailyOrder.order_id,
      dailyOrder.id
    );

    // Notify customer
    await createNotification(
      dailyOrder.order.customer_id,
      `Your order for ${dailyOrder.delivery_date} has been delivered`,
      'order_delivered',
      dailyOrder.order_id,
      dailyOrder.id
    );
  }

  static async processOrderCancellation(dailyOrder) {
    // Refund to customer wallet
    const userWallet = await UserWallet.findOne({
      where: { user_id: dailyOrder.order.customer_id }
    });

    if (userWallet) {
      await userWallet.update({
        balance: userWallet.balance + dailyOrder.total_amount
      });

      // Create wallet transaction
      await WalletTransaction.create({
        user_wallet_id: userWallet.id,
        type: 'refund',
        amount: dailyOrder.total_amount,
        description: `Refund for cancelled daily order #${dailyOrder.id}`,
        related_daily_order_id: dailyOrder.id,
        previous_balance: userWallet.balance - dailyOrder.total_amount,
        new_balance: userWallet.balance
      });
    }

    // Notify both parties
    await createNotification(
      dailyOrder.order.customer_id,
      `Your order for ${dailyOrder.delivery_date} has been cancelled. Amount refunded to your wallet.`,
      'order_cancelled',
      dailyOrder.order_id,
      dailyOrder.id
    );

    await createNotification(
      dailyOrder.restaurant.owner_id,
      `Order for ${dailyOrder.delivery_date} has been cancelled.`,
      'order_cancelled',
      dailyOrder.order_id,
      dailyOrder.id
    );
  }

  static async processOrderConfirmation(dailyOrder) {
    await createNotification(
      dailyOrder.order.customer_id,
      `Your order for ${dailyOrder.delivery_date} has been confirmed by the restaurant`,
      'order_confirmed',
      dailyOrder.order_id,
      dailyOrder.id
    );
  }

  static async confirmDelivery(id, userId, type) {
    validateRequired(type, 'Confirmation type');

    const dailyOrder = await DailyOrder.findByPk(id, {
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
        }
      ]
    });

    if (!dailyOrder) {
      throw new NotFoundError('Daily order');
    }

    if (dailyOrder.status !== 'confirmed') {
      throw new ValidationError('Can only confirm delivery for confirmed orders');
    }

    // Verify permissions
    if (type === 'merchant' && dailyOrder.restaurant.owner_id !== userId) {
      throw new ForbiddenError('Only restaurant owner can confirm merchant delivery');
    }

    if (type === 'customer' && dailyOrder.order.customer_id !== userId) {
      throw new ForbiddenError('Only customer can confirm customer delivery');
    }

    const updateField = type === 'merchant'
      ? 'merchant_confirmed_delivery'
      : 'customer_confirmed_delivery';

    await dailyOrder.update({ [updateField]: true });

    // If both confirmed, mark as delivered
    if (dailyOrder.merchant_confirmed_delivery && dailyOrder.customer_confirmed_delivery) {
      await dailyOrder.update({ status: 'delivered' });
      await this.processOrderDelivery(dailyOrder);
    }

    return dailyOrder;
  }
}

module.exports = OrderService;