// Enregistre une visite de page publique, et agrège les fiches ouvertes pour l'admin.
// Les libellés de série (HH:mm, jour, JJ/MM) utilisent l'heure locale du processus Node.
import { Op, fn, col } from 'sequelize';
import Recipe from '../models/Recipe.js';
import Origin from '../models/Origin.js';
import Category from '../models/Category.js';
import RecipeView from '../models/RecipeView.js';

function toViewCount(value) {
    const count = Number(value);
    let result = 0;

    if (Number.isNaN(count) === false) {
        result = count;
    }

    return result;
}

function pad2(value) {
    let text = String(value);

    if (value < 10) {
        text = '0' + text;
    }

    return text;
}

function formatHourMinute(date) {
    return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
}

function formatDayMonth(date) {
    return pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1);
}

function formatWeekday(date) {
    const weekdayLabels = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    const label = weekdayLabels[date.getDay()];

    return label + ' ' + date.getDate();
}

function labelForBucket(date, labelKind) {
    let label;

    if (labelKind === 'hour') {
        label = formatHourMinute(date);
    } else if (labelKind === 'date') {
        label = formatDayMonth(date);
    } else {
        label = formatWeekday(date);
    }

    return label;
}

// 1 h, 4 h, 7 j, 30 j. Toute autre valeur retombe sur 7 j.
function resolvePeriod(rawPeriod) {
    const hourMs = 60 * 60 * 1000;
    const dayMs = 24 * hourMs;
    let period = '7d';
    let durationMs = 7 * dayMs;
    let bucketCount = 7;
    let bucketMs = dayMs;
    let labelKind = 'weekday';

    if (rawPeriod === '1h') {
        period = '1h';
        durationMs = hourMs;
        bucketCount = 12;
        bucketMs = 5 * 60 * 1000;
        labelKind = 'hour';
    } else if (rawPeriod === '4h') {
        period = '4h';
        durationMs = 4 * hourMs;
        bucketCount = 8;
        bucketMs = 30 * 60 * 1000;
        labelKind = 'hour';
    } else if (rawPeriod === '30d') {
        period = '30d';
        durationMs = 30 * dayMs;
        bucketCount = 30;
        bucketMs = dayMs;
        labelKind = 'date';
    } else {
        period = '7d';
        durationMs = 7 * dayMs;
        bucketCount = 7;
        bucketMs = dayMs;
        labelKind = 'weekday';
    }

    return {
        period: period,
        durationMs: durationMs,
        bucketCount: bucketCount,
        bucketMs: bucketMs,
        labelKind: labelKind,
    };
}

// Créneaux remplis même à 0, pour une courbe continue sur toute la fenêtre.
function buildSeries(viewRows, since, bucketMs, bucketCount, labelKind) {
    const counts = [];

    for (let index = 0; index < bucketCount; index++) {
        counts.push(0);
    }

    for (let index = 0; index < viewRows.length; index++) {
        const createdAt = new Date(viewRows[index].createdAt);
        const delta = createdAt.getTime() - since.getTime();
        let bucketIndex = Math.floor(delta / bucketMs);

        if (bucketIndex < 0) {
            bucketIndex = 0;
        }

        if (bucketIndex >= bucketCount) {
            bucketIndex = bucketCount - 1;
        }

        counts[bucketIndex] = counts[bucketIndex] + 1;
    }

    const series = [];

    for (let index = 0; index < bucketCount; index++) {
        const bucketStart = new Date(since.getTime() + (index * bucketMs));
        let labelDate = bucketStart;

        // Heure : début du créneau. Jour : date locale de la fin du créneau,
        // pour que le dernier point porte le jour courant.
        if (labelKind !== 'hour') {
            const bucketEnd = since.getTime() + ((index + 1) * bucketMs);
            labelDate = new Date(bucketEnd - 1);
        }

        series.push({
            label: labelForBucket(labelDate, labelKind),
            count: counts[index],
        });
    }

    return series;
}

// Ouvertures de fiches seulement : type recipe, ou une recette encore liée.
function ficheViewWhere(createdAtCondition) {
    return {
        [Op.and]: [
            {
                createdAt: createdAtCondition,
            },
            {
                [Op.or]: [
                    { pageType: 'recipe' },
                    { recipeId: { [Op.ne]: null } },
                ],
            },
        ],
    };
}

function labelForLivePage(pageType, recipeTitle) {
    let label = 'Fiche recette';

    if (pageType === 'home') {
        label = 'Accueil';
    } else if (pageType === 'catalog') {
        label = 'Catalogue';
    } else if (pageType === 'categories') {
        label = 'Catégories';
    } else if (pageType === 'recipe') {
        if (recipeTitle !== '') {
            label = recipeTitle;
        } else {
            label = 'Fiche recette';
        }
    }

    return label;
}

export async function recordRecipeView(req, res) {
    const adminId = req.session.adminId;

    // Une session admin ne doit pas gonfler les statistiques, quel que soit le type de page.
    if (adminId) {
        res.sendStatus(204);
    } else {
        const pageType = req.body.pageType;

        if (pageType === 'recipe') {
            const recipeId = Number(req.body.recipeId);
            const recipe = await Recipe.findByPk(recipeId);

            if (!recipe) {
                res.status(404).json({ error: 'Recette introuvable' });
            } else {
                await RecipeView.create({
                    recipeId: recipeId,
                    pageType: 'recipe',
                });
                res.sendStatus(204);
            }
        } else {
            await RecipeView.create({
                recipeId: null,
                pageType: pageType,
            });
            res.sendStatus(204);
        }
    }
}

