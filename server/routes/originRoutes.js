import { Router } from "express";
import {
    listOrigin,
    createOrigin,
    updateOrigin,
    deleteOrigin,
} from "../controllers/originController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { nameRules } from "../validators/nameRules.js";

const router = Router();

router.get('/', listOrigin);

router.post('/', requireAdmin, nameRules, validate, createOrigin);
router.put('/:id', requireAdmin, nameRules, validate, updateOrigin);
router.delete('/:id', requireAdmin, deleteOrigin);

export default router;