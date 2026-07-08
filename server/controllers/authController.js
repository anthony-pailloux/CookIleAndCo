import bcrypt from 'bcrypt';
import User from '../models/User.js';

export async function register(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    console.log('register — email:', email);

    const passwordHash = await bcrypt.hash(password, 10);

    console.log('register — passwordHash:', passwordHash);

    const user = await User.create({
        email: email,
        passwordHash: passwordHash,
        role: 'user',
    });
    
    console.log('register — user créé, id:', user.id);
    res.status(201).json({ message: 'User create' });

}