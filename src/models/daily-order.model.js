module.exports = (sequelize, DataTypes) => {
  const DailyOrder = sequelize.define('DailyOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'delivery_date'
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'status'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    merchant_confirmed_delivery: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'merchant_confirmed_delivery'
    },
    customer_confirmed_delivery: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'customer_confirmed_delivery'
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancelled_at'
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cancellation_reason'
    },
    cancelled_by: {
      type: DataTypes.ENUM('customer', 'merchant', 'admin'),
      allowNull: true,
      field: 'cancelled_by'
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
    tableName: 'daily_orders',
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
    },
    indexes: [
      {
        fields: ['restaurant_id', 'delivery_date']
      },
      {
        fields: ['status']
      }
    ]
  });

  DailyOrder.associate = function(models) {
    DailyOrder.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    DailyOrder.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    DailyOrder.hasMany(models.DailyOrderItem, { foreignKey: 'daily_order_id', as: 'items' });
    DailyOrder.hasMany(models.Review, { foreignKey: 'daily_order_id', as: 'reviews' });
    DailyOrder.hasMany(models.Notification, { foreignKey: 'related_daily_order_id', as: 'notifications' });
  };

  return DailyOrder;
};