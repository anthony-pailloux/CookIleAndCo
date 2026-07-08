'use strict';

/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {
    // on vérifie si la table est déjà remplie
    const [countRows] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS total FROM origins'
    );

    let total = countRows[0].total;
    console.log('seed origins, lignes en base :', total);

    if (total > 0) {
      console.log('seed origins, déjà rempli, on fait rien');
      return;
    }

    const now = new Date();

    // liste des origines
    const origins = [
      { name: 'Antille', created_at: now, updated_at: now },
      { name: 'Asie', created_at: now, updated_at: now },
    ];

    // on insère en base
    await queryInterface.bulkInsert('origins', origins);

    console.log('seed origins, insertion ok :', origins.length, 'ligne(s)');
  },

  async down(queryInterface, Sequelize) {
    // annule le seed
  }
};
