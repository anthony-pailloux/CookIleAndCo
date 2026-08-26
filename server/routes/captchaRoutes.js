// URL du captcha (question anti-robot).
import { Router } from 'express';
import { getCaptcha } from '../controllers/captchaController.js';

const router = Router();

router.get('/', getCaptcha);

export default router;