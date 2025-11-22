const express = require('express');
const LocationController = require('../controllers/location.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for public location endpoints
const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many location requests, please try again later.'
  }
});

router.use(locationLimiter);

/**
 * @route   GET /api/v1/locations/provinces
 * @desc    Get all provinces
 * @access  Public
 */
router.get('/provinces', LocationController.getProvinces);

/**
 * @route   GET /api/v1/locations/provinces/search
 * @desc    Search provinces by name
 * @access  Public
 * @query   q - search query (min 2 characters)
 * @example GET /api/v1/locations/provinces/search?q=jakarta
 */
router.get('/provinces/search', LocationController.searchProvinces);

/**
 * @route   GET /api/v1/locations/provinces/:id
 * @desc    Get province by ID with cities
 * @access  Public
 * @param   id - province ID
 * @example GET /api/v1/locations/provinces/1
 */
router.get('/provinces/:id', LocationController.getProvinceById);

/**
 * @route   GET /api/v1/locations/provinces/:provinceId/cities
 * @desc    Get cities by province ID
 * @access  Public
 * @param   provinceId - province ID
 * @example GET /api/v1/locations/provinces/1/cities
 */
router.get('/provinces/:provinceId/cities', LocationController.getCitiesByProvinceId);

/**
 * @route   GET /api/v1/locations/cities
 * @desc    Get all cities with provinces
 * @access  Public
 */
router.get('/cities', LocationController.getAllCities);

/**
 * @route   GET /api/v1/locations/cities/search
 * @desc    Search cities by name (optionally filter by province)
 * @access  Public
 * @query   q - search query (min 2 characters)
 * @query   province_id - optional province ID to filter by
 * @example GET /api/v1/locations/cities/search?q=bandung
 * @example GET /api/v1/locations/cities/search?q=bandung&province_id=2
 */
router.get('/cities/search', LocationController.searchCities);

/**
 * @route   GET /api/v1/locations/cities/:id
 * @desc    Get city by ID with province
 * @access  Public
 * @param   id - city ID
 * @example GET /api/v1/locations/cities/1
 */
router.get('/cities/:id', LocationController.getCityById);

module.exports = router;