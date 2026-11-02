// Plannings nommés de l'admin connecté, et recettes placées dessus.
// Le titre d'un planning reste celui de ses listes de courses liées.
import sequelize from '../config/database.js';
import Planning from '../models/Planning.js';
import PlanningEntry from '../models/PlanningEntry.js';
import Recipe from '../models/Recipe.js';
import MealType from '../models/MealType.js';
import ShoppingList from '../models/ShoppingList.js';

const planningIncludes = [
    {
        model: Recipe,
        as: 'recipe',
        attributes: ['id', 'title', 'photo'],
        required: true,
    },
    {
        model: MealType,
        as: 'mealType',
        attributes: ['id', 'name'],
        required: true,
    },
];

function readPositiveId(value) {
    const id = Number(value);
    let result = id;

    if (Number.isNaN(id)) {
        result = null;
    } else if (id <= 0) {
        result = null;
    }

    return result;
}

function toPlanningEntryJson(entry) {
    return {
        id: entry.id,
        day: entry.day,
        mealType: {
            id: entry.mealType.id,
            name: entry.mealType.name,
        },
        recipe: {
            id: entry.recipe.id,
            title: entry.recipe.title,
            photo: entry.recipe.photo,
        },
    };
}

function normalizeTitle(title) {
    let text = '';

    if (title !== null && title !== undefined) {
        text = String(title).trim().toLowerCase();
    }

    return text;
}

// Une autre liste du même admin, hors celles déjà liées à ce planning.
async function findConflictingShoppingList(adminId, title, planningId, transaction) {
    const adminLists = await ShoppingList.findAll({
        where: {
            adminId: adminId,
        },
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        transaction: transaction,
    });

    const wantedTitle = normalizeTitle(title);
    let found = null;

    for (let index = 0; index < adminLists.length; index++) {
        const candidate = adminLists[index];
        const storedTitle = normalizeTitle(candidate.title);

        if (found === null) {
            if (Number(candidate.planningId) !== planningId) {
                if (storedTitle === wantedTitle) {
                    found = candidate;
                }
            }
        }
    }

    return found;
}

async function findOwnedPlanning(planningId, adminId) {
    let planning = null;

    if (planningId !== null) {
        planning = await Planning.findOne({
            where: {
                id: planningId,
                adminId: adminId,
            },
        });
    }

    return planning;
}

export async function listPlannings(req, res) {
    const plannings = await Planning.findAll({
        where: {
            adminId: req.session.adminId,
        },
        attributes: ['id', 'title'],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
    });

    const data = [];

    for (let index = 0; index < plannings.length; index++) {
        data.push({
            id: plannings[index].id,
            title: plannings[index].title,
        });
    }

    res.status(200).json(data);
}

export async function createPlanning(req, res) {
    const planning = await Planning.create({
        adminId: req.session.adminId,
        title: req.body.title,
    });

    res.status(201).json({
        id: planning.id,
        title: planning.title,
    });
}

