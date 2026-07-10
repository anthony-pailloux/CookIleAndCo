import { Router } from 'express';
import { login, logout, getCurrentUser } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { loginRules } from '../validators/loginRules.js';
import { requireAuth } from '../middlewares/accessControl.js';


const router = Router();

router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.get('/current-user', requireAuth, getCurrentUser);

export default router;
