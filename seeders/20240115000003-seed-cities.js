'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const cities = [
      // DKI Jakarta
      { id: 1, province_id: 1, name: 'Jakarta Pusat', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 2, province_id: 1, name: 'Jakarta Utara', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 3, province_id: 1, name: 'Jakarta Barat', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 4, province_id: 1, name: 'Jakarta Selatan', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 5, province_id: 1, name: 'Jakarta Timur', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },

      // Jawa Barat
      { id: 6, province_id: 2, name: 'Bandung', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 7, province_id: 2, name: 'Bogor', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 8, province_id: 2, name: 'Depok', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 9, province_id: 2, name: 'Tangerang', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 10, province_id: 2, name: 'Bekasi', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },

      // Jawa Tengah
      { id: 11, province_id: 3, name: 'Semarang', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 12, province_id: 3, name: 'Surakarta', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 13, province_id: 3, name: 'Yogyakarta', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },

      // Jawa Timur
      { id: 14, province_id: 4, name: 'Surabaya', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 15, province_id: 4, name: 'Malang', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },

      // Bali
      { id: 16, province_id: 5, name: 'Denpasar', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
      { id: 17, province_id: 5, name: 'Kuta', created_at: Math.floor(Date.now() / 1000), updated_at: Math.floor(Date.now() / 1000) },
    ];

    await queryInterface.bulkInsert('cities', cities);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('cities', null, {});
  }
};