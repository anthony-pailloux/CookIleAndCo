'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1 — Vérifier si la table est déjà remplie
    const [countRows] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS total FROM meal_types'
    );

    let total = countRows[0].total;
    console.log('seed meal_types — lignes en base :', total);

    if (total > 0) {
      console.log('seed meal_types — déjà rempli, insertion ignorée');
      return;
    }

    // 2 — Préparer les données (seulement si insertion nécessaire)
    const now = new Date();

    
    const mealTypes = [
      { name: 'Petit-déjeuner', created_at: now, updated_at: now },
      { name: 'Déjeuner', created_at: now, updated_at: now },
      { name: 'Goûter', created_at: now, updated_at: now },
      { name: 'Dîner', created_at: now, updated_at: now },
    ];
    
    // 3 — Insérer
    await queryInterface.bulkInsert('meal_types', mealTypes);

    console.log('seed meal_types — insertion terminée :', mealTypes.length, 'ligne(s)');
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
