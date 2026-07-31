import { body } from 'express-validator';

export const mealTypeRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nom requis'),
];