const BaseRepository = require('./base.repository');
const { User, UserWallet } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email }, {
      include: [{ model: UserWallet, as: 'wallet' }]
    });
  }

  async findByEmailWithWallet(email) {
    return await this.findOne({ email }, {
      include: [{ model: UserWallet, as: 'wallet' }]
    });
  }

  async findByIdWithWallet(id) {
    return await this.findById(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: UserWallet, as: 'wallet' }]
    });
  }

  async findActiveUsers(page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ is_active: true, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [{ model: UserWallet, as: 'wallet' }],
      order: [['created_at', 'DESC']]
    });
  }

  async findByRole(role, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ role, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [{ model: UserWallet, as: 'wallet' }],
      order: [['created_at', 'DESC']]
    });
  }

  async findByCity(city, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ city, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [{ model: UserWallet, as: 'wallet' }],
      order: [['created_at', 'DESC']]
    });
  }

  async findAdmins() {
    return await this.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email']
    });
  }

  async getUsersByStatus(is_active, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ is_active, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [{ model: UserWallet, as: 'wallet' }],
      order: [['created_at', 'DESC']]
    });
  }

  async getUserStats() {
    const [customerStats, merchantStats] = await Promise.all([
      this.count({ role: 'customer' }),
      this.count({ role: 'merchant' })
    ]);

    return {
      totalCustomers: customerStats,
      totalMerchants: merchantStats,
      totalUsers: customerStats + merchantStats
    };
  }

  async updateStatus(user_id, is_active) {
    return await this.update({ is_active }, { id: user_id });
  }

  async createWithWallet(userData) {
    const result = await this.transaction(async (t) => {
      const user = await this.create(userData, { transaction: t });

      if (user) {
        await UserWallet.create({
          user_id: user.id,
          balance: 0.00
        }, { transaction: t });
      }

      return user;
    });

    return await this.findByIdWithWallet(result.id);
  }
}

module.exports = new UserRepository();