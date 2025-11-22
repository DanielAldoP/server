'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add address_id column to restaurants table
    await queryInterface.addColumn('restaurants', 'address_id', {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // Add index for address_id
    await queryInterface.addIndex('restaurants', ['address_id'], {
      name: 'restaurants_address_id_idx'
    });

    // Note: After this migration, you'll need to:
    // 1. Create address records for existing restaurants
    // 2. Update restaurants.address_id with the corresponding address IDs
    // 3. Then you can remove the old city and full_address columns
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex('restaurants', 'restaurants_address_id_idx');

    // Remove column
    await queryInterface.removeColumn('restaurants', 'address_id');
  }
};