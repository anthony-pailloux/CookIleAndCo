// URLs des categories.
import { Router } from "express";
import {
    listCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    addCategoryImage,
} from "../controllers/categoryController.js";
import { requireAuth } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { nameRules } from "../validators/nameRules.js";
import { uploadCategoryImage } from "../middlewares/uploadImage.js";

const router = Router();

router.get('/', listCategory);

router.post('/', requireAuth, nameRules, validate, createCategory);
router.put('/:id', requireAuth, nameRules, validate, updateCategory);
router.post('/:id/image', requireAuth, uploadCategoryImage, addCategoryImage);
router.delete('/:id', requireAuth, deleteCategory);

export default router;