export async function updatePlanning(req, res) {
    const planningId = readPositiveId(req.params.id);

    if (planningId === null) {
        res.status(404).json({ error: 'Planning introuvable' });
    } else {
        let replaceExisting = false;

        if (req.body.replace === true) {
            replaceExisting = true;
        }

        const outcome = await sequelize.transaction(async function (transaction) {
            const planning = await Planning.findOne({
                where: {
                    id: planningId,
                    adminId: req.session.adminId,
                },
                transaction: transaction,
            });

            if (!planning) {
                return {
                    missing: true,
                    conflict: false,
                };
            }

            const other = await findConflictingShoppingList(
                req.session.adminId,
                req.body.title,
                planning.id,
                transaction
            );

            if (other !== null && replaceExisting === false) {
                return {
                    missing: false,
                    conflict: true,
                    listId: other.id,
                };
            }

            // replace true : l'autre liste part avec ses articles, pas son planning.
            if (other !== null) {
                await other.destroy({ transaction: transaction });
            }

            await planning.update({
                title: req.body.title,
            }, { transaction: transaction });

            const linkedLists = await ShoppingList.findAll({
                where: {
                    adminId: req.session.adminId,
                    planningId: planning.id,
                },
                transaction: transaction,
            });

            for (let index = 0; index < linkedLists.length; index++) {
                await linkedLists[index].update({
                    title: req.body.title,
                }, { transaction: transaction });
            }

            return {
                missing: false,
                conflict: false,
                id: planning.id,
                title: planning.title,
            };
        });

        if (outcome.missing === true) {
            res.status(404).json({ error: 'Planning introuvable' });
        } else if (outcome.conflict === true) {
            res.status(409).json({
                error: 'Une liste porte déjà ce nom. La nouvelle va remplacer l\'ancienne.',
                listId: outcome.listId,
            });
        } else {
            res.status(200).json({
                id: outcome.id,
                title: outcome.title,
            });
        }
    }
}

export async function deletePlanning(req, res) {
    const planningId = readPositiveId(req.params.id);
    const planning = await findOwnedPlanning(planningId, req.session.adminId);

    if (!planning) {
        res.status(404).json({ error: 'Planning introuvable' });
    } else {
        await planning.destroy();
        res.status(204).send();
    }
}

export async function listPlanningEntries(req, res) {
    const planningId = readPositiveId(req.params.id);
    const planning = await findOwnedPlanning(planningId, req.session.adminId);

    if (!planning) {
        res.status(404).json({ error: 'Planning introuvable' });
    } else {
        const entries = await PlanningEntry.findAll({
            where: {
                planningId: planning.id,
                adminId: req.session.adminId,
            },
            include: planningIncludes,
            order: [['createdAt', 'ASC'], ['id', 'ASC']],
        });

        const data = [];

        for (let index = 0; index < entries.length; index++) {
            data.push(toPlanningEntryJson(entries[index]));
        }

        res.status(200).json(data);
    }
}

export async function createPlanningEntry(req, res) {
    const planningId = readPositiveId(req.params.id);
    const planning = await findOwnedPlanning(planningId, req.session.adminId);

    if (!planning) {
        res.status(404).json({ error: 'Planning introuvable' });
    } else {
        const recipeId = Number(req.body.recipeId);
        const mealTypeId = Number(req.body.mealTypeId);
        const day = req.body.day;
        const adminId = req.session.adminId;
        const recipe = await Recipe.findByPk(recipeId);

        if (!recipe) {
            res.status(404).json({ error: 'Recette introuvable' });
        } else {
            const mealType = await MealType.findByPk(mealTypeId);

            if (!mealType) {
                res.status(404).json({ error: 'Type de repas introuvable' });
            } else {
                const created = await PlanningEntry.create({
                    adminId: adminId,
                    planningId: planning.id,
                    recipeId: recipeId,
                    day: day,
                    mealTypeId: mealTypeId,
                });

                const entry = await PlanningEntry.findByPk(created.id, {
                    include: planningIncludes,
                });

                res.status(201).json(toPlanningEntryJson(entry));
            }
        }
    }
}

export async function deletePlanningEntry(req, res) {
    const planningId = readPositiveId(req.params.id);
    const entryId = readPositiveId(req.params.entryId);
    const planning = await findOwnedPlanning(planningId, req.session.adminId);

    if (!planning) {
        res.status(404).json({ error: 'Planning introuvable' });
    } else if (entryId === null) {
        res.status(404).json({ error: 'Entrée de planning introuvable' });
    } else {
        const entry = await PlanningEntry.findOne({
            where: {
                id: entryId,
                planningId: planning.id,
                adminId: req.session.adminId,
            },
        });

        if (!entry) {
            res.status(404).json({ error: 'Entrée de planning introuvable' });
        } else {
            await entry.destroy();
            res.status(204).send();
        }
    }
}
