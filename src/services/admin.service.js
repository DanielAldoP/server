const { User, Restaurant, Order, DailyOrder, UserWallet, RestaurantWallet, WalletTransaction, Review, AdminChat, AdminChatMessage } = require('../models');
const { createNotification } = require('../helpers/notification.helper');
const { NotFoundError, ForbiddenError, ValidationError } = require('../helpers/error.helper');
const { validateRequired, validateNumber, validateEnum } = require('../helpers/validation.helper');

class AdminService {
  static async getDashboardStats() {
    const stats = await Promise.all([
      User.count({ where: { role: 'customer' } }),
      User.count({ where: { role: 'merchant' } }),
      Restaurant.count({ where: { status: 'pending_verification' } }),
      Restaurant.count({ where: { status: 'active' } }),
      Order.count({ where: { status: 'paid' } }),
      DailyOrder.count({ where: { status: 'pending' } }),
      DailyOrder.count({ where: { status: 'confirmed' } }),
      DailyOrder.count({ where: { status: 'delivered' } }),
      UserWallet.sum('balance'),
      RestaurantWallet.sum('balance')
    ]);

    const [
      totalCustomers,
      totalMerchants,
      pendingRestaurants,
      activeRestaurants,
      totalOrders,
      pendingDailyOrders,
      confirmedDailyOrders,
      deliveredDailyOrders,
      totalUserWalletBalance,
      totalRestaurantWalletBalance
    ] = stats;

    return {
      users: {
        customers: totalCustomers,
        merchants: totalMerchants
      },
      restaurants: {
        pending: pendingRestaurants,
        active: activeRestaurants
      },
      orders: {
        total: totalOrders,
        pending: pendingDailyOrders,
        confirmed: confirmedDailyOrders,
        delivered: deliveredDailyOrders
      },
      wallets: {
        totalUserBalance: totalUserWalletBalance || 0,
        totalRestaurantBalance: totalRestaurantWalletBalance || 0
      }
    };
  }

