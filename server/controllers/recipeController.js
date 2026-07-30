

import Recipe from '../models/Recipe.js';
import Category from '../models/Category.js';
import Origin from '../models/Origin.js';
import MealType from '../models/MealType.js';
import RecipeIngredient from '../models/RecipeIngredient.js';
import RecipeStep from '../models/RecipeStep.js';
import { Op } from 'sequelize';


export async function listRecipes(req, res) {
    // Pagination
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

    if (
        (hasPage && (Number.isNaN(pageFromUrl) || pageFromUrl <= 0)) ||
        (hasLimit && (Number.isNaN(limitFromUrl) || limitFromUrl <= 0))
    ) {
        res.status(400).json({ error: 'Paramètres de pagination invalides' });
        return;
    }

    const offset = (pageFromUrl - 1) * limitFromUrl;

    // filtres
    const searchQuery = req.query.q;
    let recipeWhere = {};

    if (searchQuery !== undefined && searchQuery !== '') {
        recipeWhere.title = {
            [Op.like]: '%' + searchQuery + '%',
        };
    }

    const filterOrigin = req.query.origine;
    const filterMealType = req.query.repas;
    const filterCategory = req.query.categorie;
    const categoryInclude = {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
    };

    if (filterCategory !== undefined && filterCategory !== '') {
        categoryInclude.where = { name: filterCategory };
        categoryInclude.required = true;
    }

    const originInclude = {
        model: Origin,
        as: 'origin',
        attributes: ['id', 'name'],
    };

    if (filterOrigin !== undefined && filterOrigin !== '') {
        originInclude.where = { name: filterOrigin };
        originInclude.required = true;
    }

    const mealTypeInclude = {
        model: MealType,
        as: 'mealType',
        attributes: ['id', 'name'],
    };

    if (filterMealType !== undefined && filterMealType !== '') {
        mealTypeInclude.where = { name: filterMealType };
        mealTypeInclude.required = true;
    }

    const includes = [categoryInclude, originInclude, mealTypeInclude];

    // On charge les recettes de la page, les plus récentes en premier, avec la catégorie
    const result = await Recipe.findAndCountAll({
        where: recipeWhere,
        order: [['createdAt', 'DESC']],
        limit: limitFromUrl,
        offset,
        include: includes,
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

// Création d'une recette
export async function createRecipe(req, res) {
    const title = req.body.title;
    const cookingTime = req.body.cookingTime;
    const categoryId = req.body.categoryId;
    const originId = req.body.originId;
    const mealTypeId = req.body.mealTypeId;
    let tips = null;
    if (req.body.tips !== undefined && req.body.tips !== "") {
        tips = req.body.tips;
    }

    const newRecipe = await Recipe.create({
        title: title,
        cookingTime: cookingTime,
        categoryId: categoryId,
        originId: originId,
        mealTypeId: mealTypeId,
        tips: tips,
        photo: null,
    });

    // --- ingrédients ---
    const ingredientsFromBody = req.body.ingredients;
    const ingredientsToCreate = [];

    for (let i = 0; i < ingredientsFromBody.length; i++) {
        const item = ingredientsFromBody[i];

        let unit = null;
        if (item.unit !== undefined && item.unit !== "") {
            unit = item.unit;
        }

        ingredientsToCreate.push({
            recipeId: newRecipe.id,
            quantity: item.quantity,
            unit: unit,
            name: item.name,
            sortOrder: i + 1,
        });
    }

    await RecipeIngredient.bulkCreate(ingredientsToCreate);

    // --- étapes ---
    const stepsFromBody = req.body.steps;
    const stepsToCreate = [];

    for (let i = 0; i < stepsFromBody.length; i++) {
        const item = stepsFromBody[i];

        stepsToCreate.push({
            recipeId: newRecipe.id,
            stepNumber: i + 1,
            description: item.description,
            sortOrder: i + 1,
        });
    }

    await RecipeStep.bulkCreate(stepsToCreate);

    res.status(201).json(newRecipe);
}

// Modification d'une recette (admin)
export async function updateRecipe(req, res) {
    const id = req.params.id;

    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
        res.status(404).json({ error: 'Recette introuvable' });
        return;
    }

    const title = req.body.title;
    const cookingTime = req.body.cookingTime;
    const categoryId = req.body.categoryId;
    const originId = req.body.originId;
    const mealTypeId = req.body.mealTypeId;

    let tips = null;
    if (req.body.tips !== undefined && req.body.tips !== "") {
        tips = req.body.tips;
    }

    await recipe.update({
        title: title,
        cookingTime: cookingTime,
        categoryId: categoryId,
        originId: originId,
        mealTypeId: mealTypeId,
        tips: tips,
    });

    // Supprime les anciens ingrédients et étapes puis recrée 
    await RecipeIngredient.destroy({ where: { recipeId: id } });
    await RecipeStep.destroy({ where: { recipeId: id } });

    const ingredientsFromBody = req.body.ingredients;
    const ingredientsToCreate = [];

    for (let i = 0; i < ingredientsFromBody.length; i++) {
        const item = ingredientsFromBody[i];

        let unit = null;
        if (item.unit !== undefined && item.unit !== "") {
            unit = item.unit;
        }

        ingredientsToCreate.push({
            recipeId: id,
            quantity: item.quantity,
            unit: unit,
            name: item.name,
            sortOrder: i + 1,
        });
    }

    await RecipeIngredient.bulkCreate(ingredientsToCreate);

    const stepsFromBody = req.body.steps;
    const stepsToCreate = [];

    for (let i = 0; i < stepsFromBody.length; i++) {
        const item = stepsFromBody[i];

        stepsToCreate.push({
            recipeId: id,
            stepNumber: i + 1,
            description: item.description,
            sortOrder: i + 1,
        });
    }

    await RecipeStep.bulkCreate(stepsToCreate);

    res.status(200).json(recipe);
}

// Suppression d'une recette
export async function deleteRecipe(req, res) {
    const id = req.params.id;

    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
        res.status(404).json({ error: 'Recette introuvable' });
        return;
    }

    await recipe.destroy();

    res.status(200).json({ message: 'Recette supprimée' });
}