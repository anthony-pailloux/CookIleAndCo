'use strict';

// Les visites de pages sans fiche n'ont pas de recette : recipe_id devient nul,
// et page_type distingue accueil, catalogue, catégories et fiche.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE `recipe_views` MODIFY `recipe_id` INT NULL'
    );

    await queryInterface.addColumn('recipe_views', 'page_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      "UPDATE `recipe_views` SET `page_type` = 'recipe' WHERE `page_type` IS NULL"
    );

    await queryInterface.changeColumn('recipe_views', 'page_type', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Sert le filtre « fiches ouvertes » (page_type = recipe).
    await queryInterface.addIndex('recipe_views', ['page_type']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('recipe_views', ['page_type']);
    await queryInterface.removeColumn('recipe_views', 'page_type');

    await queryInterface.sequelize.query(
      'DELETE FROM `recipe_views` WHERE `recipe_id` IS NULL'
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE `recipe_views` MODIFY `recipe_id` INT NOT NULL'
    );
  },
};
