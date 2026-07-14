import bcrypt from 'bcrypt';
import User from '../models/User.js';

// connexion admin
export async function login(req, res) {

    const email = req.body.email;
    const password = req.body.password;

    // cherche l'utilisateur en BDD par email
    const user = await User.findOne({ where: { email } });

    // on ne dit pas si c'est l'email ou le mdp qui est invalide
    if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // compare le mdp saisi au hash stocké (jamais le mdp en clair)
    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
    }

    // ouvre la session : minimum userId + role + email (pas le mot de passe)
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;

    // renvoie les infos de l'utilisateur connecté
    return res.status(200).json({
        id: user.id,
        email: user.email,
        role: user.role,
    });
}

export function logout(req, res) {

    // supprime la session connectée
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        } else {
            return res.sendStatus(204);
        }
    });
}

// utilisateur connecté via la session (cookie httpOnly posé au login)
export function getCurrentUser(req, res) {

    // infos depuis la session (requireAdmin a déjà vérifié userId + role)
    return res.status(200).json({
        id: req.session.userId,
        email: req.session.email,
        role: req.session.role,
    });
}
