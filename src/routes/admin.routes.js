const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');
const { validateRequest } = require('../middleware/validation.middleware');
const {
  updateUserStatusValidation,
  manageWalletValidation,
  createAdminChatValidation,
  sendChatMessageValidation
} = require('../validators/admin.validator');

// All admin routes require admin authentication
router.use(auth, authorize('admin'));

// Dashboard and statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', validateRequest(updateUserStatusValidation), adminController.updateUserStatus);

// Restaurant management
router.get('/restaurants', adminController.getRestaurants);

// Order management
router.get('/orders', adminController.getAllOrders);

// Wallet management
router.post('/wallets/users/:userId/manage', validateRequest(manageWalletValidation), adminController.manageUserWallet);
router.post('/wallets/restaurants/:restaurantId/manage', validateRequest(manageWalletValidation), adminController.manageRestaurantWallet);
router.get('/wallets/transactions', adminController.getWalletTransactions);

// Admin chat/support
router.get('/chats', adminController.getAdminChats);
router.get('/chats/:chatId/messages', adminController.getChatMessages);
router.post('/chats/:chatId/messages', validateRequest(sendChatMessageValidation), adminController.sendChatMessage);

// Public admin chat route (for creating support tickets)
router.post('/support/chat', auth, validateRequest(createAdminChatValidation), adminController.createAdminChat);

module.exports = router;