module.exports = (sequelize, DataTypes) => {
  const RestaurantWallet = sequelize.define('RestaurantWallet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    restaurant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'restaurant_id',
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'balance'
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
    tableName: 'restaurant_wallets',
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

  RestaurantWallet.associate = function(models) {
    RestaurantWallet.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    RestaurantWallet.hasMany(models.WalletTransaction, {
      foreignKey: 'restaurant_wallet_id',
      as: 'transactions'
    });
  };

  return RestaurantWallet;
};