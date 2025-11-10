const { Sequelize } = require('sequelize');
const config = require('../config/database');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool || {}
  }
);

const models = {
  User: require('./user.model')(sequelize, Sequelize.DataTypes),
  UserWallet: require('./user-wallet.model')(sequelize, Sequelize.DataTypes),
  Restaurant: require('./restaurant.model')(sequelize, Sequelize.DataTypes),
  RestaurantWallet: require('./restaurant-wallet.model')(sequelize, Sequelize.DataTypes),
  Menu: require('./menu.model')(sequelize, Sequelize.DataTypes),
  DailyMenu: require('./daily-menu.model')(sequelize, Sequelize.DataTypes),
  Order: require('./order.model')(sequelize, Sequelize.DataTypes),
  DailyOrder: require('./daily-order.model')(sequelize, Sequelize.DataTypes),
  DailyOrderItem: require('./daily-order-item.model')(sequelize, Sequelize.DataTypes),
  Review: require('./review.model')(sequelize, Sequelize.DataTypes),
  WalletTransaction: require('./wallet-transaction.model')(sequelize, Sequelize.DataTypes),
  AdminChat: require('./admin-chat.model')(sequelize, Sequelize.DataTypes),
  AdminChatMessage: require('./admin-chat-message.model')(sequelize, Sequelize.DataTypes),
  Notification: require('./notification.model')(sequelize, Sequelize.DataTypes)
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models
};