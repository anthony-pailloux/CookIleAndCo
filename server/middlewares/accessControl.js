// Contrôle d'accès v1 : seul l'admin (Estelle) accède aux routes protégées.

export function requireAdmin(req, res, next) {
    const userId = req.session.userId;
    const role = req.session.role;

    if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
    } else if (role !== 'admin') {
        res.status(403).json({ error: 'Accès interdit' });
    } else {
        next();
    }
}
