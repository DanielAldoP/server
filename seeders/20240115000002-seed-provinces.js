'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const provinces = [
      { id: 1, name: 'DKI Jakarta', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 2, name: 'Jawa Barat', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 3, name: 'Jawa Tengah', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 4, name: 'Jawa Timur', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 5, name: 'Bali', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 6, name: 'Sumatera Utara', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 7, name: 'Sumatera Barat', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 8, name: 'Sumatera Selatan', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 9, name: 'Riau', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 10, name: 'Kalimantan Timur', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
    ];

    await queryInterface.bulkInsert('provinces', provinces);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('provinces', null, {});
  }
};