'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const categories = [
      { name: 'Boisson', created_at: now, updated_at: now },
      { name: 'Dessert', created_at: now, updated_at: now },
      { name: 'Gâteau', created_at: now, updated_at: now },
      { name: 'Beignets', created_at: now, updated_at: now },
      { name: 'Tarte', created_at: now, updated_at: now },
      { name: 'Crème', created_at: now, updated_at: now },
      { name: 'Fait maison', created_at: now, updated_at: now },
      { name: 'Glace', created_at: now, updated_at: now },
      { name: 'Friandise', created_at: now, updated_at: now },
      { name: 'Ptit dèj', created_at: now, updated_at: now },
      { name: 'Punch arrangé', created_at: now, updated_at: now },
      { name: 'Pâtisserie', created_at: now, updated_at: now },
      { name: 'Boulangerie', created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert('categories', categories);
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
