'use strict';

// Une ligne = une ouverture de fiche par un visiteur sans session admin.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipe_views', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'recipes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Sert les filtres 4 h, 7 j et 30 j.
    await queryInterface.addIndex('recipe_views', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('recipe_views');
  },
};
