const BaseRepository = require('./base.repository');
const { Menu, Restaurant, DailyMenu } = require('../models');

class MenuRepository extends BaseRepository {
  constructor() {
    super(Menu);
  }

  async findByIdWithRestaurant(id) {
    return await this.findById(id, {
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'owner_id', 'city', 'name', 'status']
      }]
    });
  }

  async findByRestaurant(restaurant_id, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ restaurant_id, is_active: true, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: DailyMenu,
          as: 'dailyMenus',
          ...(filters.day_of_week && { where: { day_of_week: filters.day_of_week } })
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findByRestaurantWithSchedule(restaurant_id, day_of_week = null) {
    const whereClause = this.buildWhereClause({ restaurant_id, is_active: true });

    return await this.findAll({
      where: whereClause,
      include: [
        {
          model: DailyMenu,
          as: 'dailyMenus',
          ...(day_of_week && { where: { day_of_week } })
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findActiveByRestaurant(restaurant_id) {
    return await this.findAll({
      where: { restaurant_id, is_active: true },
      order: [['name', 'ASC']]
    });
  }

  async findByAvailability(menu_id, user_city) {
    return await this.findById(menu_id, {
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'owner_id', 'city', 'name', 'status'],
        where: {
          city: user_city,
          status: 'active'
        }
      }]
    });
  }

  async findScheduledForDay(restaurant_id, day_of_week) {
    return await this.findAll({
      include: [
        {
          model: DailyMenu,
          as: 'dailyMenus',
          where: { day_of_week },
          required: true
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'city'],
          where: { status: 'active' }
        }
      ],
      order: [['name', 'ASC']]
    });
  }

  async validateMenuAvailability(menu_id, user_city) {
    const menu = await this.findByAvailability(menu_id, user_city);

    if (!menu || !menu.is_active) {
      throw new Error(`Menu with ID ${menu_id} is not available`);
    }

    if (menu.restaurant.status !== 'active') {
      throw new Error(`Restaurant ${menu.restaurant.name} is not active`);
    }

    if (menu.restaurant.city !== user_city) {
      throw new Error(`Restaurant ${menu.restaurant.name} is not in your city`);
    }

    return menu;
  }

  async checkActiveOrders(restaurant_id) {
    const { DailyOrder } = require('../models');
    return await DailyOrder.count({
      where: {
        restaurant_id,
        status: ['pending', 'confirmed']
      }
    });
  }

  async getMenuStats(restaurant_id) {
    const menus = await this.findAll({
      where: { restaurant_id },
      attributes: ['is_active', 'price']
    });

    const activeMenus = menus.filter(m => m.is_active);
    const totalPrices = activeMenus.map(m => parseFloat(m.price || 0));

    return {
      totalMenus: menus.length,
      activeMenus: activeMenus.length,
      averagePrice: totalPrices.length > 0
        ? totalPrices.reduce((sum, price) => sum + price, 0) / totalPrices.length
        : 0
    };
  }

  async softDelete(id) {
    return await this.update({ is_active: false }, { id });
  }

  async existsDailyMenuSchedule(menu_id, day_of_week) {
    return await DailyMenu.findOne({
      where: { menu_id, day_of_week }
    });
  }

  async createDailyMenuSchedule(menu_id, day_of_week) {
    return await DailyMenu.create({
      menu_id,
      day_of_week
    });
  }

  async removeDailyMenuSchedule(id) {
    return await DailyMenu.destroy({ where: { id } });
  }

  async validateOwnership(menu_id, user_id, user_role) {
    const menu = await this.findByIdWithRestaurant(menu_id);

    if (!menu) {
      throw new Error('Menu not found');
    }

    if (menu.restaurant.owner_id !== user_id && user_role !== 'admin') {
      throw new Error('You can only access menus for your own restaurants');
    }

    return menu;
  }

  async updateMenu(id, updateData) {
    const { name, price, description, photo, is_active } = updateData;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (price !== undefined) updateFields.price = price;
    if (description !== undefined) updateFields.description = description;
    if (photo !== undefined) updateFields.photo = photo;
    if (is_active !== undefined) updateFields.is_active = is_active;

    await this.update(updateFields, { id });

    return await this.findByIdWithRestaurant(id);
  }
}

module.exports = new MenuRepository();