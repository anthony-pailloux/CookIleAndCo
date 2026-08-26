// URLs des origines.
import { Router } from "express";
import {
    listOrigin,
    createOrigin,
    updateOrigin,
    deleteOrigin,
} from "../controllers/originController.js";
import { requireAuth } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { nameRules } from "../validators/nameRules.js";

const router = Router();

router.get('/', listOrigin);

router.post('/', requireAuth, nameRules, validate, createOrigin);
router.put('/:id', requireAuth, nameRules, validate, updateOrigin);
router.delete('/:id', requireAuth, deleteOrigin);

export default router;