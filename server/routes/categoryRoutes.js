import { Router } from "express";
import {
    listCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categoryController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { categoryRules } from "../validators/categoryRules.js";

const router = Router();

router.get('/', listCategory);

router.post('/', requireAdmin, categoryRules, validate, createCategory);
router.put('/:id', requireAdmin, categoryRules, validate, updateCategory);
router.delete('/:id', requireAdmin, deleteCategory);

export default router;