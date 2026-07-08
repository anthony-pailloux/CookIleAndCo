import { Router } from 'express';
import { register } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { registerRules } from '../validators/registerRules.js';



const router = Router();

router.post('/register', registerRules, validate, register);

export default router;
