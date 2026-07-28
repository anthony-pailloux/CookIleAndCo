import Category from "../models/Category.js";

export async function listCategory(req, res) {
    const result = await Category.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name'],
    });   

    res.status(200).json({
        data: result,
    });
}