// Controles des champs pour poster un commentaire.
import { body } from 'express-validator';

export const createCommentRules = [
    body('pseudo')
        .trim()
        .notEmpty()
        .withMessage('Pseudo requis')
        .isLength({ min: 3, max: 30 })
        .withMessage('Pseudo entre 2 et 30 caractères'),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Commentaire requis')
        .isLength({ min: 3, max: 500 })
        .withMessage('Commentaire entre 3 et 500 caractères'),

    body('captchaAnswer')
        .notEmpty()
        .withMessage('Réponse captcha requise'),
];