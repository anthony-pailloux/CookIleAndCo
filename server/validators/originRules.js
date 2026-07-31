// Règles express-validator pour créer ou modifier une origine (POST / PUT).
import { body } from 'express-validator';

export const originRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nom requis')
        .isLength({ max: 255 })
        .withMessage('Nom trop long (255 caractères max)'),
];