'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      province_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'provinces',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.addIndex('cities', ['province_id'], {
      name: 'cities_province_id_idx'
    });

    await queryInterface.addIndex('cities', ['name'], {
      name: 'cities_name_idx'
    });

    await queryInterface.addIndex('cities', ['province_id', 'name'], {
      name: 'cities_province_name_idx',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cities');
  }
};