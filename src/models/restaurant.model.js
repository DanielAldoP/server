module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'owner_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name'
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'address_id'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description'
    },
    photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'photo'
    },
    status: {
      type: DataTypes.ENUM('pending_verification', 'active', 'rejected', 'suspended'),
      allowNull: false,
      defaultValue: 'pending_verification',
      field: 'status'
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
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
    tableName: 'restaurants',
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

  Restaurant.associate = function(models) {
    Restaurant.belongsTo(models.User, {
      foreignKey: 'owner_id',
      sourceKey: 'id',
      as: 'owner'
    });
    Restaurant.belongsTo(models.Address, {
      foreignKey: 'address_id',
      sourceKey: 'id',
      as: 'address'
    });
    Restaurant.hasOne(models.RestaurantWallet, {
      foreignKey: 'restaurant_id',
      sourceKey: 'id',
      as: 'wallet'
    });
    Restaurant.hasMany(models.Menu, {
      foreignKey: 'restaurant_id',
      sourceKey: 'id',
      as: 'menus'
    });
    Restaurant.hasMany(models.DailyOrder, {
      foreignKey: 'restaurant_id',
      sourceKey: 'id',
      as: 'daily_orders'
    });
    Restaurant.hasMany(models.Review, {
      foreignKey: 'restaurant_id',
      sourceKey: 'id',
      as: 'reviews'
    });
  };

  return Restaurant;
};