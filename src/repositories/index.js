const userRepository = require('./user.repository');
const restaurantRepository = require('./restaurant.repository');
const menuRepository = require('./menu.repository');
const orderRepository = require('./order.repository');
const dailyOrderRepository = require('./daily-order.repository');
const reviewRepository = require('./review.repository');
const walletRepository = require('./wallet.repository');
const adminChatRepository = require('./admin-chat.repository');
const notificationRepository = require('./notification.repository');

module.exports = {
  userRepository,
  restaurantRepository,
  menuRepository,
  orderRepository,
  dailyOrderRepository,
  reviewRepository,
  walletRepository,
  adminChatRepository,
  notificationRepository
};