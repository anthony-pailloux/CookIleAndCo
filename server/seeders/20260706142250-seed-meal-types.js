'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const mealTypes = [
      { name: 'Petit-déjeuner', created_at: now, updated_at: now },
      { name: 'Déjeuner', created_at: now, updated_at: now },
      { name: 'Goûter', created_at: now, updated_at: now },
      { name: 'Dîner', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('meal_types', mealTypes);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
