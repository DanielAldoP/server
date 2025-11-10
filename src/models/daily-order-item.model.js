module.exports = (sequelize, DataTypes) => {
  const DailyOrderItem = sequelize.define('DailyOrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    daily_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'daily_order_id',
      references: {
        model: 'daily_orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'menu_id',
      references: {
        model: 'menus',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'quantity'
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price'
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_price'
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
    tableName: 'daily_order_items',
    timestamps: false,
    hooks: {
      beforeCreate: (instance, options) => {
        const now = Math.floor(Date.now() / 1000);
        instance.created_at = now;
        instance.updated_at = now;
        instance.total_price = instance.quantity * instance.unit_price;
      },
      beforeUpdate: (instance, options) => {
        if (instance.changed()) {
          instance.updated_at = Math.floor(Date.now() / 1000);
          if (instance.changed('quantity') || instance.changed('unit_price')) {
            instance.total_price = instance.quantity * instance.unit_price;
          }
        }
      }
    }
  });

  DailyOrderItem.associate = function(models) {
    DailyOrderItem.belongsTo(models.DailyOrder, { foreignKey: 'daily_order_id', as: 'daily_order' });
    DailyOrderItem.belongsTo(models.Menu, { foreignKey: 'menu_id', as: 'menu' });
  };

  return DailyOrderItem;
};