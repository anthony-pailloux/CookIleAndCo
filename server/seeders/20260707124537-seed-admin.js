'use strict';

import bcrypt from 'bcrypt';

/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL manquant dans .env');
    }

    // on cherche si l'admin existe déjà
    const existingRows = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email',
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    console.log('seed admin, compte en base :', existingRows.length);

    if (existingRows.length > 0) {

      console.log('seed admin, compte déjà là, on fait rien');

      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD manquant dans .env');
    }

    // mot de passe hashé depuis le .env
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const now = new Date();

    const adminUser = {
      email: adminEmail,
      password_hash: passwordHash,
      role: 'admin',
      profile_photo: null,
      created_at: now,
      updated_at: now,
    };

    // on crée le compte admin
    await queryInterface.bulkInsert('users', [adminUser]);

    console.log('seed admin, compte inséré :', adminEmail);
  },

  async down(queryInterface, Sequelize) {

  },
};