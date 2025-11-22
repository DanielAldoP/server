const AuthService = require('../services/auth.service');
const { ResponseHelper } = require('../helpers/response.helper');
const { NotFoundError } = require('../helpers/error.helper');

const register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(200).json(ResponseHelper.success(result, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(ResponseHelper.success(result, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const user = await AuthService.getProfile(user_id);
    res.json(ResponseHelper.success(user, 'Profile retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const updatedUser = await AuthService.updateProfile(user_id, req.body);
    res.json(ResponseHelper.success(updatedUser, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { current_password, new_password } = req.body;
    const result = await AuthService.changePassword(user_id, current_password, new_password);
    res.json(ResponseHelper.success(result, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};