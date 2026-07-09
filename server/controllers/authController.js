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
    })


}