module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      field: 'email'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password'
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'phone_number'
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'address_id'
    },
    role: {
      type: DataTypes.ENUM('customer', 'merchant', 'admin'),
      allowNull: false,
      defaultValue: 'customer',
      field: 'role'
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
    tableName: 'users',
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        const bcrypt = require('bcryptjs');
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
        // Set epoch timestamp
        user.created_at = Math.floor(Date.now() / 1000);
        user.updated_at = Math.floor(Date.now() / 1000);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const bcrypt = require('bcryptjs');
          user.password = await bcrypt.hash(user.password, 12);
        }
        // Update epoch timestamp on any change
        if (user.changed()) {
          user.updated_at = Math.floor(Date.now() / 1000);
        }
      }
    }
  });

  User.associate = function(models) {
    User.hasOne(models.UserWallet, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      as: 'wallet'
    });
    User.belongsTo(models.Address, {
      foreignKey: 'address_id',
      sourceKey: 'id',
      as: 'address'
    });
    User.hasMany(models.Restaurant, {
      foreignKey: 'owner_id',
      sourceKey: 'id',
      as: 'restaurants'
    });
    User.hasMany(models.Order, {
      foreignKey: 'customer_id',
      sourceKey: 'id',
      as: 'orders'
    });
    User.hasMany(models.Review, {
      foreignKey: 'customer_id',
      sourceKey: 'id',
      as: 'reviews'
    });
    User.hasMany(models.AdminChat, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      as: 'admin_chats'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      as: 'notifications'
    });
  };

  User.prototype.validatePassword = async function(password) {
    return await require('bcryptjs').compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  return User;
};