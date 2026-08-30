// Controles des champs pour creer ou modifier une recette.
import { body } from 'express-validator';
import Category from '../models/Category.js';
import Origin from '../models/Origin.js';
import MealType from '../models/MealType.js';

export const createRecipeRules = [
    // Titre obligatoire
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Titre requis'),

    // Temps de cuisson, entier superieur a 0
    body('cookingTime')
        .isInt({ min: 1 })
        .withMessage('Temps de cuisson invalide'),

    // Categorie, format et existence en BDD
    body('categoryId')
        .isInt({ min: 1 })
        .withMessage('Catégorie requise')
        .custom(async function (categoryId) {
            const category = await Category.findByPk(categoryId);

            if (!category) {
                throw new Error('Catégorie introuvable');
            } else {
                return true;
            }
        }),

    // Origine, format et existence en BDD
    body('originId')
        .isInt({ min: 1 })
        .withMessage('Origine requise')
        .custom(async function (originId) {
            const origin = await Origin.findByPk(originId);

            if (!origin) {
                throw new Error('Origine introuvable');
            } else {
                return true;
            }
        }),

    // Type de repas, format et existence en BDD
    body('mealTypeId')
        .isInt({ min: 1 })
        .withMessage('Type de repas requis')
        .custom(async function (mealTypeId) {
            const mealType = await MealType.findByPk(mealTypeId);

            if (!mealType) {
                throw new Error('Type de repas introuvable');
            } else {
                return true;
            }
        }),

    body('ingredients')
        .isArray({ min: 1 })
        .withMessage('Au moins un ingrédient requis'),

    body('ingredients.*.name')
        .trim()
        .notEmpty()
        .withMessage('Nom ingrédient requis'),

    body('steps')
        .isArray({ min: 1 })
        .withMessage('Au moins une étape requise'),

    body('steps.*.description')
        .trim()
        .notEmpty()
        .withMessage('Description étape requise'),
];