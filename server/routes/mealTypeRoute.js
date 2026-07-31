import { Router } from "express";
import {
    listMealType,
    createMealType,
    updateMealType,
    deleteMealType,
} from "../controllers/mealTypeController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { mealTypeRules } from "../validators/mealTypeRules.js";

const router = Router();

router.get('/', listMealType);

router.post('/', requireAdmin, mealTypeRules, validate, createMealType);
router.put('/:id', requireAdmin, mealTypeRules, validate, updateMealType);
router.delete('/:id', requireAdmin, deleteMealType);

export default router;