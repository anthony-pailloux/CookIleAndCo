// Requetes BDD pour les origines.
import Origin from "../models/Origin.js";
import Recipe from "../models/Recipe.js";

export async function listOrigin(req, res) {
    const result = await Origin.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'image'],
    });

    res.status(200).json({
        data: result,
    });
}

export async function createOrigin(req, res) {
    const name = req.body.name;

    const existingOrigin = await Origin.findOne({
        where: { name: name },
    });

    if (existingOrigin) {
        res.status(409).json({ error: 'Cette origine existe déjà' });
    } else {
        const newOrigin = await Origin.create({
            name: name,
        });

        res.status(201).json(newOrigin);
    }
}

export async function updateOrigin(req, res) {
    const id = req.params.id;

    const origin = await Origin.findByPk(id);

    if (!origin) {
        res.status(404).json({ error: 'Origine introuvable' });
        return;
    }

    const name = req.body.name;

    const existingOrigin = await Origin.findOne({
        where: { name: name },
    });

    if (existingOrigin && existingOrigin.id !== origin.id) {
        res.status(409).json({ error: 'Cette origine existe déjà' });
    } else {
        await origin.update({
            name: name,
        });

        res.status(200).json(origin);
    }
}

export async function addOriginImage(req, res) {
    const id = req.params.id;

    const origin = await Origin.findByPk(id);

    if (!origin) {
        res.status(404).json({ error: 'Origine introuvable' });
        return;
    }

    if (!req.file) {
        res.status(400).json({ error: 'Image requise' });
        return;
    }

    const imagePath = '/uploads/origins/' + req.file.filename;

    await origin.update({ image: imagePath });

    res.status(200).json(origin);
}

export async function deleteOrigin(req, res) {
    const id = req.params.id;

    const origin = await Origin.findByPk(id);

    if (!origin) {
        res.status(404).json({ error: 'Origine introuvable' });
        return;
    }

    const recipeCount = await Recipe.count({
        where: { originId: id },
    });

    if (recipeCount > 0) {
        res.status(409).json({
            error: 'Impossible de supprimer : des recettes utilisent cette origine',
        });
    } else {
        await origin.destroy();

        res.status(200).json({ message: 'Origine supprimée' });
    }
}