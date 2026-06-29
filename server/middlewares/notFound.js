/**
 * Réponse 404 pour toute requête qui n'a matché aucune route déclarée avant.
 */
export default function notFound(req, res) {
    const status = 404;
    const message = 'Route introuvable';

    res.status(status).json({ error: message });
}