'use strict';

// La table des comptes s appelle admins (plus users).
function tableNameOf(entry) {
  if (typeof entry === 'string') {
    return entry.toLowerCase();
  }

  if (entry && typeof entry === 'object') {
    const values = Object.values(entry);

    if (values.length > 0) {
      return String(values[0]).toLowerCase();
    }
  }

  return '';
}

export default {
  async up(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const names = [];

    for (let i = 0; i < tables.length; i++) {
      names.push(tableNameOf(tables[i]));
    }

    const hasUsers = names.includes('users');
    const hasAdmins = names.includes('admins');

    if (hasUsers && !hasAdmins) {
      await queryInterface.renameTable('users', 'admins');
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const names = [];

    for (let i = 0; i < tables.length; i++) {
      names.push(tableNameOf(tables[i]));
    }

    const hasUsers = names.includes('users');
    const hasAdmins = names.includes('admins');

    if (hasAdmins && !hasUsers) {
      await queryInterface.renameTable('admins', 'users');
    }
  },
};
