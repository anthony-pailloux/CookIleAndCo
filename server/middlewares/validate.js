// lit les erreurs express-validator et renvoie 400 { error, fields }.
import { validationResult } from 'express-validator';

export default function validate(req, res, next) {

    // Récupère le résultat des règles body() passées avant ce middleware (ex. registerRules)
    const result = validationResult(req);

    if (!result.isEmpty()) {

        // mapped() = { email: "...", password: "..." } — une erreur par champ
        res.status(400).json({
            error: 'Validation échouée',
            fields: result.mapped(),
        });

    } else {
        next();
    }
}