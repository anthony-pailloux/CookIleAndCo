export async function register(req, res) {

    console.log('POST /api/auth/register - body:', req.body);
    res.status(201).json({ message: 'Register Ok' });

}