/**
 * Attrape les erreurs remontées par next(err) dans les routes.
 * Renvoie { "error": "..." } avec le bon code HTTP.
 */
export default function errorHandler(err, req, res, next) {
    console.error(err);

    const status = err.status || 500;

    let message;

    if (status === 500) {
        message = 'Erreur serveur';
    } else {
        message = err.message;
    }

    res.status(status).json({ error: message });
}