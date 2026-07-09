import { body } from 'express-validator';

export const loginRules = [
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Email invalide'),

    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis'),
];