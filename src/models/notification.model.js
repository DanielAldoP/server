module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'message'
    },
    type: {
      type: DataTypes.ENUM(
        'order_paid',
        'order_complete',
        'order_cancelled',
        'payment_success',
        'payment_failed',
        'order_delivered',
        'order_confirmed',
        'restaurant_approved',
        'restaurant_rejected',
        'new_message'
      ),
      allowNull: false,
      field: 'type'
    },
    related_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'related_order_id',
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    related_daily_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'related_daily_order_id',
      references: {
        model: 'daily_orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read'
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
    tableName: 'notifications',
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

  Notification.associate = function(models) {
    Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Notification.belongsTo(models.Order, { foreignKey: 'related_order_id', as: 'order' });
    Notification.belongsTo(models.DailyOrder, { foreignKey: 'related_daily_order_id', as: 'daily_order' });
  };

  return Notification;
};