'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      city_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'cities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM('user', 'restaurant')
      },
      meta: {
        allowNull: true,
        type: Sequelize.TEXT
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
    await queryInterface.addIndex('addresses', ['city_id'], {
      name: 'addresses_city_id_idx'
    });

    await queryInterface.addIndex('addresses', ['type'], {
      name: 'addresses_type_idx'
    });

    await queryInterface.addIndex('addresses', ['city_id', 'type'], {
      name: 'addresses_city_type_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('addresses');
  }
};