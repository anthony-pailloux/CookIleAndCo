// renvoie 400 { error, fields } si la validation a échoué
import { validationResult } from 'express-validator';

export default function validate(req, res, next) {
    // Récupère le résultat des règles body()
    const result = validationResult(req);

    // S'il y a au moins une erreur de validation
    if (!result.isEmpty()) {
        // objet vide
        const fieldErrors = {};
        // tableau des erreurs,renvoyé par express-validator
        const errors = result.array();

        for (let index = 0; index < errors.length; index++) {
            const item = errors[index];

            // garde une seule erreur par champ
            if (!fieldErrors[item.path]) {
                fieldErrors[item.path] = item.msg;

            }
        };

        res.status(400).json({
            error: 'Validation échouée',
            fields: fieldErrors,
        });

    } else {
        next();
    }
}