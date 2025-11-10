module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'customer_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    status: {
      type: DataTypes.ENUM('pending_payment', 'paid', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending_payment',
      field: 'status'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'payment_method'
    },
    payment_gateway_transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'payment_gateway_transaction_id'
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_date'
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
    tableName: 'orders',
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

  Order.associate = function(models) {
    Order.belongsTo(models.User, {
      foreignKey: 'customer_id',
      sourceKey: 'id',
      as: 'customer'
    });
    Order.hasMany(models.DailyOrder, {
      foreignKey: 'order_id',
      sourceKey: 'id',
      as: 'daily_orders'
    });
    Order.hasMany(models.Notification, {
      foreignKey: 'related_order_id',
      sourceKey: 'id',
      as: 'notifications'
    });
  };

  return Order;
};