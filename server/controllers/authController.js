// Login, session et comptes admin.
import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';

// connexion admin
export async function login(req, res) {

    const email = req.body.email;
    const password = req.body.password;

    // cherche l admin en BDD par email
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const passwordOk = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordOk) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // ouvre la session
    req.session.adminId = admin.id;
    req.session.email = admin.email;

    // renvoie les infos de l admin connecte
    return res.status(200).json({
        id: admin.id,
        email: admin.email,
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

// Admin connecte via la session (cookie pose au login)
export function getCurrentAdmin(req, res) {

    // Infos depuis la session (requireAuth a deja verifie adminId)
    return res.status(200).json({
        id: req.session.adminId,
        email: req.session.email,
    });
}

// Creation d un compte admin
export async function createAdmin(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
        email: email,
        passwordHash: passwordHash,
    });

    return res.status(201).json({
        id: newAdmin.id,
        email: newAdmin.email,
    });
}

// Liste des comptes admin
export async function listAdmins(req, res) {
    const admins = await Admin.findAll({
        attributes: ['id', 'email'],
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
            isPrincipal: isPrincipal,
            isDev: isDev,
            isProtected: isProtected,
        });
    }

    return res.status(200).json({ data: data });
}

// Suppression d un compte admin (comptes proteges via .env)
export async function deleteAdmin(req, res) {
    const id = req.params.id;

    const admin = await Admin.findOne({
        where: { id: id },
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

// Modification d un compte admin (comptes proteges via .env)
export async function updateAdmin(req, res) {
    const id = req.params.id;
    const email = req.body.email;
    const password = req.body.password;

    const admin = await Admin.findOne({
        where: { id: id },
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

    const existingAdmin = await Admin.findOne({ where: { email } });

    if (existingAdmin && existingAdmin.id !== admin.id) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    admin.email = email;
    admin.passwordHash = passwordHash;
    await admin.save();

    return res.status(200).json({
        id: admin.id,
        email: admin.email,
    });
}