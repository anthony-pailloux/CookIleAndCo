'use strict';

/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {
    // on vérifie si la table est déjà remplie
    const [countRows] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS total FROM meal_types'
    );

    let total = countRows[0].total;
    console.log('seed meal_types, lignes en base :', total);

    if (total > 0) {
      console.log('seed meal_types, déjà rempli, on fait rien');
      return;
    }

    // liste des types de repas
    const now = new Date();

    
    const mealTypes = [
      { name: 'Petit-déjeuner', created_at: now, updated_at: now },
      { name: 'Déjeuner', created_at: now, updated_at: now },
      { name: 'Goûter', created_at: now, updated_at: now },
      { name: 'Dîner', created_at: now, updated_at: now },
    ];
    
    // on insère en base
    await queryInterface.bulkInsert('meal_types', mealTypes);

    console.log('seed meal_types, insertion ok :', mealTypes.length, 'ligne(s)');
  },

  async down(queryInterface, Sequelize) {
    // annule le seed
  }
};
