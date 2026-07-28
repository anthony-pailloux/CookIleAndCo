import MealType from "../models/MealType.js";

export async function listMealType(req, res) {
    const result = await MealType.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name'],
    });

    res.status(200).json({
        data: result,
    });
}