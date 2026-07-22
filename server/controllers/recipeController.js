// Liste et détail des recettes (routes publiques).

import Recipe from '../models/Recipe.js';
import Category from '../models/Category.js';
import Origin from '../models/Origin.js';
import MealType from '../models/MealType.js';
import RecipeIngredient from '../models/RecipeIngredient.js';
import RecipeStep from '../models/RecipeStep.js';

export async function listRecipes(req, res) {
    // On lit page et limit dans l'URL, avec 1 et 12 par défaut
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;

    let pageFromUrl = 1;
    let limitFromUrl = 12;

    if (rawPage !== undefined && rawPage !== '') {
        pageFromUrl = Number(rawPage);
    }

    if (rawLimit !== undefined && rawLimit !== '') {
        limitFromUrl = Number(rawLimit);
    }

    const hasPage = rawPage !== undefined && rawPage !== '';
    const hasLimit = rawLimit !== undefined && rawLimit !== '';

    // Si page ou limit est invalide, on renvoie une erreur 400
    if (
        (hasPage && (Number.isNaN(pageFromUrl) || pageFromUrl <= 0)) ||
        (hasLimit && (Number.isNaN(limitFromUrl) || limitFromUrl <= 0))
    ) {
        res.status(400).json({ error: 'Paramètres de pagination invalides' });
        return;
    }

    const offset = (pageFromUrl - 1) * limitFromUrl;

    // On charge les recettes de la page, les plus récentes en premier, avec la catégorie
    const result = await Recipe.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit: limitFromUrl,
        offset,
        include: {
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
        },
    });

    const totalRecipes = result.count;

    let totalPages;

    if (totalRecipes === 0) {
        totalPages = 0;
    } else if (totalRecipes % limitFromUrl === 0) {
        totalPages = totalRecipes / limitFromUrl;
    } else {
        totalPages = Math.floor(totalRecipes / limitFromUrl) + 1;
    }

    // On prépare les infos de pagination pour le front
    const meta = {
        page: pageFromUrl,
        limit: limitFromUrl,
        total: totalRecipes,
        totalPages,
    };

    res.status(200).json({
        data: result.rows,
        meta,
    });
}

export async function getRecipeById(req, res) {
    const id = req.params.id;

    // On récupère la recette avec sa catégorie, son origine et son type de repas
    const recipe = await Recipe.findByPk(id, {

        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name'],
            },
            {
                model: Origin,
                as: 'origin',
                attributes: ['id', 'name'],
            },
            {
                model: MealType,
                as: 'mealType',
                attributes: ['id', 'name'],
            },
            {
                model: RecipeIngredient,
                as: 'ingredients',
                attributes: ['id', 'name', 'quantity', 'unit', 'sortOrder'],
                order: [['sortOrder', 'ASC']],
            },
            {
                model: RecipeStep,
                as: 'steps',
                attributes: ['id', 'stepNumber', 'description', 'sortOrder'],
                order: [['stepNumber', 'ASC']],
            }
        ],
    });

    if (!recipe) {
        res.status(404).json({ error: 'Recette introuvable' });
        return;
    }

    res.status(200).json(recipe);
}