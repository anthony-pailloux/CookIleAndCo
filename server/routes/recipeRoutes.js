import { Router } from "express";
import { getRecipeById, listRecipes, createRecipe, updateRecipe, deleteRecipe, addRecipePhoto } from "../controllers/recipeController.js";
import uploadRecipePhoto from "../middlewares/uploadRecipePhoto.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { createRecipeRules } from "../validators/createRecipeRules.js";

const router = Router();

router.post('/', requireAdmin, createRecipeRules, validate, createRecipe);
router.post('/:id/photo', requireAdmin, uploadRecipePhoto, addRecipePhoto);

router.get('/', listRecipes);
router.get('/:id', getRecipeById);


router.put('/:id', requireAdmin, createRecipeRules, validate, updateRecipe);

router.delete('/:id', requireAdmin, deleteRecipe);

export default router;


