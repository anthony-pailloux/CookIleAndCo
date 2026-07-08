import bcrypt from 'bcrypt';
import User from '../models/User.js';

export async function register(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const existingUser = await User.findOne({ where: { email: email }});

    if(existingUser) {
        return res.status(409).json({ error: 'Cet email est deja utilisé' })
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        email: email,
        passwordHash: passwordHash,
        role: 'user',
    });

    res.status(201).json({ 
        id: user.id,
        email: user.email,
        role: user.role,
     });

}