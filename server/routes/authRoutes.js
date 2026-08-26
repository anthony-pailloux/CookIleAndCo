// URLs login, logout, session et comptes admin.
import { Router } from 'express';
import { login, logout, getCurrentAdmin, createAdmin, listAdmins, deleteAdmin, updateAdmin } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { loginRules } from '../validators/loginRules.js';
import { requireAuth } from '../middlewares/accessControl.js';
import { createAdminRules } from '../validators/createAdminRules.js';
import loginRateLimit from '../middlewares/loginRateLimit.js';


const router = Router();

router.get('/admins', requireAuth, listAdmins);
router.get('/current-admin', requireAuth, getCurrentAdmin);

router.post('/admins', requireAuth, createAdminRules, validate, createAdmin);
router.post('/login', loginRateLimit, loginRules, validate, login);
router.post('/logout', logout);

router.put('/admins/:id', requireAuth, createAdminRules, validate, updateAdmin);

router.delete('/admins/:id', requireAuth, deleteAdmin);

export default router;
