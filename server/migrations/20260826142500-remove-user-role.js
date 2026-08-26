'use strict';

// Retire le role : tous les comptes de admins sont des administrateurs.
export default {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('users');

    if (table.role) {
      await queryInterface.removeColumn('users', 'role');
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');

    if (!table.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'admin',
      });
    }
  },
};
