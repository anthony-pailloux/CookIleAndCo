// Listes de courses enregistrées de l'admin connecté.
// Une liste liée à un planning porte toujours le même titre que lui.
import sequelize from '../config/database.js';
import Planning from '../models/Planning.js';
import PlanningEntry from '../models/PlanningEntry.js';
import Recipe from '../models/Recipe.js';
import RecipeIngredient from '../models/RecipeIngredient.js';
import ShoppingList from '../models/ShoppingList.js';
import ShoppingListItem from '../models/ShoppingListItem.js';
import { aggregateShoppingItems } from '../services/aggregateShoppingItems.js';

const shoppingIncludes = [
    {
        model: Recipe,
        as: 'recipe',
        attributes: ['id'],
        required: true,
        include: [
            {
                model: RecipeIngredient,
                as: 'ingredients',
                attributes: ['quantity', 'unit', 'name', 'sortOrder'],
                required: false,
            },
        ],
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

function toShoppingItemJson(item) {
    return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        note: item.note,
        sortOrder: item.sortOrder,
    };
}

function toShoppingListJson(list) {
    let sourceItems = [];

    if (list.items !== null && list.items !== undefined) {
        sourceItems = list.items.slice();
    }

    sourceItems.sort(function (firstItem, secondItem) {
        if (firstItem.sortOrder !== secondItem.sortOrder) {
            return firstItem.sortOrder - secondItem.sortOrder;
        }

        return firstItem.id - secondItem.id;
    });

    const items = [];

    for (let index = 0; index < sourceItems.length; index++) {
        items.push(toShoppingItemJson(sourceItems[index]));
    }

    return {
        id: list.id,
        title: list.title,
        planningId: list.planningId,
        createdAt: list.createdAt,
        items: items,
    };
}

export async function listShoppingLists(req, res) {
    const lists = await ShoppingList.findAll({
        where: {
            adminId: req.session.adminId,
        },
        attributes: ['id', 'title', 'planningId', 'createdAt'],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
    });

    const data = [];

    for (let index = 0; index < lists.length; index++) {
        data.push({
            id: lists[index].id,
            title: lists[index].title,
            planningId: lists[index].planningId,
            createdAt: lists[index].createdAt,
        });
    }

    res.status(200).json(data);
}

function normalizeTitle(title) {
    let text = '';

    if (title !== null && title !== undefined) {
        text = String(title).trim().toLowerCase();
    }

    return text;
}

function readOptionalText(value) {
    let result = null;

    if (value !== null && value !== undefined) {
        const text = String(value).trim();

        if (text !== '') {
            result = text;
        }
    }

    return result;
}

async function findOwnedShoppingList(listId, adminId) {
    let list = null;

    if (listId !== null) {
        list = await ShoppingList.findOne({
            where: {
                id: listId,
                adminId: adminId,
            },
        });
    }

    return list;
}

async function findOtherListByTitle(adminId, title, currentListId, transaction) {
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
            if (candidate.id !== currentListId) {
                if (storedTitle === wantedTitle) {
                    found = candidate;
                }
            }
        }
    }

    return found;
}

async function writeShoppingListItems(listId, items, transaction) {
    await ShoppingListItem.destroy({
        where: {
            shoppingListId: listId,
        },
        transaction: transaction,
    });

    const rows = [];

    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        let quantity = null;
        let note = null;

        if (item.quantity !== null && item.quantity !== undefined) {
            quantity = String(item.quantity);
        }

        if (item.note !== null && item.note !== undefined) {
            const noteText = String(item.note).trim();

            if (noteText !== '') {
                note = noteText;
            }
        }

        rows.push({
            shoppingListId: listId,
            name: item.name,
            unit: item.unit,
            quantity: quantity,
            note: note,
            sortOrder: index,
        });
    }

    if (rows.length > 0) {
        await ShoppingListItem.bulkCreate(rows, { transaction: transaction });
    }
}

