module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define('WalletTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    user_wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_wallet_id',
      references: {
        model: 'user_wallets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    restaurant_wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'restaurant_wallet_id',
      references: {
        model: 'restaurant_wallets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    type: {
      type: DataTypes.ENUM('topup', 'deduct', 'payment_in', 'payment_out', 'refund'),
      allowNull: false,
      field: 'type'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'amount'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description'
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
    previous_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'previous_balance'
    },
    new_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'new_balance'
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
    tableName: 'wallet_transactions',
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

  WalletTransaction.associate = function(models) {
    WalletTransaction.belongsTo(models.UserWallet, { foreignKey: 'user_wallet_id', as: 'user_wallet' });
    WalletTransaction.belongsTo(models.RestaurantWallet, { foreignKey: 'restaurant_wallet_id', as: 'restaurant_wallet' });
    WalletTransaction.belongsTo(models.Order, { foreignKey: 'related_order_id', as: 'order' });
    WalletTransaction.belongsTo(models.DailyOrder, { foreignKey: 'related_daily_order_id', as: 'daily_order' });
  };

  return WalletTransaction;
};