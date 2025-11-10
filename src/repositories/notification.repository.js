const BaseRepository = require('./base.repository');
const { Notification, User } = require('../models');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async createNotification(user_id, message, type, related_order_id = null, related_daily_order_id = null) {
    return await this.create({
      user_id,
      message,
      type,
      related_order_id,
      related_daily_order_id,
      is_read: false
    });
  }

  async findByUser(user_id, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ user_id, ...filters });

    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      notifications: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async findUnreadByUser(user_id) {
    return await this.findAll({
      where: { user_id, is_read: false },
      order: [['created_at', 'DESC']]
    });
  }

  async markAsRead(notification_id, user_id) {
    const updated = await this.update(
      { is_read: true },
      { id: notification_id, user_id }
    );

    return updated > 0;
  }

  async markAllAsRead(user_id) {
    return await this.update(
      { is_read: true },
      { user_id, is_read: false }
    );
  }

  async getUnreadCount(user_id) {
    return await this.count({ user_id, is_read: false });
  }

  async deleteNotification(notification_id, user_id) {
    return await this.delete({ id: notification_id, user_id });
  }

  async createBulkNotifications(notifications) {
    return await this.bulkCreate(notifications);
  }

  async notifyAdmins(message, type, related_order_id = null, related_daily_order_id = null) {
    const adminUsers = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id']
    });

    const notifications = adminUsers.map(admin => ({
      user_id: admin.id,
      message,
      type,
      related_order_id,
      related_daily_order_id,
      is_read: false
    }));

    if (notifications.length > 0) {
      return await this.bulkCreate(notifications);
    }

    return [];
  }

  async findByType(type, page = 1, limit = 20) {
    const whereClause = this.buildWhereClause({ type });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async deleteOldNotifications(days_old = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days_old);

    return await this.delete({
      created_at: {
        [require('sequelize').Op.lt]: cutoffDate
      }
    });
  }

  async getNotificationStats(user_id = null) {
    const whereClause = user_id ? { user_id } : {};

    const [totalStats, unreadStats, typeStats] = await Promise.all([
      this.count(whereClause),
      this.count({ ...whereClause, is_read: false }),
      this.findAll({
        where: whereClause,
        attributes: [
          'type',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      })
    ]);

    return {
      total: totalStats,
      unread: unreadStats,
      byType: typeStats.reduce((acc, stat) => {
        acc[stat.type] = parseInt(stat.count);
        return acc;
      }, {})
    };
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

module.exports = new NotificationRepository();