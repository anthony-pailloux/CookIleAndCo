// Middleware Express d'erreur : reçoit err (via next(err) ou throw dans une route) et renvoie { "error": "..." }.
 
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