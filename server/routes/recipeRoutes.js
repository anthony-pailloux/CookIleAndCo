import { Router } from "express";
import { getRecipeById, listRecipes, createRecipe } from "../controllers/recipeController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { createRecipeRules } from "../validators/createRecipeRules.js";

const router = Router();

router.post('/', requireAdmin, createRecipeRules, validate, createRecipe);

router.get('/', listRecipes);
router.get('/:id', getRecipeById);

export default router;


