const express = require('express');
const authRoutes = require('./auth.routes');
const restaurantRoutes = require('./restaurant.routes');
const menuRoutes = require('./menu.routes');
const orderRoutes = require('./order.routes');
const notificationRoutes = require('./notification.routes');
const reviewRoutes = require('./review.routes');
const adminRoutes = require('./admin.routes');
const locationRoutes = require('./location.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menus', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/locations', locationRoutes);

module.exports = router;