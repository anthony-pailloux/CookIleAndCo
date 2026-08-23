// lit les erreurs express-validator et renvoie 400ok

import { validationResult } from 'express-validator';

export default function validate(req, res, next) {

    // Récupère le résultat des règles body() passées avant ce middleware
    const result = validationResult(req);

    if (!result.isEmpty()) {

        res.status(400).json({
            error: 'Validation échouée',
            fields: result.mapped(),
        });

    } else {
        next();
    }
}