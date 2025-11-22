module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'city_id',
      references: {
        model: 'cities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name'
    },
    type: {
      type: DataTypes.ENUM('user', 'restaurant'),
      allowNull: false,
      field: 'type'
    },
    meta: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'meta'
    },
    created_at: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000),
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000),
      field: 'updated_at'
    }
  }, {
    tableName: 'addresses',
    timestamps: false,
    hooks: {
      beforeCreate: (instance, options) => {
        const now = Math.floor(Date.now() / 1000);
        instance.created_at = now;
        instance.updated_at = now;
      },
      beforeUpdate: (instance, options) => {
        if (instance.changed()) {
          instance.updated_at = Math.floor(Date.now() / 1000);
        }
      }
    }
  });

  Address.associate = function(models) {
    Address.belongsTo(models.City, {
      foreignKey: 'city_id',
      sourceKey: 'id',
      as: 'city'
    });
    Address.hasMany(models.User, {
      foreignKey: 'address_id',
      sourceKey: 'id',
      as: 'users'
    });
    Address.hasMany(models.Restaurant, {
      foreignKey: 'address_id',
      sourceKey: 'id',
      as: 'restaurants'
    });
  };

  return Address;
};