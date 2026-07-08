// route inconnue, renvoie 404
export default function notFound(req, res) {
    const status = 404;
    const message = 'Route introuvable';

    res.status(status).json({ error: message });
}