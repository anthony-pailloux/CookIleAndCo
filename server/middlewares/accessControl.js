// Bloque la route si personne n est connecte.

export function requireAdmin(req, res, next) {
    const userId = req.session.userId;

    if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
    } else {
        next();
    }
}
