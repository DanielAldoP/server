const { Notification } = require('../models');

const createNotification = async (userId, message, type, relatedOrderId = null, relatedDailyOrderId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
      relatedOrderId,
      relatedDailyOrderId
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const getUserNotifications = async (userId, page = 1, limit = 20, unreadOnly = false) => {
  try {
    const offset = (page - 1) * limit;
    const where = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      notifications: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const [affectedRows] = await Notification.update(
      { isRead: true },
      {
        where: {
          id: notificationId,
          userId
        }
      }
    );

    return affectedRows > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

const markAllNotificationsAsRead = async (userId) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
};