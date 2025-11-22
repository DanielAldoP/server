const { Address, City, Province } = require('../models');

class AddressRepository {
  static async create(addressData) {
    return await Address.create(addressData);
  }

  static async findById(id) {
    return await Address.findByPk(id, {
      include: [
        {
          model: City,
          as: 'city',
          include: [
            {
              model: Province,
              as: 'province'
            }
          ]
        }
      ]
    });
  }

  static async findByCityId(cityId) {
    return await Address.findAll({
      where: { city_id: cityId },
      include: [
        {
          model: City,
          as: 'city',
          include: [
            {
              model: Province,
              as: 'province'
            }
          ]
        }
      ]
    });
  }

  static async findByType(type) {
    return await Address.findAll({
      where: { type },
      include: [
        {
          model: City,
          as: 'city',
          include: [
            {
              model: Province,
              as: 'province'
            }
          ]
        }
      ]
    });
  }

  static async update(id, updateData) {
    const address = await Address.findByPk(id);
    if (!address) {
      return null;
    }
    await address.update(updateData);
    return address;
  }

  static async delete(id) {
    const address = await Address.findByPk(id);
    if (!address) {
      return false;
    }
    await address.destroy();
    return true;
  }

  static async findAll() {
    return await Address.findAll({
      include: [
        {
          model: City,
          as: 'city',
          include: [
            {
              model: Province,
              as: 'province'
            }
          ]
        }
      ]
    });
  }

  static async findByName(name) {
    return await Address.findAll({
      where: { name: { [require('sequelize').Op.like]: `%${name}%` } },
      include: [
        {
          model: City,
          as: 'city',
          include: [
            {
              model: Province,
              as: 'province'
            }
          ]
        }
      ]
    });
  }
}

module.exports = AddressRepository;