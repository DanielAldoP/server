const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const menuController = require('../controllers/menu.controller');
const { validateRequest } = require('../middleware/validation.middleware');
const {
  createMenuValidation,
  updateMenuValidation,
  createDailyMenuScheduleValidation
} = require('../validators/menu.validator');

// Public routes
router.get('/restaurant/:restaurantId', menuController.getMenusByRestaurant);
router.get('/schedule/:restaurantId', menuController.getDailyMenuSchedule);

// Protected routes - merchants only
router.post('/', auth, authorize('merchant'), validateRequest(createMenuValidation), menuController.createMenu);
router.put('/:id', auth, authorize('merchant'), validateRequest(updateMenuValidation), menuController.updateMenu);
router.delete('/:id', auth, authorize('merchant'), menuController.deleteMenu);
router.post('/schedule', auth, authorize('merchant'), validateRequest(createDailyMenuScheduleValidation), menuController.createDailyMenuSchedule);
router.delete('/schedule/:id', auth, authorize('merchant'), menuController.removeDailyMenuSchedule);

// Admin only routes (can manage all menus)
router.post('/admin', auth, authorize('admin'), validateRequest(createMenuValidation), menuController.createMenu);
router.put('/admin/:id', auth, authorize('admin'), validateRequest(updateMenuValidation), menuController.updateMenu);
router.delete('/admin/:id', auth, authorize('admin'), menuController.deleteMenu);

module.exports = router;