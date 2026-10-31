'use strict';

// Table technique des sessions Express (connect-session-sequelize).
// createdAt et updatedAt restent en camelCase : le modele de la lib ne met pas underscored.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      sid: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sessions');
  },
};
