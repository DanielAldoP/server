const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// Protected routes
router.get('/', auth, notificationController.getNotifications);
router.get('/unread/count', auth, notificationController.getUnreadNotificationsCount);
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/all/read', auth, notificationController.markAllAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;