export async function getRecipeViewStats(req, res) {
    const rawPeriod = req.query.period;
    const resolved = resolvePeriod(rawPeriod);
    const now = new Date();
    const since = new Date(now.getTime() - resolved.durationMs);
    const previousSince = new Date(since.getTime() - resolved.durationMs);
    const oneMinuteAgo = new Date(now.getTime() - (60 * 1000));

    const where = ficheViewWhere({
        [Op.gte]: since,
    });

    const previousWhere = ficheViewWhere({
        [Op.gte]: previousSince,
        [Op.lt]: since,
    });

    // Dernière minute : toutes les pages publiques, pas seulement les fiches.
    const liveWhere = {
        createdAt: {
            [Op.gte]: oneMinuteAgo,
        },
    };

    const total = await RecipeView.count({
        where: where,
    });

    const previousTotal = await RecipeView.count({
        where: previousWhere,
    });

    const liveLastMinute = await RecipeView.count({
        where: liveWhere,
    });

    const viewRows = await RecipeView.findAll({
        attributes: ['createdAt'],
        where: where,
        raw: true,
    });

    const series = buildSeries(
        viewRows,
        since,
        resolved.bucketMs,
        resolved.bucketCount,
        resolved.labelKind,
    );

    const topRows = await RecipeView.findAll({
        attributes: [
            [col('recipe.id'), 'id'],
            [col('recipe.title'), 'title'],
            [fn('COUNT', col('RecipeView.id')), 'count'],
        ],
        where: where,
        include: [
            {
                model: Recipe,
                as: 'recipe',
                attributes: [],
                required: true,
            },
        ],
        group: [col('recipe.id'), col('recipe.title')],
        order: [[fn('COUNT', col('RecipeView.id')), 'DESC']],
        limit: 10,
        subQuery: false,
        raw: true,
    });

    const originRows = await RecipeView.findAll({
        attributes: [
            [col('recipe->origin.name'), 'origin'],
            [fn('COUNT', col('RecipeView.id')), 'count'],
        ],
        where: where,
        include: [
            {
                model: Recipe,
                as: 'recipe',
                attributes: [],
                required: true,
                include: [
                    {
                        model: Origin,
                        as: 'origin',
                        attributes: [],
                        required: true,
                    },
                ],
            },
        ],
        group: [col('recipe->origin.id'), col('recipe->origin.name')],
        order: [[fn('COUNT', col('RecipeView.id')), 'DESC']],
        subQuery: false,
        raw: true,
    });

    const categoryRows = await RecipeView.findAll({
        attributes: [
            [col('recipe->category.name'), 'category'],
            [fn('COUNT', col('RecipeView.id')), 'count'],
        ],
        where: where,
        include: [
            {
                model: Recipe,
                as: 'recipe',
                attributes: [],
                required: true,
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: [],
                        required: true,
                    },
                ],
            },
        ],
        group: [col('recipe->category.id'), col('recipe->category.name')],
        order: [[fn('COUNT', col('RecipeView.id')), 'DESC']],
        subQuery: false,
        raw: true,
    });

    const liveRows = await RecipeView.findAll({
        attributes: ['id', 'pageType', 'createdAt'],
        include: [
            {
                model: Recipe,
                as: 'recipe',
                attributes: ['title'],
                required: false,
            },
        ],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: 15,
        subQuery: false,
    });

    const topRecipes = [];

    for (let index = 0; index < topRows.length; index++) {
        const row = topRows[index];
        topRecipes.push({
            id: Number(row.id),
            title: row.title,
            count: toViewCount(row.count),
        });
    }

    const byOrigin = [];

    for (let index = 0; index < originRows.length; index++) {
        const row = originRows[index];
        byOrigin.push({
            origin: row.origin,
            count: toViewCount(row.count),
        });
    }

    const byCategory = [];

    for (let index = 0; index < categoryRows.length; index++) {
        const row = categoryRows[index];
        byCategory.push({
            category: row.category,
            count: toViewCount(row.count),
        });
    }

    const livePages = [];

    for (let index = 0; index < liveRows.length; index++) {
        const row = liveRows[index];
        let recipeTitle = '';

        if (row.recipe) {
            if (row.recipe.title) {
                recipeTitle = row.recipe.title;
            }
        }

        const atDate = new Date(row.createdAt);
        let at = '';

        if (Number.isNaN(atDate.getTime()) === false) {
            at = atDate.toISOString();
        }

        livePages.push({
            pageType: row.pageType,
            label: labelForLivePage(row.pageType, recipeTitle),
            at: at,
        });
    }

    res.status(200).json({
        period: resolved.period,
        total: total,
        previousTotal: previousTotal,
        liveLastMinute: liveLastMinute,
        generatedAt: now.toISOString(),
        series: series,
        topRecipes: topRecipes,
        byOrigin: byOrigin,
        byCategory: byCategory,
        livePages: livePages,
    });
}
