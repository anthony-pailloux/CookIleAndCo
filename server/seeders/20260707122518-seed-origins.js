'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const [countRows] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS total FROM origins'
    );

    let total = countRows[0].total;
    console.log('seed origins — lignes en base :', total);

    if (total > 0) {
      console.log('seed origins — déjà rempli, insertion ignorée');
      return;
    }

    const now = new Date();

    const origins = [
      { name: 'Antille', created_at: now, updated_at: now },
      { name: 'Asie', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('origins', origins);

    console.log('seed origins — insertion terminée :', origins.length, 'ligne(s)');
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
