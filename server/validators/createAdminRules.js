import { body } from 'express-validator';

export const createAdminRules = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide'),

    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis'),
];