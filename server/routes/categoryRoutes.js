// URLs des categories.
import { Router } from "express";
import {
    listCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    addCategoryImage,
} from "../controllers/categoryController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { nameRules } from "../validators/nameRules.js";
import { uploadCategoryImage } from "../middlewares/uploadImage.js";

const router = Router();

router.get('/', listCategory);

router.post('/', requireAdmin, nameRules, validate, createCategory);
router.put('/:id', requireAdmin, nameRules, validate, updateCategory);
router.post('/:id/image', requireAdmin, uploadCategoryImage, addCategoryImage);
router.delete('/:id', requireAdmin, deleteCategory);

export default router;