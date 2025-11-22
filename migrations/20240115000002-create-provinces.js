'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('provinces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: () => Math.floor(Date.now() / 1000)
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: () => Math.floor(Date.now() / 1000)
      }
    });

    // Add indexes
    await queryInterface.addIndex('provinces', ['name'], {
      name: 'provinces_name_idx',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('provinces');
  }
};