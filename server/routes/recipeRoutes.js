// URLs recettes. Les commentaires sont branches sur une recette.
import { Router } from "express";
import { getRecipeById, listRecipes, createRecipe, updateRecipe, deleteRecipe, addRecipePhoto } from "../controllers/recipeController.js";
import { listComments, createComment, deleteComment } from '../controllers/commentController.js';
import { uploadRecipePhoto } from "../middlewares/uploadImage.js";
import { requireAuth } from "../middlewares/accessControl.js";
import validate from "../middlewares/validate.js";
import verifyCaptcha from '../middlewares/verifyCaptcha.js';
import { createRecipeRules } from "../validators/createRecipeRules.js";
import { createCommentRules } from '../validators/createCommentRules.js';



const router = Router();

router.post('/', requireAuth, createRecipeRules, validate, createRecipe);
router.post('/:id/photo', requireAuth, uploadRecipePhoto, addRecipePhoto);
router.post('/:id/comments', createCommentRules, validate, verifyCaptcha, createComment);

router.get('/', listRecipes);
router.get('/:id', getRecipeById);
router.get('/:id/comments', listComments);


router.put('/:id', requireAuth, createRecipeRules, validate, updateRecipe);

router.delete('/:id/comments/:commentId', requireAuth, deleteComment);
router.delete('/:id', requireAuth, deleteRecipe);

export default router;


