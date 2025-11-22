const { City, Province } = require('../models');

class CityRepository {
  static async create(cityData) {
    return await City.create(cityData);
  }

  static async findById(id) {
    return await City.findByPk(id, {
      include: [
        {
          model: Province,
          as: 'province'
        }
      ]
    });
  }

  static async findByProvinceId(provinceId) {
    return await City.findAll({
      where: { province_id: provinceId },
      include: [
        {
          model: Province,
          as: 'province'
        }
      ]
    });
  }

  static async findByName(name) {
    return await City.findOne({
      where: { name: { [require('sequelize').Op.like]: `%${name}%` } },
      include: [
        {
          model: Province,
          as: 'province'
        }
      ]
    });
  }

  static async update(id, updateData) {
    const city = await City.findByPk(id);
    if (!city) {
      return null;
    }
    await city.update(updateData);
    return city;
  }

  static async delete(id) {
    const city = await City.findByPk(id);
    if (!city) {
      return false;
    }
    await city.destroy();
    return true;
  }

  static async findAll() {
    return await City.findAll({
      include: [
        {
          model: Province,
          as: 'province'
        }
      ]
    });
  }

  static async findOrCreate(name, provinceId) {
    const [city, created] = await City.findOrCreate({
      where: {
        name: name.trim(),
        province_id: provinceId
      },
      defaults: {
        name: name.trim(),
        province_id: provinceId
      },
      include: [
        {
          model: Province,
          as: 'province'
        }
      ]
    });
    return { city, created };
  }
}

module.exports = CityRepository;