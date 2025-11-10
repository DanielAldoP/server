const OrderService = require('../services/order.service');
const { ResponseHelper } = require('../helpers/response.helper');

const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    const customer_id = req.user.id;
    const userCity = req.user.city;

    const result = await OrderService.createOrder(items, customer_id, userCity);

    res.status(201).json(ResponseHelper.success(result, 'Order created successfully'));
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const customer_id = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const result = await OrderService.getMyOrders(customer_id, page, limit, status);

    res.json(ResponseHelper.success(result, 'Orders retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const order = await OrderService.getOrderById(id, user_id, userRole);

    res.json(ResponseHelper.success(order, 'Order retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getRestaurantDailyOrders = async (req, res, next) => {
  try {
    const restaurant_id = req.params.id;
    const user_id = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 20, status, delivery_date } = req.query;

    const result = await OrderService.getRestaurantDailyOrders(
      restaurant_id, user_id, userRole, page, limit, status, delivery_date
    );

    res.json(ResponseHelper.success(result, 'Daily orders retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateDailyOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;
    const userRole = req.user.role;

    const dailyOrder = await OrderService.updateDailyOrderStatus(id, status, user_id, userRole);

    res.json(ResponseHelper.success(dailyOrder, `Daily order status updated to ${status}`));
  } catch (error) {
    next(error);
  }
};

const confirmDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { type } = req.body; // 'merchant' or 'customer'

    const dailyOrder = await OrderService.confirmDelivery(id, user_id, type);

    res.json(ResponseHelper.success(dailyOrder, `${type} delivery confirmation recorded`));
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, customer_id, restaurant_id } = req.query;

    const result = await OrderService.getAllOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { status, customer_id, restaurant_id }
    });

    res.json(ResponseHelper.success(result, 'Orders retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getRestaurantDailyOrders,
  updateDailyOrderStatus,
  confirmDelivery,
  getAllOrders
};