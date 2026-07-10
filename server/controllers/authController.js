import bcrypt from 'bcrypt';
import User from '../models/User.js';

// inscription utilisateur
export async function register(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const existingUser = await User.findOne({ where: { email: email } });

    // verifier si l'email existe en bdd
    if (existingUser) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // hash le mdp
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        email: email,
        passwordHash: passwordHash,
        role: 'user',
    });

    // on renvoie id, email, role (pas le hash)
    return res.status(201).json({
        id: user.id,
        email: user.email,
        role: user.role,
    });
}

// connexion utilisateur
export async function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    // cherche l'utilisateur en BDD par email
    const user = await User.findOne({ where: { email: email } });

    // on ne dit pas si c'est l'email ou le mdp qui est invalide
    if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // compare le mdp saisi au hash stocké (jamais le mdp en clair)
    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // ouvre la session : minimum userId + role (pas le mot de passe)
    req.session.userId = user.id;
    req.session.role = user.role;

    // renvoie les infos de l'utilisateur connecté
    return res.status(200).json({
        id: user.id,
        email: user.email,
        role: user.role,
    });
}

export function logout(req, res) {
    // supprime la session connecter 
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        } else {
            return res.sendStatus(204);
        }
    });
}

// utilisateur connecté via la session (cookie httpOnly posé au login)
export async function getCurrentUser(req, res) {

    // userId stocké en session au login 
    const userId = req.session.userId;

    // pas de session valide → visiteur non connecté
    if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    } else {

        // recharge l'utilisateur en BDD à partir de l'id session
        const user = await User.findByPk(userId);


        if (!user) {
            // session orpheline (compte supprimé entre-temps)
            return res.status(401).json({ error: 'Non authentifié' })
        } else {
            
            // on renvoie id, email, role, profilePhoto — pas le passwordHash
            return res.status(200).json({
                id: user.id,
                email: user.email,
                role: user.role,
                profilePhoto: user.profilePhoto,
            })
        }
    }

}