export async function createShoppingList(req, res) {
    const planningId = Number(req.body.planningId);
    const adminId = req.session.adminId;
    const planning = await Planning.findOne({
        where: {
            id: planningId,
            adminId: adminId,
        },
    });

    if (!planning) {
        res.status(404).json({ error: 'Planning introuvable' });
    } else {
        const entries = await PlanningEntry.findAll({
            where: {
                planningId: planning.id,
                adminId: adminId,
            },
            include: shoppingIncludes,
            order: [['createdAt', 'ASC'], ['id', 'ASC']],
        });

        const aggregated = aggregateShoppingItems(entries);

        if (aggregated.length === 0) {
            res.status(400).json({
                error: 'Ce planning n\'a aucune recette ou aucun ingrédient.',
            });
        } else {
            // Même titre (trim, casse ignorée) : prévenir, puis remplacer seulement si replace est vrai.
            let replaceExisting = false;

            if (req.body.replace === true) {
                replaceExisting = true;
            }

            const outcome = await sequelize.transaction(async function (transaction) {
                const adminLists = await ShoppingList.findAll({
                    where: {
                        adminId: adminId,
                    },
                    order: [['createdAt', 'DESC'], ['id', 'DESC']],
                    transaction: transaction,
                });

                const wantedTitle = normalizeTitle(req.body.title);
                const matching = [];

                for (let index = 0; index < adminLists.length; index++) {
                    const storedTitle = normalizeTitle(adminLists[index].title);

                    if (storedTitle === wantedTitle) {
                        matching.push(adminLists[index]);
                    }
                }

                if (matching.length === 0) {
                    const createdList = await ShoppingList.create({
                        adminId: adminId,
                        title: req.body.title,
                        planningId: planning.id,
                    }, { transaction: transaction });

                    await writeShoppingListItems(createdList.id, aggregated, transaction);

                    // La liste et le planning lié naissent avec le même titre.
                    await planning.update({
                        title: req.body.title,
                    }, { transaction: transaction });

                    return {
                        listId: createdList.id,
                        created: true,
                        conflict: false,
                    };
                }

                const target = matching[0];

                if (replaceExisting === false) {
                    return {
                        listId: target.id,
                        created: false,
                        conflict: true,
                    };
                }

                // La liste gardée prend ce titre et ce planning. Les articles sont réécrits juste après.
                await target.update({
                    title: req.body.title,
                    planningId: planning.id,
                }, { transaction: transaction });
                await writeShoppingListItems(target.id, aggregated, transaction);
                await planning.update({
                    title: req.body.title,
                }, { transaction: transaction });

                return {
                    listId: target.id,
                    created: false,
                    conflict: false,
                };
            });

            if (outcome.conflict === true) {
                res.status(409).json({
                    error: 'Une liste porte déjà ce nom. La nouvelle va remplacer l\'ancienne.',
                    listId: outcome.listId,
                });
            } else {
                const fullList = await ShoppingList.findByPk(outcome.listId, {
                    include: [
                        {
                            model: ShoppingListItem,
                            as: 'items',
                        },
                    ],
                });

                if (outcome.created === true) {
                    res.status(201).json(toShoppingListJson(fullList));
                } else {
                    res.status(200).json(toShoppingListJson(fullList));
                }
            }
        }
    }
}

export async function getShoppingList(req, res) {
    const listId = readPositiveId(req.params.id);

    if (listId === null) {
        res.status(404).json({ error: 'Liste de courses introuvable' });
    } else {
        const list = await ShoppingList.findOne({
            where: {
                id: listId,
                adminId: req.session.adminId,
            },
            include: [
                {
                    model: ShoppingListItem,
                    as: 'items',
                },
            ],
        });

        if (!list) {
            res.status(404).json({ error: 'Liste de courses introuvable' });
        } else {
            res.status(200).json(toShoppingListJson(list));
        }
    }
}

export async function deleteShoppingList(req, res) {
    const listId = readPositiveId(req.params.id);

    if (listId === null) {
        res.status(404).json({ error: 'Liste de courses introuvable' });
    } else {
        const list = await ShoppingList.findOne({
            where: {
                id: listId,
                adminId: req.session.adminId,
            },
        });

        if (!list) {
            res.status(404).json({ error: 'Liste de courses introuvable' });
        } else {
            await list.destroy();
            res.status(204).send();
        }
    }
}

