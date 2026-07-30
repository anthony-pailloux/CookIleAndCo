import { Router } from "express";
import { getRecipeById, listRecipes, createRecipe, updateRecipe, deleteRecipe } from "../controllers/recipeController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { createRecipeRules } from "../validators/createRecipeRules.js";

const router = Router();

router.get('/', listRecipes);
router.get('/:id', getRecipeById);

router.post('/', requireAdmin, createRecipeRules, validate, createRecipe );

router.put('/:id', requireAdmin, createRecipeRules, validate, updateRecipe);

router.delete('/:id', requireAdmin, deleteRecipe);

export default router;


