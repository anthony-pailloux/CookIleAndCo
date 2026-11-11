// Requetes BDD pour les recettes (liste, fiche, creation, photo).

import Recipe from '../models/Recipe.js';
import Category from '../models/Category.js';
import Origin from '../models/Origin.js';
import MealType from '../models/MealType.js';
import RecipeIngredient from '../models/RecipeIngredient.js';
import RecipeStep from '../models/RecipeStep.js';
import { readRecipePhotoDimensions } from '../utils/imageDimensions.js';
import { Op } from 'sequelize';

// Ajoute imageWidth et imageHeight quand le fichier photo est lisible.
async function withPhotoDimensions(recipe) {
    const plain = recipe.toJSON();
    const size = await readRecipePhotoDimensions(plain.photo);

    if (size !== null) {
        plain.imageWidth = size.width;
        plain.imageHeight = size.height;
    }

    return plain;
}

// Sequelize 6 lie Op.like, sans clause ESCAPE.
// MySQL utilise \ par defaut pour LIKE : on le prefixe devant \, % et _.
function escapeLikeWildcards(value) {
    let escaped = '';

    for (let index = 0; index < value.length; index++) {
        const character = value[index];

        if (character === '\\' || character === '%' || character === '_') {
            escaped = escaped + '\\' + character;
        } else {
            escaped = escaped + character;
        }
    }

    return escaped;
}

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
        if (typeof searchQuery !== 'string') {
            res.status(400).json({ error: 'Paramètre de recherche invalide' });
            return;
        }

        const trimmedSearch = searchQuery.trim();

        if (trimmedSearch.length > 80) {
            res.status(400).json({
                error: 'La recherche ne peut pas dépasser 80 caractères',
            });
            return;
        }

        if (trimmedSearch !== '') {
            const escapedSearch = escapeLikeWildcards(trimmedSearch);

            recipeWhere.title = {
                [Op.like]: '%' + escapedSearch + '%',
            };
        }
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

    // On charge les recettes de la page, les plus recentes en premier
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

    // On prepare les infos de pagination pour le front
    const meta = {
        page: pageFromUrl,
        limit: limitFromUrl,
        total: totalRecipes,
        totalPages,
    };

    const recipes = [];

    for (let index = 0; index < result.rows.length; index++) {
        const recipe = await withPhotoDimensions(result.rows[index]);
        recipes.push(recipe);
    }

    res.status(200).json({
        data: recipes,
        meta,
    });
}

export async function getRecipeById(req, res) {
    const id = req.params.id;

    // On recupere la recette avec sa categorie, son origine et son type de repas
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

    const recipeWithSize = await withPhotoDimensions(recipe);

    res.status(200).json(recipeWithSize);
}

// Creation d une recette
export async function createRecipe(req, res) {
    const title = req.body.title;
    const cookingTime = req.body.cookingTime;
    const preparationTime = req.body.preparationTime;
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
        preparationTime: preparationTime,
        categoryId: categoryId,
        originId: originId,
        mealTypeId: mealTypeId,
        tips: tips,
        photo: null,
    });

    // ingredients
    const ingredientsFromBody = req.body.ingredients;
    const ingredientsToCreate = [];

    for (let i = 0; i < ingredientsFromBody.length; i++) {
        const item = ingredientsFromBody[i];

        let quantity = null;
        if (item.quantity !== undefined && item.quantity !== "") {
            quantity = item.quantity;
        }

        let unit = null;
        if (item.unit !== undefined && item.unit !== "") {
            unit = item.unit;
        }

        ingredientsToCreate.push({
            recipeId: newRecipe.id,
            quantity: quantity,
            unit: unit,
            name: item.name,
            sortOrder: i + 1,
        });
    }

    await RecipeIngredient.bulkCreate(ingredientsToCreate);

    // etapes
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

    const createdWithSize = await withPhotoDimensions(newRecipe);

    res.status(201).json(createdWithSize);
}

// Modification d une recette (admin)
export async function updateRecipe(req, res) {
    const id = req.params.id;

    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
        res.status(404).json({ error: 'Recette introuvable' });
        return;
    }

    const title = req.body.title;
    const cookingTime = req.body.cookingTime;
    const preparationTime = req.body.preparationTime;
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
        preparationTime: preparationTime,
        categoryId: categoryId,
        originId: originId,
        mealTypeId: mealTypeId,
        tips: tips,
    });

    // Supprime les anciens ingredients et etapes puis recree 
    await RecipeIngredient.destroy({ where: { recipeId: id } });
    await RecipeStep.destroy({ where: { recipeId: id } });

    const ingredientsFromBody = req.body.ingredients;
    const ingredientsToCreate = [];

    for (let i = 0; i < ingredientsFromBody.length; i++) {
        const item = ingredientsFromBody[i];

        let quantity = null;
        if (item.quantity !== undefined && item.quantity !== "") {
            quantity = item.quantity;
        }

        let unit = null;
        if (item.unit !== undefined && item.unit !== "") {
            unit = item.unit;
        }

        ingredientsToCreate.push({
            recipeId: id,
            quantity: quantity,
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

    const updatedWithSize = await withPhotoDimensions(recipe);

    res.status(200).json(updatedWithSize);
}

// Suppression d une recette
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

// Ajoute une photo a une recette
export async function addRecipePhoto(req, res) {
    const id = req.params.id;

    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
        res.status(404).json({ error: 'Recette introuvable' });
        return;
    }

    if (!req.file) {
        res.status(400).json({ error: 'Photo requise' });
        return;
    }

    const photoPath = '/uploads/recipes/' + req.file.filename;

    await recipe.update({ photo: photoPath });

    const recipeWithSize = await withPhotoDimensions(recipe);

    res.status(200).json(recipeWithSize);
}