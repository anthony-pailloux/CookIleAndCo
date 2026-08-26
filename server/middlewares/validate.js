// Si les champs du formulaire sont faux, on renvoie 400 et on arrete.

import { validationResult } from 'express-validator';

export default function validate(req, res, next) {

    // Lit le resultat des regles posees avant ce middleware
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