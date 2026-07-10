// vérifie qu'une session valide existe avant d'accéder aux routes protégées
export function requireAuth(req, res, next) {
    const userId = req.session.userId;

    if (!userId) {
        // pas de session → visiteur non connecté
        res.status(401).json({ error: 'Non authentifié' });
    } else {
        // attache l'utilisateur à req pour les handlers suivants
        req.user = {
            id: userId,
            role: req.session.role,
        };
        next();
    }
}
