import bcrypt from 'bcrypt';
import User from '../models/User.js';

// connexion admin
export async function login(req, res) {

    const email = req.body.email;
    const password = req.body.password;

    // cherche l'utilisateur en BDD par email
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
    }

    // ouvre la session 
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

// Création d'un compte admin
export async function createAdmin(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
        email: email,
        passwordHash: passwordHash,
        role: 'admin',
    });

    return res.status(201).json({
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
    });
}

// Liste des comptes admin
export async function listAdmins(req, res) {
    const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: ['id', 'email', 'role'],
        order: [['createdAt', 'ASC']],
    });

    const mainAdminEmail = process.env.ADMIN_EMAIL;
    const devAdminEmail = process.env.DEV_EMAIL;

    const data = [];

    for (let i = 0; i < admins.length; i++) {
        const admin = admins[i];
        let isPrincipal = false;
        let isDev = false;
        let isProtected = false;

        if (admin.email === mainAdminEmail) {
            isPrincipal = true;
            isProtected = true;
        } else if (admin.email === devAdminEmail) {
            isDev = true;
            isProtected = true;
        }

        data.push({
            id: admin.id,
            email: admin.email,
            role: admin.role,
            isPrincipal: isPrincipal,
            isDev: isDev,
            isProtected: isProtected,
        });
    }

    return res.status(200).json({ data: data });
}

// Suppression d'un compte admin (principal et dev protégés via .env)
export async function deleteAdmin(req, res) {
    const id = req.params.id;

    const admin = await User.findOne({
        where: { id: id, role: 'admin' },
    });

    if (!admin) {
        return res.status(404).json({ error: 'Administrateur introuvable' });
    }

    const mainAdminEmail = process.env.ADMIN_EMAIL;
    const devAdminEmail = process.env.DEV_EMAIL;

    if (admin.email === mainAdminEmail) {
        return res.status(403).json({
            error: 'Impossible de supprimer ce compte protégé',
        });
    } else if (admin.email === devAdminEmail) {
        return res.status(403).json({
            error: 'Impossible de supprimer ce compte protégé',
        });
    }

    await admin.destroy();

    return res.status(200).json({ message: 'Administrateur supprimé' });
}

// Modification d'un compte admin (principal et dev protégés via .env)
export async function updateAdmin(req, res) {
    const id = req.params.id;
    const email = req.body.email;
    const password = req.body.password;

    const admin = await User.findOne({
        where: { id: id, role: 'admin' },
    });

    if (!admin) {
        return res.status(404).json({ error: 'Administrateur introuvable' });
    }

    const mainAdminEmail = process.env.ADMIN_EMAIL;
    const devAdminEmail = process.env.DEV_EMAIL;

    if (admin.email === mainAdminEmail) {
        return res.status(403).json({
            error: 'Impossible de modifier ce compte protégé',
        });
    } else if (admin.email === devAdminEmail) {
        return res.status(403).json({
            error: 'Impossible de modifier ce compte protégé',
        });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser && existingUser.id !== admin.id) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    admin.email = email;
    admin.passwordHash = passwordHash;
    await admin.save();

    return res.status(200).json({
        id: admin.id,
        email: admin.email,
        role: admin.role,
    });
}