import { Router } from 'express';
import { login, logout, getCurrentUser } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { loginRules } from '../validators/loginRules.js';

const router = Router();

router.get('/current-user', getCurrentUser);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);


export default router;
