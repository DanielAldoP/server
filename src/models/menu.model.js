module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    restaurant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'restaurant_id',
      references: {
        model: 'restaurants',
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'price'
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
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
    tableName: 'menus',
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

  Menu.associate = function(models) {
    Menu.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      sourceKey: 'id',
      as: 'restaurant'
    });
    Menu.belongsToMany(models.DailyOrder, {
      through: models.DailyOrderItem,
      foreignKey: 'menu_id',
      otherKey: 'daily_order_id',
      as: 'daily_orders'
    });
    Menu.hasMany(models.DailyMenu, {
      foreignKey: 'menu_id',
      sourceKey: 'id',
      as: 'daily_menus'
    });
  };

  return Menu;
};