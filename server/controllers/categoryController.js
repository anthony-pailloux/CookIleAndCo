// Requetes BDD pour les categories.
import Category from "../models/Category.js";
import Recipe from "../models/Recipe.js";

export async function listCategory(req, res) {
    const result = await Category.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'image'],
    });

    res.status(200).json({
        data: result,
    });
}

export async function createCategory(req, res) {
    const name = req.body.name;

    const existingCategory = await Category.findOne({
        where: { name: name },
    });

    if (existingCategory) {
        res.status(409).json({ error: 'Cette catégorie existe déjà' });
    } else {
        const newCategory = await Category.create({
            name: name,
        });

        res.status(201).json(newCategory);
    }
}

export async function updateCategory(req, res) {
    const id = req.params.id;

    const category = await Category.findByPk(id);

    if (!category) {
        res.status(404).json({ error: 'Catégorie introuvable' });
        return;
    }

    const name = req.body.name;

    const existingCategory = await Category.findOne({
        where: { name: name },
    });

    if (existingCategory && existingCategory.id !== category.id) {
        res.status(409).json({ error: 'Cette catégorie existe déjà' });
    } else {
        await category.update({
            name: name,
        });

        res.status(200).json(category);
    }
}

export async function addCategoryImage(req, res) {
    const id = req.params.id;

    const category = await Category.findByPk(id);

    if (!category) {
        res.status(404).json({ error: 'Catégorie introuvable' });
        return;
    }

    if (!req.file) {
        res.status(400).json({ error: 'Image requise' });
        return;
    }

    const imagePath = '/uploads/categories/' + req.file.filename;

    await category.update({ image: imagePath });

    res.status(200).json(category);
}

export async function deleteCategory(req, res) {
    const id = req.params.id;

    const category = await Category.findByPk(id);

    if (!category) {
        res.status(404).json({ error: 'Catégorie introuvable' });
        return;
    }

    const recipeCount = await Recipe.count({
        where: { categoryId: id },
    });

    if (recipeCount > 0) {
        res.status(409).json({
            error: 'Impossible de supprimer : des recettes utilisent cette catégorie',
        });
    } else {
        await category.destroy();

        res.status(200).json({ message: 'Catégorie supprimée' });
    }
}