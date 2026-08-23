'use strict';

// Retire la colonne v2 jamais branchée (photo de profil).
export default {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('users');

    if (table.profile_photo) {
      await queryInterface.removeColumn('users', 'profile_photo');
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');

    if (!table.profile_photo) {
      await queryInterface.addColumn('users', 'profile_photo', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};
