import { body } from 'express-validator';

export const registerRules = [
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Email invalide'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('8 caractères minimum'),

    body('confirmPassword').custom((value, { req }) => {

        if (value !== req.body.password) {
            throw new Error("Les mots de passe ne correspondent pas");

        } else {
            return true;

        }
    })

];