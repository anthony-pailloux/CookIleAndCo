import { Router } from "express";
import { getRecipeById, listRecipes } from "../controllers/recipeController.js";

const router = Router();

router.get('/', listRecipes);
router.get('/:id', getRecipeById);

export default router;