export async function updateShoppingList(req, res) {
    const listId = readPositiveId(req.params.id);

    if (listId === null) {
        res.status(404).json({ error: 'Liste de courses introuvable' });
    } else {
        let replaceExisting = false;

        if (req.body.replace === true) {
            replaceExisting = true;
        }

        const outcome = await sequelize.transaction(async function (transaction) {
            const list = await ShoppingList.findOne({
                where: {
                    id: listId,
                    adminId: req.session.adminId,
                },
                transaction: transaction,
            });

            if (!list) {
                return {
                    missing: true,
                    conflict: false,
                };
            }

            const other = await findOtherListByTitle(
                req.session.adminId,
                req.body.title,
                list.id,
                transaction
            );

            if (other !== null && replaceExisting === false) {
                return {
                    missing: false,
                    conflict: true,
                    listId: other.id,
                };
            }

            // replace true : cette liste prend le nom, l'autre liste est supprimée avec ses articles.
            if (other !== null) {
                await other.destroy({ transaction: transaction });
            }

            await list.update({
                title: req.body.title,
            }, { transaction: transaction });

            if (list.planningId !== null && list.planningId !== undefined) {
                const linkedPlanning = await Planning.findOne({
                    where: {
                        id: list.planningId,
                        adminId: req.session.adminId,
                    },
                    transaction: transaction,
                });

                if (linkedPlanning !== null) {
                    await linkedPlanning.update({
                        title: req.body.title,
                    }, { transaction: transaction });
                }
            }

            return {
                missing: false,
                conflict: false,
                id: list.id,
                title: list.title,
            };
        });

        if (outcome.missing === true) {
            res.status(404).json({ error: 'Liste de courses introuvable' });
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

export async function createShoppingListItem(req, res) {
    const listId = readPositiveId(req.params.id);
    const list = await findOwnedShoppingList(listId, req.session.adminId);

    if (!list) {
        res.status(404).json({ error: 'Liste de courses introuvable' });
    } else {
        const lastItem = await ShoppingListItem.findOne({
            where: {
                shoppingListId: list.id,
            },
            order: [['sortOrder', 'DESC'], ['id', 'DESC']],
        });

        let sortOrder = 0;

        if (lastItem !== null) {
            sortOrder = lastItem.sortOrder + 1;
        }

        const created = await ShoppingListItem.create({
            shoppingListId: list.id,
            name: req.body.name,
            quantity: readOptionalText(req.body.quantity),
            unit: readOptionalText(req.body.unit),
            note: null,
            sortOrder: sortOrder,
        });

        res.status(201).json(toShoppingItemJson(created));
    }
}

export async function updateShoppingListItem(req, res) {
    const listId = readPositiveId(req.params.id);
    const itemId = readPositiveId(req.params.itemId);
    const list = await findOwnedShoppingList(listId, req.session.adminId);

    if (!list) {
        res.status(404).json({ error: 'Liste de courses introuvable' });
    } else if (itemId === null) {
        res.status(404).json({ error: 'Article introuvable' });
    } else {
        const item = await ShoppingListItem.findOne({
            where: {
                id: itemId,
                shoppingListId: list.id,
            },
        });

        if (!item) {
            res.status(404).json({ error: 'Article introuvable' });
        } else {
            await item.update({
                name: req.body.name,
                quantity: readOptionalText(req.body.quantity),
                unit: readOptionalText(req.body.unit),
            });

            res.status(200).json(toShoppingItemJson(item));
        }
    }
}

export async function deleteShoppingListItem(req, res) {
    const listId = readPositiveId(req.params.id);
    const itemId = readPositiveId(req.params.itemId);
    const list = await findOwnedShoppingList(listId, req.session.adminId);

    if (!list) {
        res.status(404).json({ error: 'Liste de courses introuvable' });
    } else if (itemId === null) {
        res.status(404).json({ error: 'Article introuvable' });
    } else {
        const item = await ShoppingListItem.findOne({
            where: {
                id: itemId,
                shoppingListId: list.id,
            },
        });

        if (!item) {
            res.status(404).json({ error: 'Article introuvable' });
        } else {
            await item.destroy();
            res.status(204).send();
        }
    }
}
