'use strict';

// La quantite d un ingredient n est plus obligatoire (comme l unite).
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('recipe_ingredients', 'quantity', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('recipe_ingredients', 'quantity', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
