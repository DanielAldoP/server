'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    return queryInterface.bulkInsert('users', [
      {
        name: 'System Administrator',
        email: 'admin@sangutime.com',
        password: hashedPassword,
        phone_number: '+1234567890',
        city: 'Jakarta',
        role: 'admin',
        is_active: true,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', {
      email: 'admin@sangutime.com'
    });
  }
};