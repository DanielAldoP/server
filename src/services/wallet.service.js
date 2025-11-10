const { UserWallet, RestaurantWallet, WalletTransaction, User, Restaurant } = require('../models');
const { NotFoundError, ValidationError, ForbiddenError } = require('../helpers/error.helper');
const { validateNumber, validateRequired } = require('../helpers/validation.helper');

class WalletService {
  static async getUserWallet(user_id) {
    const wallet = await UserWallet.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!wallet) {
      throw new NotFoundError('User wallet');
    }

    return wallet;
  }

  static async getRestaurantWallet(restaurant_id) {
    const wallet = await RestaurantWallet.findOne({
      where: { restaurant_id },
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name', 'owner_id']
      }]
    });

    if (!wallet) {
      throw new NotFoundError('Restaurant wallet');
    }

    return wallet;
  }

  static async getUserWalletTransactions(user_id, page = 1, limit = 20) {
    const wallet = await this.getUserWallet(user_id);
    const offset = (page - 1) * limit;

    const { count, rows } = await WalletTransaction.findAndCountAll({
      where: { user_wallet_id: wallet.id },
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

  static async getRestaurantWalletTransactions(restaurant_id, page = 1, limit = 20) {
    const wallet = await this.getRestaurantWallet(restaurant_id);
    const offset = (page - 1) * limit;

    const { count, rows } = await WalletTransaction.findAndCountAll({
      where: { restaurant_wallet_id: wallet.id },
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

  static async addFundsToUserWallet(user_id, amount, admin_id, description) {
    validateNumber(amount, 'Amount', 0.01);
    validateRequired(description, 'Description');

    const wallet = await this.getUserWallet(user_id);
    const previous_balance = wallet.balance;
    const new_balance = parseFloat(previous_balance) + parseFloat(amount);

    await wallet.update({ balance: new_balance });

    // Create transaction record
    const transaction = await WalletTransaction.create({
      user_wallet_id: wallet.id,
      type: 'admin_credit',
      amount: parseFloat(amount),
      description: `${description} (by admin ${admin_id})`,
      previous_balance: parseFloat(previous_balance),
      new_balance: parseFloat(new_balance)
    });

    return { wallet, transaction };
  }

  static async deductFromUserWallet(user_id, amount, description, related_order_id = null, related_daily_order_id = null) {
    validateNumber(amount, 'Amount', 0.01);
    validateRequired(description, 'Description');

    const wallet = await this.getUserWallet(user_id);

    if (wallet.balance < amount) {
      throw new ValidationError('Insufficient wallet balance');
    }

    const previous_balance = wallet.balance;
    const new_balance = parseFloat(previous_balance) - parseFloat(amount);

    await wallet.update({ balance: new_balance });

    // Create transaction record
    const transaction = await WalletTransaction.create({
      user_wallet_id: wallet.id,
      type: 'payment_out',
      amount: parseFloat(amount),
      description,
      related_order_id,
      related_daily_order_id,
      previous_balance: parseFloat(previous_balance),
      new_balance: parseFloat(new_balance)
    });

    return { wallet, transaction };
  }

  static async refundToUserWallet(user_id, amount, description, related_order_id = null, related_daily_order_id = null) {
    validateNumber(amount, 'Amount', 0.01);
    validateRequired(description, 'Description');

    const wallet = await this.getUserWallet(user_id);
    const previous_balance = wallet.balance;
    const new_balance = parseFloat(previous_balance) + parseFloat(amount);

    await wallet.update({ balance: new_balance });

    // Create transaction record
    const transaction = await WalletTransaction.create({
      user_wallet_id: wallet.id,
      type: 'refund',
      amount: parseFloat(amount),
      description,
      related_order_id,
      related_daily_order_id,
      previous_balance: parseFloat(previous_balance),
      new_balance: parseFloat(new_balance)
    });

    return { wallet, transaction };
  }

  static async addFundsToRestaurantWallet(restaurant_id, amount, description, related_order_id = null, related_daily_order_id = null) {
    validateNumber(amount, 'Amount', 0.01);
    validateRequired(description, 'Description');

    const wallet = await this.getRestaurantWallet(restaurant_id);
    const previous_balance = wallet.balance;
    const new_balance = parseFloat(previous_balance) + parseFloat(amount);

    await wallet.update({ balance: new_balance });

    // Create transaction record
    const transaction = await WalletTransaction.create({
      restaurant_wallet_id: wallet.id,
      type: 'payment_in',
      amount: parseFloat(amount),
      description,
      related_order_id,
      related_daily_order_id,
      previous_balance: parseFloat(previous_balance),
      new_balance: parseFloat(new_balance)
    });

    return { wallet, transaction };
  }

  static async withdrawFromRestaurantWallet(restaurant_id, amount, description, admin_id) {
    validateNumber(amount, 'Amount', 0.01);
    validateRequired(description, 'Description');

    const wallet = await this.getRestaurantWallet(restaurant_id);

    if (wallet.balance < amount) {
      throw new ValidationError('Insufficient restaurant wallet balance');
    }

    const previous_balance = wallet.balance;
    const new_balance = parseFloat(previous_balance) - parseFloat(amount);

    await wallet.update({ balance: new_balance });

    // Create transaction record
    const transaction = await WalletTransaction.create({
      restaurant_wallet_id: wallet.id,
      type: 'admin_withdrawal',
      amount: parseFloat(amount),
      description: `${description} (by admin ${admin_id})`,
      previous_balance: parseFloat(previous_balance),
      new_balance: parseFloat(new_balance)
    });

    return { wallet, transaction };
  }

  static async createRestaurantWallet(restaurant_id) {
    // Check if wallet already exists
    const existingWallet = await RestaurantWallet.findOne({
      where: { restaurant_id }
    });

    if (existingWallet) {
      throw new ValidationError('Restaurant wallet already exists');
    }

    return await RestaurantWallet.create({
      restaurant_id,
      balance: 0.00
    });
  }

  static async getWalletStats(admin_id) {
    // Get total user wallet balances
    const userWalletStats = await UserWallet.findOne({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('balance')), 'totalBalance'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalWallets']
      ]
    });

    // Get total restaurant wallet balances
    const restaurantWalletStats = await RestaurantWallet.findOne({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('balance')), 'totalBalance'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalWallets']
      ]
    });

    return {
      userWallets: {
        totalBalance: parseFloat(userWalletStats.dataValues.totalBalance || 0),
        totalWallets: parseInt(userWalletStats.dataValues.totalWallets || 0)
      },
      restaurantWallets: {
        totalBalance: parseFloat(restaurantWalletStats.dataValues.totalBalance || 0),
        totalWallets: parseInt(restaurantWalletStats.dataValues.totalWallets || 0)
      }
    };
  }

  static async validateWalletOwnership(user_id, walletId) {
    const wallet = await UserWallet.findOne({
      where: { id: walletId, user_id }
    });

    if (!wallet) {
      throw new ForbiddenError('You can only access your own wallet');
    }

    return wallet;
  }

  static async validateRestaurantWalletOwnership(user_id, walletId) {
    const wallet = await RestaurantWallet.findOne({
      where: { id: walletId },
      include: [{
        model: Restaurant,
        as: 'restaurant',
        where: { owner_id: user_id }
      }]
    });

    if (!wallet) {
      throw new ForbiddenError('You can only access your own restaurant wallet');
    }

    return wallet;
  }
}

module.exports = WalletService;