// Sert index.html. Les fiches /recettes/:id recoivent les balises SEO.

import fs from 'fs/promises';
import Recipe from '../models/Recipe.js';
import Category from '../models/Category.js';
import Origin from '../models/Origin.js';
import MealType from '../models/MealType.js';
import RecipeIngredient from '../models/RecipeIngredient.js';
import RecipeStep from '../models/RecipeStep.js';
import { injectMissingRecipe, injectRecipeSeo } from '../utils/recipePageHtml.js';

function readRecipePage(pathname) {
    const prefix = '/recettes/';

    if (!pathname.startsWith(prefix)) {
        return { kind: 'other' };
    }

    const rawId = pathname.slice(prefix.length);

    if (rawId === '' || rawId.indexOf('/') !== -1) {
        return { kind: 'other' };
    }

    if (!/^[1-9][0-9]*$/.test(rawId)) {
        return { kind: 'invalid' };
    }

    return { kind: 'id', id: rawId };
}

async function loadRecipeForPage(id) {
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
            },
            {
                model: RecipeStep,
                as: 'steps',
                attributes: ['id', 'stepNumber', 'description', 'sortOrder'],
            },
        ],
    });

    return recipe;
}

function sendHtml(res, status, html) {
    res.status(status);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
}

export function createServeClient(indexHtmlPath) {
    return async function serveClient(req, res, next) {
        try {
            if (req.method !== 'GET') {
                next();
                return;
            }

            if (req.path.startsWith('/api')) {
                next();
                return;
            }

            const recipePage = readRecipePage(req.path);

            if (recipePage.kind === 'other') {
                res.sendFile(indexHtmlPath);
                return;
            }

            const indexHtml = await fs.readFile(indexHtmlPath, 'utf8');

            if (recipePage.kind === 'invalid') {
                sendHtml(res, 404, injectMissingRecipe(indexHtml));
                return;
            }

            const recipe = await loadRecipeForPage(recipePage.id);

            if (!recipe) {
                sendHtml(res, 404, injectMissingRecipe(indexHtml));
                return;
            }

            sendHtml(res, 200, injectRecipeSeo(indexHtml, recipe));
        } catch (err) {
            next(err);
        }
    };
}
