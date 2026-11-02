// Contrôles du corps pour un planning nommé et pour y ajouter une recette.
import { body } from 'express-validator';

export const planningTitleRules = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Le titre est obligatoire')
        .bail()
        .isLength({ min: 1, max: 80 })
        .withMessage('Le titre doit contenir entre 1 et 80 caractères'),
];

const planningDays = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
];

export const planningRules = [
    body('recipeId')
        .isInt({ min: 1 })
        .withMessage('Recette invalide'),

    body('mealTypeId')
        .isInt({ min: 1 })
        .withMessage('Type de repas invalide'),

    body('day')
        .trim()
        .isIn(planningDays)
        .withMessage('Jour invalide'),
];
