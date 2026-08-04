import { Router } from 'express';
import { login, logout, getCurrentUser, createAdmin } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { loginRules } from '../validators/loginRules.js';
import { requireAdmin } from '../middlewares/accessControl.js';
import { createAdminRules } from '../validators/createAdminRules.js';


const router = Router();

router.post('/admins', requireAdmin, createAdminRules, validate, createAdmin);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.get('/current-user', requireAdmin, getCurrentUser);

export default router;
