// URLs types de repas. Lecture pour tous, ecriture pour l admin.
import { Router } from "express";
import {
    listMealType,
    createMealType,
    updateMealType,
    deleteMealType,
} from "../controllers/mealTypeController.js";
import { requireAuth } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { nameRules } from "../validators/nameRules.js";

const router = Router();

router.get('/', listMealType);

router.post('/', requireAuth, nameRules, validate, createMealType);
router.put('/:id', requireAuth, nameRules, validate, updateMealType);
router.delete('/:id', requireAuth, deleteMealType);

export default router;