// Contrôles du corps pour enregistrer ou modifier une liste de courses.
import { body } from 'express-validator';

export const shoppingListTitleRules = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Le titre est obligatoire')
        .bail()
        .isLength({ min: 1, max: 80 })
        .withMessage('Le titre doit contenir entre 1 et 80 caractères'),
];

export const shoppingListRules = shoppingListTitleRules.concat([
    body('planningId')
        .isInt({ min: 1 })
        .withMessage('Planning invalide'),
]);

// Quantité et unité peuvent être vides : le contrôleur les enregistre en null.
export const shoppingListItemRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom est obligatoire')
        .bail()
        .isLength({ min: 1, max: 255 })
        .withMessage('Le nom doit contenir entre 1 et 255 caractères'),

    body('quantity')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 255 })
        .withMessage('La quantité doit contenir au maximum 255 caractères'),

    body('unit')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 255 })
        .withMessage('L\'unité doit contenir au maximum 255 caractères'),
];
