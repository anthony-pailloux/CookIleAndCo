// Règles express-validator pour créer ou modifier une catégorie (POST / PUT).
import { body } from 'express-validator';

export const categoryRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nom requis')
        .isLength({ max: 255 })
        .withMessage('Nom trop long (255 caractères max)'),
];