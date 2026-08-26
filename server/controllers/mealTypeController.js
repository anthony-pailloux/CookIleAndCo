// Requetes BDD pour les types de repas.
import MealType from "../models/MealType.js";
import Recipe from "../models/Recipe.js";

export async function listMealType(req, res) {
    const result = await MealType.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name'],
    });

    res.status(200).json({
        data: result,
    });
}

export async function createMealType(req, res) {
    const name = req.body.name;

    const existingMealType = await MealType.findOne({
        where: { name: name },
    });

    if (existingMealType) {
        res.status(409).json({ error: 'Ce type de repas existe déjà' });
    } else {
        const newMealType = await MealType.create({
            name: name,
        });

        res.status(201).json(newMealType);
    }
}

export async function updateMealType(req, res) {
    const id = req.params.id;

    const mealType = await MealType.findByPk(id);

    if (!mealType) {
        res.status(404).json({ error: 'Type de repas introuvable' });
        return;
    }

    const name = req.body.name;

    const existingMealType = await MealType.findOne({
        where: { name: name },
    });

    if (existingMealType && existingMealType.id !== mealType.id) {
        res.status(409).json({ error: 'Ce type de repas existe déjà' });
    } else {
        await mealType.update({
            name: name,
        });

        res.status(200).json(mealType);
    }
}

export async function deleteMealType(req, res) {
    const id = req.params.id;

    const mealType = await MealType.findByPk(id);

    if (!mealType) {
        res.status(404).json({ error: 'Type de repas introuvable' });
        return;
    }

    const recipeCount = await Recipe.count({
        where: { mealTypeId: id },
    });

    if (recipeCount > 0) {
        res.status(409).json({
            error: 'Impossible de supprimer : des recettes utilisent ce type de repas',
        });
    } else {
        await mealType.destroy();

        res.status(200).json({ message: 'Type de repas supprimé' });
    }
}