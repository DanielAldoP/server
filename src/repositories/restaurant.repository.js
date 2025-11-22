const BaseRepository = require('./base.repository');
const { Restaurant, RestaurantWallet, User, Menu, Review, Address, City } = require('../models');

class RestaurantRepository extends BaseRepository {
  constructor() {
    super(Restaurant);
  }

  async findByIdWithOwner(id) {
    return await this.findById(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone_number']
        },
        {
          model: Address,
          as: 'address',
          include: [
            {
              model: City,
              as: 'city',
              include: [
                {
                  model: require('../models').Province,
                  as: 'province'
                }
              ]
            }
          ]
        },
        {
          model: RestaurantWallet,
          as: 'wallet',
          attributes: ['balance']
        }
      ]
    });
  }

  async findByIdWithDetails(id, options = {}) {
    const include = [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name']
      },
      {
        model: Address,
        as: 'address',
        include: [
          {
            model: City,
            as: 'city',
            include: [
              {
                model: require('../models').Province,
                as: 'province'
              }
            ]
          }
        ]
      },
      {
        model: Menu,
        as: 'menus',
        where: { is_active: true },
        required: false,
        ...(options.includeMenus !== false && {})
      },
      {
        model: Review,
        as: 'reviews',
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['name']
          }
        ],
        ...(options.includeReviews !== false && {})
      }
    ].filter(Boolean);

    return await this.findById(id, {
      include,
      ...(options.includeInactiveMenus && {
        include: [
          {
            model: Menu,
            as: 'menus',
            required: false
          }
        ]
      })
    });
  }

  async findActiveRestaurants(page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ status: 'active', ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'phone_number']
        },
        {
          model: RestaurantWallet,
          as: 'wallet',
          attributes: ['balance']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findByCity(city, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ status: 'active', ...filters });

    let include = [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'phone_number']
      }
    ];

    // Add address filtering if city is provided
    if (city) {
      include.push({
        model: Address,
        as: 'address',
        include: [
          {
            model: City,
            as: 'city',
            where: typeof city === 'string'
              ? { name: { [require('sequelize').Op.like]: `%${city}%` } }
              : { id: city },
            include: [
              {
                model: require('../models').Province,
                as: 'province'
              }
            ]
          }
        ]
      });
    } else {
      include.push({
        model: Address,
        as: 'address',
        include: [
          {
            model: City,
            as: 'city',
            include: [
              {
                model: require('../models').Province,
                as: 'province'
              }
            ]
          }
        ]
      });
    }

    include.push({
      model: RestaurantWallet,
      as: 'wallet',
      attributes: ['balance']
    });

    return await this.paginate(page, limit, {
      where: whereClause,
      include,
      order: [['created_at', 'DESC']]
    });
  }

  async findByOwner(owner_id, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ owner_id, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: RestaurantWallet,
          as: 'wallet',
          attributes: ['balance']
        },
        {
          model: Menu,
          as: 'menus',
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findByStatus(status, page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause({ status, ...filters });

    return await this.paginate(page, limit, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone_number']
        },
        {
          model: RestaurantWallet,
          as: 'wallet',
          attributes: ['balance']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findPendingRestaurants() {
    return await this.findAll({
      where: { status: 'pending_verification' },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'ASC']]
    });
  }

  async getRestaurantStats(restaurant_id) {
    const restaurant = await this.findById(restaurant_id, {
      include: [
        {
          model: Menu,
          as: 'menus',
          attributes: ['id', 'is_active', 'price']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating', 'is_active']
        }
      ]
    });

    if (!restaurant) return null;

    const menus = restaurant.menus || [];
    const reviews = restaurant.reviews || [];

    const menuStats = {
      total: menus.length,
      active: menus.filter(m => m.is_active).length,
      averagePrice: menus.length > 0
        ? menus.reduce((sum, m) => sum + parseFloat(m.price || 0), 0) / menus.length
        : 0
    };

    const reviewStats = {
      total: reviews.filter(r => r.is_active).length,
      averageRating: reviews.filter(r => r.is_active).length > 0
        ? reviews.filter(r => r.is_active).reduce((sum, r) => sum + r.rating, 0) / reviews.filter(r => r.is_active).length
        : 0
    };

    return {
      ...restaurant.toJSON(),
      menuStats,
      reviewStats
    };
  }

  async createWithWallet(restaurantData) {
    const result = await this.transaction(async (t) => {
      const restaurant = await this.create(restaurantData, { transaction: t });

      if (restaurant) {
        await RestaurantWallet.create({
          restaurant_id: restaurant.id,
          balance: 0.00
        }, { transaction: t });
      }

      return restaurant;
    });

    return await this.findByIdWithOwner(result.id);
  }

  async updateStatus(id, status, rejection_reason = null) {
    return await this.update(
      { status, rejection_reason: status === 'rejected' ? rejection_reason : null },
      { id }
    );
  }

  async findInCity(city, userCity, id) {
    return await this.findOne({
      id,
      city: userCity,
      status: 'active'
    });
  }

  async existsByOwner(owner_id, restaurant_id = null) {
    const whereClause = { owner_id };
    if (restaurant_id) {
      whereClause.id = restaurant_id;
    }
    return await this.exists(whereClause);
  }
}

module.exports = new RestaurantRepository();