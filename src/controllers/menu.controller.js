const MenuService = require('../services/menu.service');
const { successResponse } = require('../helpers/response.helper');

const createMenu = async (req, res, next) => {
  try {
    const { restaurant_id, name, price, description, photo } = req.body;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const menu = await MenuService.createMenu({
      restaurant_id, name, price, description, photo
    }, user_id, userRole);

    res.status(201).json(successResponse(menu, 'Menu created successfully'));
  } catch (error) {
    next(error);
  }
};

const getMenusByRestaurant = async (req, res, next) => {
  try {
    const { restaurant_id } = req.params;
    const { page = 1, limit = 20, day_of_week } = req.query;

    const result = await MenuService.getMenusByRestaurant(restaurant_id, page, limit, day_of_week);

    res.json(successResponse(result, 'Menus retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, photo, is_active } = req.body;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const menu = await MenuService.updateMenu(id, {
      name, price, description, photo, is_active
    }, user_id, userRole);

    res.json(successResponse(menu, 'Menu updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const result = await MenuService.deleteMenu(id, user_id, userRole);

    res.json(successResponse(result, 'Menu deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const createDailyMenuSchedule = async (req, res, next) => {
  try {
    const { menu_id, day_of_week } = req.body;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const dailyMenu = await MenuService.createDailyMenuSchedule(menu_id, day_of_week, user_id, userRole);

    res.status(201).json(successResponse(dailyMenu, 'Daily menu schedule created successfully'));
  } catch (error) {
    next(error);
  }
};

const getDailyMenuSchedule = async (req, res, next) => {
  try {
    const { restaurant_id } = req.params;
    const { day_of_week } = req.query;

    const dailyMenus = await MenuService.getDailyMenuSchedule(restaurant_id, day_of_week);

    res.json(successResponse(dailyMenus, 'Daily menu schedule retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const removeDailyMenuSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const result = await MenuService.removeDailyMenuSchedule(id, user_id, userRole);

    res.json(successResponse(result, 'Daily menu schedule removed successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMenu,
  getMenusByRestaurant,
  updateMenu,
  deleteMenu,
  createDailyMenuSchedule,
  getDailyMenuSchedule,
  removeDailyMenuSchedule
};