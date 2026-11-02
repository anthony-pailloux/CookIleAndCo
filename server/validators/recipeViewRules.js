// Contrôle du type de page, et de la recette quand il s'agit d'une fiche.
import { body } from 'express-validator';

const pageTypes = ['home', 'catalog', 'recipe', 'categories'];

export const createRecipeViewRules = [
    body('pageType')
        .trim()
        .notEmpty()
        .withMessage('Type de page requis')
        .bail()
        .isIn(pageTypes)
        .withMessage('Type de page invalide'),

    body('recipeId')
        .if(body('pageType').equals('recipe'))
        .notEmpty()
        .withMessage('Identifiant de recette requis')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Identifiant de recette invalide')
        .toInt(),
];
