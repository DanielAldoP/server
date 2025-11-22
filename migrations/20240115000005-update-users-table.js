'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add address_id column to users table
    await queryInterface.addColumn('users', 'address_id', {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for address_id
    await queryInterface.addIndex('users', ['address_id'], {
      name: 'users_address_id_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex('users', 'users_address_id_idx');

    // Remove column
    await queryInterface.removeColumn('users', 'address_id');
  }
};