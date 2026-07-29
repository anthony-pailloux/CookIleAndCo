import { body } from 'express-validator';

export const createRecipeRules = [
    // Titre obligatoire
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Titre requis'),
    // Temps de cuisson : entier > 0
    body('cookingTime')
        .isInt({ min: 1 })
        .withMessage('Temps de cuisson invalide'),
    // Les 3 FK obligatoires (catégorie, origine, type de repas)
    body('categoryId')
        .isInt({ min: 1 })
        .withMessage('Catégorie requise'),
    body('originId')
        .isInt({ min: 1 })
        .withMessage('Origine requise'),
    body('mealTypeId')
        .isInt({ min: 1 })
        .withMessage('Type de repas requis'),
    body('ingredients')
        .isArray({ min: 1 })
        .withMessage('Au moins un ingrédient requis'),

    body('ingredients.*.name')
        .trim()
        .notEmpty()
        .withMessage('Nom ingrédient requis'),

    body('ingredients.*.quantity')
        .trim()
        .notEmpty()
        .withMessage('Quantité requise'),

    body('steps')
        .isArray({ min: 1 })
        .withMessage('Au moins une étape requise'),

    body('steps.*.description')
        .trim()
        .notEmpty()
        .withMessage('Description étape requise'),
];