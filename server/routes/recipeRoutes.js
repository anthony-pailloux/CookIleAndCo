import { Router } from "express";
import { getRecipeById, listRecipes, createRecipe, updateRecipe, deleteRecipe, addRecipePhoto } from "../controllers/recipeController.js";
import { listComments, createComment } from '../controllers/commentController.js';
import uploadRecipePhoto from "../middlewares/uploadRecipePhoto.js";
import { requireAdmin } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import verifyCaptcha from '../middlewares/verifyCaptcha.js';
import { createRecipeRules } from "../validators/createRecipeRules.js";
import { createCommentRules } from '../validators/createCommentRules.js';



const router = Router();

router.post('/', requireAdmin, createRecipeRules, validate, createRecipe);
router.post('/:id/photo', requireAdmin, uploadRecipePhoto, addRecipePhoto);
router.post('/:id/comments', createCommentRules, validate, verifyCaptcha, createComment);

router.get('/', listRecipes);
router.get('/:id', getRecipeById);
router.get('/:id/comments', listComments);


router.put('/:id', requireAdmin, createRecipeRules, validate, updateRecipe);

router.delete('/:id', requireAdmin, deleteRecipe);

export default router;


