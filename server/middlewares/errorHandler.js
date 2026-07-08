// renvoie une erreur json quand ça plante

export default function errorHandler(err, req, res, next) {
    console.error(err);

    const status = err.status || 500;

    let message;

    if (status === 500) {
        // message générique, on ne montre pas le détail technique
        message = 'Erreur serveur';
    } else {
        message = err.message;
    }

    res.status(status).json({ error: message });
}