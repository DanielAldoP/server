const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');
const { validateRequest } = require('../middleware/validation.middleware');
const {
  createOrderValidation,
  updateOrderStatusValidation,
  confirmDeliveryValidation
} = require('../validators/order.validator');

// Protected routes - customers
router.post('/', auth, authorize('customer'), validateRequest(createOrderValidation), orderController.createOrder);
router.get('/my', auth, authorize('customer'), orderController.getMyOrders);
router.get('/:id', auth, orderController.getOrderById);

// Protected routes - merchants
router.get('/restaurant/:id', auth, authorize('merchant'), orderController.getRestaurantDailyOrders);
router.put('/daily/:id/status', auth, authorize('merchant', 'admin'), validateRequest(updateOrderStatusValidation), orderController.updateDailyOrderStatus);
router.put('/daily/:id/confirm-delivery', auth, validateRequest(confirmDeliveryValidation), orderController.confirmDelivery);

// Admin only routes
router.get('/admin/all', auth, authorize('admin'), orderController.getAllOrders);

module.exports = router;