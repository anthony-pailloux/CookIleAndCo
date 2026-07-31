import { Router } from "express";
import {
    listOrigin,
    createOrigin,
    updateOrigin,
    deleteOrigin,
} from "../controllers/originController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { originRules } from "../validators/originRules.js";

const router = Router();

router.get('/', listOrigin);

router.post('/', requireAdmin, originRules, validate, createOrigin);
router.put('/:id', requireAdmin, originRules, validate, updateOrigin);
router.delete('/:id', requireAdmin, deleteOrigin);

export default router;