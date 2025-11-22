const { Menu, Restaurant, DailyMenu, DailyOrder, Address, City } = require('../models');
const { NotFoundError, ForbiddenError, ValidationError } = require('../helpers/error.helper');
const { validateRequired, validateNumber } = require('../helpers/validation.helper');

class MenuService {
  static async createMenu(menuData, userId, userRole) {
    const { restaurant_id, name, price, description, photo } = menuData;

    validateRequired(restaurant_id, 'Restaurant ID');
    validateRequired(name, 'Menu name');
    validateNumber(price, 'Price', 0);

    // Check restaurant ownership
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    if (restaurant.owner_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only create menus for your own restaurants');
    }

    // Create menu
    const menu = await Menu.create({
      restaurant_id,
      name,
      price,
      description,
      photo
    });

    return menu;
  }

  static async getMenusByRestaurant(restaurant_id, page = 1, limit = 20, dayOfWeek) {
    const offset = (page - 1) * limit;

    // Check if restaurant exists and is active
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant || restaurant.status !== 'active') {
      throw new NotFoundError('Restaurant');
    }

    const where = { restaurant_id, is_active: true };

    const { count, rows } = await Menu.findAndCountAll({
      where,
      include: [
        {
          model: DailyMenu,
          as: 'daily_menus',
          ...(dayOfWeek && { where: { dayOfWeek } })
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      menus: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async updateMenu(id, updateData, userId, userRole) {
    const { name, price, description, photo, is_active } = updateData;

    const menu = await Menu.findByPk(id, {
      include: [{ model: Restaurant, as: 'restaurant' }]
    });

    if (!menu) {
      throw new NotFoundError('Menu');
    }

    // Check permissions
    if (menu.restaurant.owner_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only update menus for your own restaurants');
    }

    // Update menu
    const updateObj = {};
    if (name !== undefined) updateObj.name = name;
    if (price !== undefined) {
      validateNumber(price, 'Price', 0);
      updateObj.price = price;
    }
    if (description !== undefined) updateObj.description = description;
    if (photo !== undefined) updateObj.photo = photo;
    if (is_active !== undefined) updateObj.is_active = is_active;

    await menu.update(updateObj);

    return menu;
  }

  static async deleteMenu(id, userId, userRole) {
    const menu = await Menu.findByPk(id, {
      include: [{ model: Restaurant, as: 'restaurant' }]
    });

    if (!menu) {
      throw new NotFoundError('Menu');
    }

    // Check permissions
    if (menu.restaurant.owner_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only delete menus for your own restaurants');
    }

    // Check if menu is used in any active daily orders
    const activeOrders = await DailyOrder.count({
      where: {
        restaurant_id: menu.restaurant_id,
        status: ['pending', 'confirmed']
      }
    });

    if (activeOrders > 0) {
      throw new ValidationError('Cannot delete menu that is used in active orders');
    }

    // Soft delete by setting is_active to false
    await menu.update({ is_active: false });

    return { message: 'Menu deleted successfully' };
  }

  static async createDailyMenuSchedule(menu_id, dayOfWeek, userId, userRole) {
    validateRequired(menu_id, 'Menu ID');
    validateRequired(dayOfWeek, 'Day of week');

    if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(dayOfWeek)) {
      throw new ValidationError('Invalid day of week');
    }

    const menu = await Menu.findByPk(menu_id, {
      include: [{ model: Restaurant, as: 'restaurant' }]
    });

    if (!menu) {
      throw new NotFoundError('Menu');
    }

    if (menu.restaurant.owner_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only schedule menus for your own restaurants');
    }

    // Check if schedule already exists
    const existingSchedule = await DailyMenu.findOne({
      where: { menu_id: menu_id, dayOfWeek }
    });

    if (existingSchedule) {
      throw new ValidationError('Menu is already scheduled for this day');
    }

    // Create daily menu schedule
    const dailyMenu = await DailyMenu.create({
      menu_id,
      dayOfWeek
    });

    return dailyMenu;
  }

  static async getDailyMenuSchedule(restaurant_id, dayOfWeek) {
    // Check restaurant
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant || restaurant.status !== 'active') {
      throw new NotFoundError('Restaurant');
    }

    const where = {};
    if (dayOfWeek) {
      where.dayOfWeek = dayOfWeek;
    }

    const dailyMenus = await DailyMenu.findAll({
      where,
      include: [
        {
          model: Menu,
          as: 'menu',
          where: { restaurant_id, is_active: true }
        }
      ],
      order: [['dayOfWeek', 'ASC']]
    });

    return dailyMenus;
  }

  static async removeDailyMenuSchedule(id, userId, userRole) {
    const dailyMenu = await DailyMenu.findByPk(id, {
      include: [
        {
          model: Menu,
          as: 'menu',
          include: [{ model: Restaurant, as: 'restaurant' }]
        }
      ]
    });

    if (!dailyMenu) {
      throw new NotFoundError('Daily menu schedule');
    }

    if (dailyMenu.menu.restaurant.ownerId !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only remove schedules for your own restaurants');
    }

    await dailyMenu.destroy();

    return { message: 'Daily menu schedule removed successfully' };
  }

  static async validateMenuAvailability(menu_id, userCity) {
    const menu = await Menu.findByPk(menu_id, {
      include: [
        {
          model: Restaurant, as: 'restaurant',
          attributes: ['id', 'owner_id', 'name', 'status'],
          include: [
            {
              model: Address,
              as: 'address',
              include: [
                {
                  model: City,
                  as: 'city'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!menu || !menu.is_active) {
      throw new ValidationError(`Menu with ID ${menu_id} is not available`);
    }

    if (menu.restaurant.status !== 'active') {
      throw new ValidationError(`Restaurant ${menu.restaurant.name} is not active`);
    }

    // Check if restaurant is in user's city
    const restaurantCity = menu.restaurant.address?.city;
    if (!restaurantCity) {
      throw new ValidationError(`Restaurant ${menu.restaurant.name} has no valid address`);
    }

    let userCityValue = userCity;
    if (typeof userCity === 'object' && userCity.name) {
      userCityValue = userCity.name.toLowerCase();
    } else if (typeof userCity === 'string') {
      userCityValue = userCity.toLowerCase();
    } else if (typeof userCity === 'number') {
      // Compare by city ID
      if (restaurantCity.id !== userCity) {
        throw new ValidationError(`Restaurant ${menu.restaurant.name} is not in your city`);
      }
    }

    // Compare city names if we have string values
    if (typeof userCityValue === 'string' && restaurantCity.name.toLowerCase() !== userCityValue) {
      throw new ValidationError(`Restaurant ${menu.restaurant.name} is not in your city`);
    }

    return menu;
  }

  static async getMenuById(id) {
    const menu = await Menu.findByPk(id, {
      include: [
        {
          model: Restaurant, as: 'restaurant',
          attributes: ['id', 'name', 'status'],
          include: [
            {
              model: Address,
              as: 'address',
              include: [
                {
                  model: City,
                  as: 'city'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!menu) {
      throw new NotFoundError('Menu');
    }

    return menu;
  }

  static async validateMenuOwnership(menu_id, userId, userRole) {
    const menu = await Menu.findByPk(menu_id, {
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'owner_id', 'name'] }]
    });

    if (!menu) {
      throw new NotFoundError('Menu');
    }

    if (menu.restaurant.owner_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only access menus for your own restaurants');
    }

    return menu;
  }

  static async getMenusForScheduling(restaurant_id, userId, userRole) {
    // Verify restaurant ownership
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    if (restaurant.owner_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only schedule menus for your own restaurants');
    }

    const menus = await Menu.findAll({
      where: { restaurant_id, is_active: true },
      order: [['name', 'ASC']]
    });

    return menus;
  }

  static async getRestaurantMenuStats(restaurant_id) {
    const stats = await Menu.findOne({
      where: { restaurant_id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalMenus'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN is_active = true THEN 1 END')), 'activeMenus'],
        [require('sequelize').fn('AVG', require('sequelize').col('price')), 'averagePrice']
      ]
    });

    return {
      totalMenus: parseInt(stats.dataValues.totalMenus || 0),
      activeMenus: parseInt(stats.dataValues.activeMenus || 0),
      averagePrice: parseFloat(stats.dataValues.averagePrice || 0)
    };
  }
}

module.exports = MenuService;