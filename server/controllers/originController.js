import Origin from "../models/Origin.js";

export async function listOrigin(req, res) {
    const result = await Origin.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name'],
    });

    res.status(200).json({
        data: result,
    });
}