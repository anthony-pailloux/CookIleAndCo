'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('recipes');

    if (!table.preparation_time) {
      await queryInterface.addColumn('recipes', 'preparation_time', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('recipes');

    if (table.preparation_time) {
      await queryInterface.removeColumn('recipes', 'preparation_time');
    }
  }
};
