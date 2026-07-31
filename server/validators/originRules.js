import { body } from 'express-validator';

export const originRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nom requis'),
];