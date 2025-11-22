const { Province, City } = require('../models');
const { NotFoundError } = require('../helpers/error.helper');

class LocationService {
  static async getAllProvinces() {
    const provinces = await Province.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    return {
      provinces,
      total: provinces.length
    };
  }

  static async getProvinceById(id) {
    const province = await Province.findByPk(id, {
      attributes: ['id', 'name'],
      include: [
        {
          model: City,
          as: 'cities',
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        }
      ]
    });

    if (!province) {
      throw new NotFoundError('Province');
    }

    return province;
  }

  static async getCitiesByProvinceId(provinceId) {
    // First verify province exists
    const province = await Province.findByPk(provinceId, {
      attributes: ['id', 'name']
    });

    if (!province) {
      throw new NotFoundError('Province');
    }

    const cities = await City.findAll({
      where: { province_id: provinceId },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    return {
      province: {
        id: province.id,
        name: province.name
      },
      cities,
      total: cities.length
    };
  }

  static async getAllCities() {
    const cities = await City.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'name']
        }
      ],
      order: [
        [{ model: Province, as: 'province' }, 'name', 'ASC'],
        ['name', 'ASC']
      ]
    });

    return {
      cities,
      total: cities.length
    };
  }

  static async getCityById(id) {
    const city = await City.findByPk(id, {
      attributes: ['id', 'name'],
      include: [
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!city) {
      throw new NotFoundError('City');
    }

    return city;
  }

  static async searchProvinces(query) {
    const provinces = await Province.findAll({
      where: {
        name: {
          [require('sequelize').Op.like]: `%${query}%`
        }
      },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    return {
      provinces,
      total: provinces.length,
      query
    };
  }

  static async searchCities(query, provinceId = null) {
    const whereClause = {
      name: {
        [require('sequelize').Op.like]: `%${query}%`
      }
    };

    if (provinceId) {
      whereClause.province_id = provinceId;
    }

    const cities = await City.findAll({
      where: whereClause,
      attributes: ['id', 'name'],
      include: [
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'name']
        }
      ],
      order: [
        [{ model: Province, as: 'province' }, 'name', 'ASC'],
        ['name', 'ASC']
      ]
    });

    return {
      cities,
      total: cities.length,
      query,
      province_id: provinceId
    };
  }
}

module.exports = LocationService;