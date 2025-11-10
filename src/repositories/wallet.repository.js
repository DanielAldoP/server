const BaseRepository = require('./base.repository');
const { UserWallet, RestaurantWallet, WalletTransaction, User, Restaurant } = require('../models');

class WalletRepository extends BaseRepository {
  constructor() {
    super();
    this.userWalletModel = UserWallet;
    this.restaurantWalletModel = RestaurantWallet;
    this.transactionModel = WalletTransaction;
  }

  // User Wallet Operations
  async findUserWallet(user_id) {
    return await UserWallet.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });
  }

  async findUserWalletByUserId(user_id) {
    return await UserWallet.findOne({ where: { user_id } });
  }

  async createUserWallet(user_id, initial_balance = 0.00) {
    return await UserWallet.create({
      user_id,
      balance: initial_balance
    });
  }

  async updateUserWalletBalance(user_id, new_balance) {
    return await UserWallet.update(
      { balance: new_balance },
      { where: { user_id } }
    );
  }

  // Restaurant Wallet Operations
  async findRestaurantWallet(restaurant_id) {
    return await RestaurantWallet.findOne({
      where: { restaurant_id },
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name', 'owner_id']
      }]
    });
  }

  async findRestaurantWalletByRestaurantId(restaurant_id) {
    return await RestaurantWallet.findOne({ where: { restaurant_id } });
  }

  async createRestaurantWallet(restaurant_id, initial_balance = 0.00) {
    return await RestaurantWallet.create({
      restaurant_id,
      balance: initial_balance
    });
  }

  async updateRestaurantWalletBalance(restaurant_id, new_balance) {
    return await RestaurantWallet.update(
      { balance: new_balance },
      { where: { restaurant_id } }
    );
  }

  // Transaction Operations
  async createTransaction(transactionData) {
    return await WalletTransaction.create(transactionData);
  }

  async findUserTransactions(user_id, page = 1, limit = 20, filters = {}) {
    const userWallet = await this.findUserWalletByUserId(user_id);
    if (!userWallet) {
      throw new Error('User wallet not found');
    }

    const whereClause = this.buildWhereClause({
      user_wallet_id: userWallet.id,
      ...filters
    });

    return await this.paginateTransactions(page, limit, {
      where: whereClause,
      include: [
        {
          model: UserWallet,
          as: 'userWallet',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });
  }

  async findRestaurantTransactions(restaurant_id, page = 1, limit = 20, filters = {}) {
    const restaurantWallet = await this.findRestaurantWalletByRestaurantId(restaurant_id);
    if (!restaurantWallet) {
      throw new Error('Restaurant wallet not found');
    }

    const whereClause = this.buildWhereClause({
      restaurant_wallet_id: restaurantWallet.id,
      ...filters
    });

    return await this.paginateTransactions(page, limit, {
      where: whereClause,
      include: [
        {
          model: RestaurantWallet,
          as: 'restaurantWallet',
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
  }

  async findAllTransactions(page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause(filters);

    return await this.paginateTransactions(page, limit, {
      where: whereClause,
      include: [
        {
          model: UserWallet,
          as: 'userWallet',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ],
          required: false
        },
        {
          model: RestaurantWallet,
          as: 'restaurantWallet',
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name']
            }
          ],
          required: false
        }
      ]
    });
  }

  async paginateTransactions(page, limit, options) {
    const offset = (page - 1) * limit;
    const { count, rows } = await WalletTransaction.findAndCountAll({
      ...options,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
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

  async processUserWalletTransaction(user_id, type, amount, description, additional_data = {}) {
    return await this.transaction(async (t) => {
      const userWallet = await UserWallet.findOne({
        where: { user_id },
        transaction: t
      });

      if (!userWallet) {
        throw new Error('User wallet not found');
      }

      const previous_balance = parseFloat(userWallet.balance);
      let new_balance;

      if (type === 'payment_out' || type === 'deduct') {
        if (previous_balance < amount) {
          throw new Error('Insufficient wallet balance');
        }
        new_balance = previous_balance - amount;
      } else {
        new_balance = previous_balance + amount;
      }

      // Update wallet balance
      await UserWallet.update(
        { balance: new_balance },
        { where: { user_id }, transaction: t }
      );

      // Create transaction record
      const transaction = await WalletTransaction.create({
        user_wallet_id: userWallet.id,
        type,
        amount: parseFloat(amount),
        description,
        previous_balance,
        new_balance,
        ...additional_data
      }, { transaction: t });

      return {
        wallet: { ...userWallet.toJSON(), balance: new_balance },
        transaction
      };
    });
  }

  async processRestaurantWalletTransaction(restaurant_id, type, amount, description, additional_data = {}) {
    return await this.transaction(async (t) => {
      const restaurantWallet = await RestaurantWallet.findOne({
        where: { restaurant_id },
        transaction: t
      });

      if (!restaurantWallet) {
        throw new Error('Restaurant wallet not found');
      }

      const previous_balance = parseFloat(restaurantWallet.balance);
      let new_balance;

      if (type === 'admin_withdrawal' || type === 'deduct') {
        if (previous_balance < amount) {
          throw new Error('Insufficient wallet balance');
        }
        new_balance = previous_balance - amount;
      } else {
        new_balance = previous_balance + amount;
      }

      // Update wallet balance
      await RestaurantWallet.update(
        { balance: new_balance },
        { where: { restaurant_id }, transaction: t }
      );

      // Create transaction record
      const transaction = await WalletTransaction.create({
        restaurant_wallet_id: restaurantWallet.id,
        type,
        amount: parseFloat(amount),
        description,
        previous_balance,
        new_balance,
        ...additional_data
      }, { transaction: t });

      return {
        wallet: { ...restaurantWallet.toJSON(), balance: new_balance },
        transaction
      };
    });
  }

  async getWalletStats() {
    const [userStats, restaurantStats] = await Promise.all([
      UserWallet.findOne({
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('balance')), 'totalBalance'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalWallets']
        ]
      }),
      RestaurantWallet.findOne({
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('balance')), 'totalBalance'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalWallets']
        ]
      })
    ]);

    return {
      userWallets: {
        totalBalance: parseFloat(userStats?.dataValues?.totalBalance || 0),
        totalWallets: parseInt(userStats?.dataValues?.totalWallets || 0)
      },
      restaurantWallets: {
        totalBalance: parseFloat(restaurantStats?.dataValues?.totalBalance || 0),
        totalWallets: parseInt(restaurantStats?.dataValues?.totalWallets || 0)
      }
    };
  }

  async transaction(callback) {
    const sequelize = require('../models').sequelize;
    return await sequelize.transaction(callback);
  }

  buildWhereClause(filters) {
    const whereClause = {};

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        whereClause[key] = filters[key];
      }
    });

    return whereClause;
  }
}

module.exports = new WalletRepository();