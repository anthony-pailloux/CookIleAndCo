'use strict';

// admin de l'appli

import bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'anthonypailloux.dev@gmail.com';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {

    const existingRows = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email',
      {
        replacements: { email: ADMIN_EMAIL },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    console.log('seed admin — compte en base :', existingRows.length);

    if (existingRows.length > 0) {

      console.log('seed admin — Compte déjà présent, insertion ignorée');

      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD manquant dans .env');
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const now = new Date();

    const adminUser = {
      email: ADMIN_EMAIL,
      password_hash: passwordHash,
      role: 'admin',
      profile_photo: null,
      created_at: now,
      updated_at: now,
    };

    await queryInterface.bulkInsert('users', [adminUser]);


    console.log('seed admin — Compte inséré :', ADMIN_EMAIL);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: ADMIN_EMAIL,
    });

    console.log('seed admin — compte supprimé :', ADMIN_EMAIL);
  },
};