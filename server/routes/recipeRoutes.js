import { Router } from "express";
import { getRecipeById, listRecipes, createRecipe, updateRecipe  } from "../controllers/recipeController.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import { createRecipeRules } from "../validators/createRecipeRules.js";

const router = Router();

router.get('/', listRecipes);
router.get('/:id', getRecipeById);

router.post('/', requireAdmin, createRecipeRules, validate, createRecipe );

router.put('/:id', requireAdmin, updateRecipe);

export default router;


