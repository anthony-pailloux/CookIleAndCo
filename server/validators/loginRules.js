import { body } from 'express-validator';

export const loginRules = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide'),

    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis'),
];