import { Router } from 'express';
import { login, logout, register, getCurrentUser } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { registerRules } from '../validators/registerRules.js';
import { loginRules } from '../validators/loginRules.js';
import { requireAdmin, requireAuth } from '../middlewares/accessControl.js';

// route de test TCK-203 — à retirer une fois les middlewares validés
function testAuthRoute(req, res) {
    console.log('GET /test-auth — handler atteint');
    res.status(200).json({ message: 'Accès autorisé' });
}

function testAdminRoute(req, res) {
    console.log('GET /test-admin — handler atteint'); 
    res.status(200).json({ message: 'Accès admin autorisé' });
}

const router = Router();

router.get('/current-user', getCurrentUser);
router.get('/test-auth', requireAuth, testAuthRoute);
router.get('/test-admin', requireAuth, requireAdmin, testAdminRoute);

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);


export default router;
