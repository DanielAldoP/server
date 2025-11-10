const RestaurantService = require('../services/restaurant.service');
const { successResponse } = require('../helpers/response.helper');

const createRestaurant = async (req, res, next) => {
  try {
    const { name, full_address, city, description, photo } = req.body;
    const owner_id = req.user.id;

    const restaurant = await RestaurantService.createRestaurant({
      name, full_address, city, description, photo
    }, owner_id);

    res.status(201).json(successResponse(restaurant, 'Restaurant created successfully. Awaiting admin verification.'));
  } catch (error) {
    next(error);
  }
};

const getRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, city } = req.query;

    const result = await RestaurantService.getRestaurants(page, limit, city);

    res.json(successResponse(result, 'Restaurants retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userCity = req.user.city;
    const userRole = req.user.role;
    const user_id = req.user.id;

    const restaurant = await RestaurantService.getRestaurantById(id, userCity, userRole, user_id);

    res.json(successResponse(restaurant, 'Restaurant retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, full_address, city, description, photo } = req.body;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const restaurant = await RestaurantService.updateRestaurant(id, {
      name, full_address, city, description, photo
    }, user_id, userRole);

    res.json(successResponse(restaurant, 'Restaurant updated successfully'));
  } catch (error) {
    next(error);
  }
};

const getMyRestaurants = async (req, res, next) => {
  try {
    const owner_id = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await RestaurantService.getMyRestaurants(owner_id, page, limit);

    res.json(successResponse(result, 'Your restaurants retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const verifyRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const restaurant = await RestaurantService.verifyRestaurant(id, status, rejection_reason);

    res.json(successResponse(restaurant, `Restaurant ${status} successfully`));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  getMyRestaurants,
  verifyRestaurant
};