'use strict';

// Ajoute une image optionnelle aux origines (meme principe que categories).
export default {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('origins');

    if (!table.image) {
      await queryInterface.addColumn('origins', 'image', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('origins');

    if (table.image) {
      await queryInterface.removeColumn('origins', 'image');
    }
  },
};
