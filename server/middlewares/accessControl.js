// Bloque la route si aucun admin n'est connecté (session sans adminId).

export function requireAuth(req, res, next) {
    const adminId = req.session.adminId;

    if (!adminId) {
        res.status(401).json({ error: 'Non authentifié' });
    } else {
        next();
    }
}
