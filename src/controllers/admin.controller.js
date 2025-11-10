const AdminService = require('../services/admin.service');
const { successResponse } = require('../helpers/response.helper');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await AdminService.getDashboardStats();

    res.json(successResponse(stats, 'Dashboard statistics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, city, is_active } = req.query;

    const result = await AdminService.getUsers(page, limit, role, city, is_active);

    res.json(successResponse(result, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = await AdminService.updateUserStatus(id, is_active);

    res.json(successResponse(user, `User ${is_active ? 'activated' : 'deactivated'} successfully`));
  } catch (error) {
    next(error);
  }
};

const getRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, city } = req.query;

    const result = await AdminService.getRestaurants(page, limit, status, city);

    res.json(successResponse(result, 'Restaurants retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const result = await AdminService.getAllOrders(page, limit, status);

    res.json(successResponse(result, 'Orders retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const manageUserWallet = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { type, amount, description } = req.body;

    const result = await AdminService.manageUserWallet(user_id, type, amount, description);

    res.json(successResponse(result, `Wallet ${type} successful`));
  } catch (error) {
    next(error);
  }
};

const manageRestaurantWallet = async (req, res, next) => {
  try {
    const { restaurant_id } = req.params;
    const { type, amount, description } = req.body;

    const result = await AdminService.manageRestaurantWallet(restaurant_id, type, amount, description);

    res.json(successResponse(result, `Restaurant wallet ${type} successful`));
  } catch (error) {
    next(error);
  }
};

const getWalletTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, user_id, restaurant_id } = req.query;

    const result = await AdminService.getWalletTransactions(page, limit, type, user_id, restaurant_id);

    res.json(successResponse(result, 'Wallet transactions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getAdminChats = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const result = await AdminService.getAdminChats(page, limit, status);

    res.json(successResponse(result, 'Admin chats retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createAdminChat = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    const user_id = req.user.id;

    const chat = await AdminService.createAdminChat(user_id, subject, message);

    res.status(201).json(successResponse(chat, 'Support chat created successfully'));
  } catch (error) {
    next(error);
  }
};

const getChatMessages = async (req, res, next) => {
  try {
    const { chat_id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userRole = req.user.role;
    const user_id = req.user.id;

    const result = await AdminService.getChatMessages(chat_id, userRole, user_id, page, limit);

    res.json(successResponse(result, 'Chat messages retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const sendChatMessage = async (req, res, next) => {
  try {
    const { chat_id } = req.params;
    const { message } = req.body;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const chatMessage = await AdminService.sendChatMessage(chat_id, user_id, userRole, message);

    res.status(201).json(successResponse(chatMessage, 'Message sent successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getRestaurants,
  getAllOrders,
  manageUserWallet,
  manageRestaurantWallet,
  getWalletTransactions,
  getAdminChats,
  createAdminChat,
  getChatMessages,
  sendChatMessage
};