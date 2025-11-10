const { Notification } = require('../models');
const { successResponse } = require('../helpers/response.helper');
const { NotFoundError, ForbiddenError } = require('../helpers/error.helper');
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} = require('../helpers/notification.helper');

const getNotifications = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 20, unread_only = false } = req.query;

    const result = await getUserNotifications(user_id, page, limit, unread_only === 'true');

    res.json(successResponse(result, 'Notifications retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const success = await markNotificationAsRead(id, user_id);

    if (!success) {
      throw new NotFoundError('Notification');
    }

    res.json(successResponse(null, 'Notification marked as read'));
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    await markAllNotificationsAsRead(user_id);

    res.json(successResponse(null, 'All notifications marked as read'));
  } catch (error) {
    next(error);
  }
};

const getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const count = await getUnreadCount(user_id);

    res.json(successResponse({ unread_count: count }, 'Unread notifications count retrieved'));
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const notification = await Notification.findOne({
      where: { id, user_id }
    });

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    await notification.destroy();

    res.json(successResponse(null, 'Notification deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadNotificationsCount,
  deleteNotification
};