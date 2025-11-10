const { Op } = require('sequelize');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async findOne(whereClause, options = {}) {
    return await this.model.findOne({ where: whereClause, ...options });
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async findAndCountAll(options = {}) {
    return await this.model.findAndCountAll(options);
  }

  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  async bulkCreate(data, options = {}) {
    return await this.model.bulkCreate(data, options);
  }

  async update(data, whereClause, options = {}) {
    const [affectedRows] = await this.model.update(data, { where: whereClause, ...options });
    return affectedRows;
  }

  async delete(whereClause, options = {}) {
    const deletedRows = await this.model.destroy({ where: whereClause, ...options });
    return deletedRows;
  }

  async count(whereClause = {}, options = {}) {
    return await this.model.count({ where: whereClause, ...options });
  }

  async sum(field, whereClause = {}, options = {}) {
    return await this.model.sum(field, { where: whereClause, ...options });
  }

  async avg(field, whereClause = {}, options = {}) {
    return await this.model.avg(field, { where: whereClause, ...options });
  }

  async max(field, whereClause = {}, options = {}) {
    return await this.model.max(field, { where: whereClause, ...options });
  }

  async min(field, whereClause = {}, options = {}) {
    return await this.model.min(field, { where: whereClause, ...options });
  }

  async exists(whereClause) {
    const count = await this.model.count({ where: whereClause });
    return count > 0;
  }

  async paginate(page = 1, limit = 20, options = {}) {
    const offset = (page - 1) * limit;
    const { count, rows } = await this.model.findAndCountAll({
      ...options,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    };
  }

  async transaction(callback) {
    const sequelize = this.model.sequelize;
    return await sequelize.transaction(callback);
  }

  buildWhereClause(filters) {
    const whereClause = {};

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        if (typeof filters[key] === 'object' && filters[key].operation) {
          whereClause[key] = {
            [filters[key].operation]: filters[key].value
          };
        } else {
          whereClause[key] = filters[key];
        }
      }
    });

    return whereClause;
  }

  buildIncludeClause(includes = []) {
    return includes.map(include => {
      if (typeof include === 'string') {
        return { model: require(`../models/${include.toLowerCase()}`), as: include };
      }
      return include;
    });
  }
}

module.exports = BaseRepository;