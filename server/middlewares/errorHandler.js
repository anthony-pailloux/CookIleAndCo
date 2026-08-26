// Renvoie une erreur JSON quand ca plante.
export default function errorHandler(err, req, res, next) {
    console.error(err);

    let status = err.status || 500;
    let message;

    if (err.code === 'LIMIT_FILE_SIZE') {
        status = 400;
        message = 'Image trop volumineuse (max 5 Mo)';
    } else if (err.message === 'Format photo invalide (JPG, PNG ou WebP)') {
        status = 400;
        message = err.message;
    } else if (status === 500) {
        message = 'Erreur serveur';
    } else {
        message = err.message;
    }

    res.status(status).json({ error: message });
}