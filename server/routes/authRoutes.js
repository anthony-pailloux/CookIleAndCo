import { Router } from 'express';
import { login, logout, register, getCurrentUser } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { registerRules } from '../validators/registerRules.js';
import { loginRules } from '../validators/loginRules.js';



const router = Router();

router.get('/current-user', getCurrentUser);

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);


export default router;
