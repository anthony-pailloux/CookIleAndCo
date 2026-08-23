import { Router } from "express";
import {
    listMealType,
    createMealType,
    updateMealType,
    deleteMealType,
} from "../controllers/mealTypeController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { nameRules } from "../validators/nameRules.js";

const router = Router();

router.get('/', listMealType);

router.post('/', requireAdmin, nameRules, validate, createMealType);
router.put('/:id', requireAdmin, nameRules, validate, updateMealType);
router.delete('/:id', requireAdmin, deleteMealType);

export default router;