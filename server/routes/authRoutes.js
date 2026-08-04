import { Router } from 'express';
import { login, logout, getCurrentUser, createAdmin, listAdmins, deleteAdmin } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { loginRules } from '../validators/loginRules.js';
import { requireAdmin } from '../middlewares/accessControl.js';
import { createAdminRules } from '../validators/createAdminRules.js';


const router = Router();

router.get('/admins', requireAdmin, listAdmins);
router.get('/current-user', requireAdmin, getCurrentUser);

router.post('/admins', requireAdmin, createAdminRules, validate, createAdmin);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);

router.delete('/admins/:id', requireAdmin, deleteAdmin);

export default router;
