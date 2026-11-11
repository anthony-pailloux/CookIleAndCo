// Sert index.html. Les fiches /recettes/:id recoivent les balises SEO.

import fs from 'fs/promises';
import Recipe from '../models/Recipe.js';
import Category from '../models/Category.js';
import Origin from '../models/Origin.js';
import MealType from '../models/MealType.js';
import RecipeIngredient from '../models/RecipeIngredient.js';
import RecipeStep from '../models/RecipeStep.js';
import { injectAdminPage, injectHomeSeo, injectMissingRecipe, injectNotFoundPage, injectPageSeo, injectRecipeSeo, injectRobotsNoindex } from '../utils/recipePageHtml.js';

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

// /dashboard-admins/recettes/:id/modifier
function isDashboardRecipeEditPath(pathname) {
    const prefix = '/dashboard-admins/recettes/';
    const suffix = '/modifier';

    if (!pathname.startsWith(prefix)) {
        return false;
    }

    if (!pathname.endsWith(suffix)) {
        return false;
    }

    const rawId = pathname.slice(prefix.length, pathname.length - suffix.length);

    if (rawId === '') {
        return false;
    }

    if (rawId.indexOf('/') !== -1) {
        return false;
    }

    return true;
}

// /dashboard-admins/liste-courses/:id
function isDashboardShoppingListPath(pathname) {
    const prefix = '/dashboard-admins/liste-courses/';

    if (!pathname.startsWith(prefix)) {
        return false;
    }

    const rawId = pathname.slice(prefix.length);

    if (rawId === '') {
        return false;
    }

    if (rawId.indexOf('/') !== -1) {
        return false;
    }

    return true;
}

// Routes réelles de App.jsx (admin et connexion). Le reste part en 404.
function isKnownClientRoute(pathname) {
    if (pathname === '/connexion-admins') {
        return true;
    }

    if (pathname === '/admin') {
        return true;
    }

    if (pathname === '/dashboard-admins') {
        return true;
    }

    if (pathname === '/dashboard-admins/recettes/nouvelle') {
        return true;
    }

    if (pathname === '/dashboard-admins/referentiels') {
        return true;
    }

    if (pathname === '/dashboard-admins/planning') {
        return true;
    }

    if (pathname === '/dashboard-admins/liste-courses') {
        return true;
    }

    if (pathname === '/dashboard-admins/statistiques') {
        return true;
    }

    if (isDashboardRecipeEditPath(pathname)) {
        return true;
    }

    if (isDashboardShoppingListPath(pathname)) {
        return true;
    }

    return false;
}

// ?q= non vide, ou ?page= présent (y compris page=1) : variante à ne pas indexer.
function isRecipesSearchOrPage(query) {
    let hasSearch = false;

    if (query.q !== undefined && query.q !== null) {
        const searchText = String(query.q).trim();

        if (searchText !== '') {
            hasSearch = true;
        }
    }

    let hasPage = false;

    if (query.page !== undefined && query.page !== null) {
        hasPage = true;
    }

    if (hasSearch === true) {
        return true;
    }

    if (hasPage === true) {
        return true;
    }

    return false;
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

            // Accueil, catalogue et catégories : titre et canonical.
            if (recipePage.kind === 'other') {
                if (req.path === '/') {
                    const indexHtml = await fs.readFile(indexHtmlPath, 'utf8');
                    console.log('GET / — injection accueil');
                    sendHtml(res, 200, injectHomeSeo(indexHtml));
                } else if (req.path === '/recettes') {
                    const indexHtml = await fs.readFile(indexHtmlPath, 'utf8');
                    let pageHtml = injectPageSeo(indexHtml, "Toutes les recettes | Cook'île & Co", '/recettes');

                    // Recherche et pagination : noindex, titre et canonical du catalogue propre.
                    if (isRecipesSearchOrPage(req.query)) {
                        console.log('GET /recettes — noindex recherche ou pagination');
                        pageHtml = injectRobotsNoindex(pageHtml);
                    } else {
                        console.log('GET /recettes — injection catalogue');
                    }

                    sendHtml(res, 200, pageHtml);
                } else if (req.path === '/categories') {
                    const indexHtml = await fs.readFile(indexHtmlPath, 'utf8');
                    console.log('GET /categories — injection catégories');
                    sendHtml(res, 200, injectPageSeo(indexHtml, "Catégorie et origine | Cook'île & Co", '/categories'));
                } else if (isKnownClientRoute(req.path)) {
                    // Pages admin réelles : 200, noindex, sans canonical.
                    const indexHtml = await fs.readFile(indexHtmlPath, 'utf8');
                    let adminTitle = "Tableau de bord | Cook'île & Co";

                    if (req.path === '/connexion-admins') {
                        adminTitle = "Connexion | Cook'île & Co";
                    }

                    console.log('GET ' + req.path + ' — noindex admin');
                    sendHtml(res, 200, injectAdminPage(indexHtml, adminTitle));
                } else {
                    const indexHtml = await fs.readFile(indexHtmlPath, 'utf8');
                    console.log('GET ' + req.path + ' — 404');
                    sendHtml(res, 404, injectNotFoundPage(indexHtml));
                }
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