  static async getUsers(page = 1, limit = 20, role, city, isActive) {
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (city) where.city = city;
    if (isActive !== undefined) where.is_active = isActive === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: UserWallet, as: 'wallet' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async updateUserStatus(userId, is_active) {
    validateRequired(is_active, 'Active status');

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    await user.update({ is_active });

    return user;
  }

  static async getRestaurants(page = 1, limit = 20, status, city) {
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (city) where.city = city;

    const { count, rows } = await Restaurant.findAndCountAll({
      where,
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

  static async getAllOrders(page = 1, limit = 20, status) {
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: DailyOrder,
          as: 'daily_orders',
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name']
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

  static async manageUserWallet(userId, type, amount, description) {
    validateRequired(type, 'Transaction type');
    validateNumber(amount, 'Amount', 0.01);
    validateRequired(description, 'Description');

    validateEnum(type, ['topup', 'deduct'], 'Transaction type');

    const userWallet = await UserWallet.findOne({ where: { user_id: userId } });
    if (!userWallet) {
      throw new NotFoundError('User wallet');
    }

    const previousBalance = userWallet.balance;
    let newBalance;

    if (type === 'topup') {
      newBalance = previousBalance + amount;
    } else {
      if (previousBalance < amount) {
        throw new ValidationError('Insufficient wallet balance for deduction');
      }
      newBalance = previousBalance - amount;
    }

    await userWallet.update({ balance: newBalance });

    // Create wallet transaction
    await WalletTransaction.create({
      user_wallet_id: userWallet.id,
      type,
      amount,
      description,
      previous_balance: previousBalance,
      new_balance: newBalance
    });

    // Notify user
    await createNotification(
      userId,
      `Your wallet has been ${type === 'topup' ? 'credited' : 'debited'} with amount: ${amount}`,
      type === 'topup' ? 'wallet_topup' : 'wallet_deduct'
    );

    return {
      previous_balance: previousBalance,
      new_balance: newBalance,
      transaction: { type, amount, description }
    };
  }

  static async manageRestaurantWallet(restaurantId, type, amount, description) {
    validateRequired(type, 'Transaction type');
    validateNumber(amount, 'Amount', 0.01);
    validateRequired(description, 'Description');

    validateEnum(type, ['topup', 'deduct'], 'Transaction type');

    const restaurantWallet = await RestaurantWallet.findOne({ where: { restaurant_id: restaurantId } });
    if (!restaurantWallet) {
      throw new NotFoundError('Restaurant wallet');
    }

    const previousBalance = restaurantWallet.balance;
    let newBalance;

    if (type === 'topup') {
      newBalance = previousBalance + amount;
    } else {
      if (previousBalance < amount) {
        throw new ValidationError('Insufficient wallet balance for deduction');
      }
      newBalance = previousBalance - amount;
    }

    await restaurantWallet.update({ balance: newBalance });

    // Create wallet transaction
    await WalletTransaction.create({
      restaurant_wallet_id: restaurantWallet.id,
      type,
      amount,
      description,
      previous_balance: previousBalance,
      new_balance: newBalance
    });

    // Get restaurant owner to notify
    const restaurant = await Restaurant.findByPk(restaurantId, {
      attributes: ['owner_id']
    });

    if (restaurant) {
      await createNotification(
        restaurant.owner_id,
        `Your restaurant wallet has been ${type === 'topup' ? 'credited' : 'debited'} with amount: ${amount}`,
        type === 'topup' ? 'restaurant_wallet_topup' : 'restaurant_wallet_deduct'
      );
    }

    return {
      previous_balance: previousBalance,
      new_balance: newBalance,
      transaction: { type, amount, description }
    };
  }

  static async getWalletTransactions(page = 1, limit = 20, type, userId, restaurantId) {
    const offset = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (userId) where.user_wallet_id = userId;
    if (restaurantId) where.restaurant_wallet_id = restaurantId;

    const { count, rows } = await WalletTransaction.findAndCountAll({
      where,
      include: [
        {
          model: UserWallet,
          as: 'user_wallet',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: RestaurantWallet,
          as: 'restaurant_wallet',
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      transactions: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async getAdminChats(page = 1, limit = 20, status) {
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await AdminChat.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: AdminChatMessage,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_message_at', 'DESC']]
    });

    return {
      chats: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async createAdminChat(userId, subject, message) {
    validateRequired(subject, 'Subject');
    validateRequired(message, 'Message');

    // Create chat
    const chat = await AdminChat.create({
      user_id: userId,
      subject
    });

    // Create initial message
    await AdminChatMessage.create({
      chat_id: chat.id,
      sender_id: userId,
      sender_type: 'user',
      message
    });

    // Notify admins
    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    for (const admin of adminUsers) {
      await createNotification(
        admin.id,
        `New support chat: ${subject}`,
        'new_message'
      );
    }

    return chat;
  }

  static async getChatMessages(chatId, userRole, userId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const chat = await AdminChat.findByPk(chatId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!chat) {
      throw new NotFoundError('Chat');
    }

    // Check permissions (admin or chat owner)
    if (userRole !== 'admin' && chat.user_id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    const { count, rows } = await AdminChatMessage.findAndCountAll({
      where: { chat_id: chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']]
    });

    // Mark messages as read if user is admin
    if (userRole === 'admin') {
      await AdminChatMessage.update(
        { is_read: true },
        {
          where: {
            chat_id: chatId,
            sender_type: 'user',
            is_read: false
          }
        }
      );
    }

    return {
      chat,
      messages: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async sendChatMessage(chatId, userId, userRole, message) {
    validateRequired(message, 'Message');

    const chat = await AdminChat.findByPk(chatId);
    if (!chat) {
      throw new NotFoundError('Chat');
    }

    // Check permissions (admin or chat owner)
    if (userRole !== 'admin' && chat.user_id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    const senderType = userRole === 'admin' ? 'admin' : 'user';

    // Create message
    const chatMessage = await AdminChatMessage.create({
      chat_id: chatId,
      sender_id: userId,
      sender_type: senderType,
      message
    });

    // Update chat last message time
    await chat.update({ last_message_at: Math.floor(Date.now() / 1000) });

    // Notify recipient
    if (senderType === 'admin') {
      await createNotification(
        chat.user_id,
        `New message in support chat: ${chat.subject}`,
        'new_message'
      );
    } else {
      // Notify all admins
      const adminUsers = await User.findAll({ where: { role: 'admin' } });
      for (const admin of adminUsers) {
        await createNotification(
          admin.id,
          `New message in support chat: ${chat.subject}`,
          'new_message'
        );
      }
    }

    return chatMessage;
  }

  static async getSystemStats() {
    const userStats = await User.findOne({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalUsers'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN is_active = true THEN 1 END')), 'activeUsers']
      ]
    });

    const restaurantStats = await Restaurant.findOne({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalRestaurants'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = \'active\' THEN 1 END')), 'activeRestaurants']
      ]
    });

    const orderStats = await Order.findOne({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalOrders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'totalRevenue']
      ]
    });

    return {
      users: {
        total: parseInt(userStats.dataValues.totalUsers || 0),
        active: parseInt(userStats.dataValues.activeUsers || 0)
      },
      restaurants: {
        total: parseInt(restaurantStats.dataValues.totalRestaurants || 0),
        active: parseInt(restaurantStats.dataValues.activeRestaurants || 0)
      },
      orders: {
        total: parseInt(orderStats.dataValues.totalOrders || 0),
        totalRevenue: parseFloat(orderStats.dataValues.totalRevenue || 0)
      }
    };
  }
}

module.exports = AdminService;