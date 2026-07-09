import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { registerRules } from '../validators/registerRules.js';
import { loginRules } from '../validators/loginRules.js';



const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

export default router;
