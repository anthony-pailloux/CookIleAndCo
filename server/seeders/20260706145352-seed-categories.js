'use strict';

/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {

    // on vérifie si la table est déjà remplie
    const [countRows] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS total FROM categories'
    );

    let total = countRows[0].total;

    console.log('seed categories, lignes en base :', total);

    if (total > 0) {

      console.log('seed categories, déjà rempli, on fait rien');

      return;
    }

    const now = new Date();

    // liste des catégories
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

    // on insère en base
    await queryInterface.bulkInsert('categories', categories);

    console.log('seed categories, insertion ok :', categories.length, 'ligne(s)');
  },

  async down(queryInterface, Sequelize) {
    // annule le seed
  }
};
