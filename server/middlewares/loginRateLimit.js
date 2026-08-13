
import rateLimit from 'express-rate-limit';

const loginRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    handler(req, res) {

        res.status(429).json({
            error: 'Trop de tentatives. Réessayez dans quelques minutes.',
        });
    },
});

export default loginRateLimit;