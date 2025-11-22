const LocationService = require('../services/location.service');
const { successResponse, errorResponse } = require('../helpers/response.helper');

class LocationController {
  /**
   * Get all provinces
   * GET /api/v1/locations/provinces
   */
  static async getProvinces(req, res, next) {
    try {
      const result = await LocationService.getAllProvinces();

      return successResponse(res, 200, 'Provinces retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get province by ID with cities
   * GET /api/v1/locations/provinces/:id
   */
  static async getProvinceById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return errorResponse(res, 400, 'Invalid province ID');
      }

      const result = await LocationService.getProvinceById(parseInt(id));

      return successResponse(res, 200, 'Province retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cities by province ID
   * GET /api/v1/locations/provinces/:provinceId/cities
   */
  static async getCitiesByProvinceId(req, res, next) {
    try {
      const { provinceId } = req.params;

      // Validate province ID
      if (!provinceId || isNaN(provinceId)) {
        return errorResponse(res, 400, 'Invalid province ID');
      }

      const result = await LocationService.getCitiesByProvinceId(parseInt(provinceId));

      return successResponse(res, 200, 'Cities retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all cities
   * GET /api/v1/locations/cities
   */
  static async getAllCities(req, res, next) {
    try {
      const result = await LocationService.getAllCities();

      return successResponse(res, 200, 'Cities retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get city by ID
   * GET /api/v1/locations/cities/:id
   */
  static async getCityById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return errorResponse(res, 400, 'Invalid city ID');
      }

      const result = await LocationService.getCityById(parseInt(id));

      return successResponse(res, 200, 'City retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search provinces
   * GET /api/v1/locations/provinces/search?q=query
   */
  static async searchProvinces(req, res, next) {
    try {
      const { q } = req.query;

      // Validate search query
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return errorResponse(res, 400, 'Search query must be at least 2 characters long');
      }

      const result = await LocationService.searchProvinces(q.trim());

      return successResponse(res, 200, 'Provinces search completed', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search cities
   * GET /api/v1/locations/cities/search?q=query&province_id=id
   */
  static async searchCities(req, res, next) {
    try {
      const { q, province_id } = req.query;

      // Validate search query
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return errorResponse(res, 400, 'Search query must be at least 2 characters long');
      }

      const provinceId = province_id ? parseInt(province_id) : null;

      // Validate province ID if provided
      if (province_id && isNaN(provinceId)) {
        return errorResponse(res, 400, 'Invalid province ID');
      }

      const result = await LocationService.searchCities(q.trim(), provinceId);

      return successResponse(res, 200, 'Cities search completed', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LocationController;