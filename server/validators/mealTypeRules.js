// Règles express-validator pour créer ou modifier un type de repas (POST / PUT).
import { body } from 'express-validator';

export const mealTypeRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nom requis')
        .isLength({ max: 255 })
        .withMessage('Nom trop long (255 caractères max)'),
];