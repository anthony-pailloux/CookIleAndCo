'use strict';

// Plannings nommés et listes de courses enregistrées.
// Les entrées déjà présentes sont rattachées à un planning « Mon planning ».
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plannings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'admins', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(80),
        allowNull: false,
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

    await queryInterface.addColumn('planning_entries', 'planning_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    const adminsWithEntries = await queryInterface.sequelize.query(
      'SELECT DISTINCT admin_id FROM planning_entries',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (let index = 0; index < adminsWithEntries.length; index++) {
      const adminId = adminsWithEntries[index].admin_id;
      const now = new Date();

      await queryInterface.bulkInsert('plannings', [
        {
          admin_id: adminId,
          title: 'Mon planning',
          created_at: now,
          updated_at: now,
        },
      ]);

      const createdRows = await queryInterface.sequelize.query(
        'SELECT id FROM plannings WHERE admin_id = :adminId AND title = :title ORDER BY id DESC LIMIT 1',
        {
          replacements: { adminId: adminId, title: 'Mon planning' },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      await queryInterface.sequelize.query(
        'UPDATE planning_entries SET planning_id = :planningId WHERE admin_id = :adminId AND planning_id IS NULL',
        {
          replacements: {
            planningId: createdRows[0].id,
            adminId: adminId,
          },
        }
      );
    }

    await queryInterface.changeColumn('planning_entries', 'planning_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addConstraint('planning_entries', {
      fields: ['planning_id'],
      type: 'foreign key',
      name: 'planning_entries_planning_id_fk',
      references: {
        table: 'plannings',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.createTable('shopping_lists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'admins', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      planning_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'plannings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.createTable('shopping_list_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      shopping_list_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shopping_lists', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      note: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shopping_list_items');
    await queryInterface.dropTable('shopping_lists');
    await queryInterface.removeConstraint(
      'planning_entries',
      'planning_entries_planning_id_fk'
    );
    await queryInterface.removeColumn('planning_entries', 'planning_id');
    await queryInterface.dropTable('plannings');
  },
};
