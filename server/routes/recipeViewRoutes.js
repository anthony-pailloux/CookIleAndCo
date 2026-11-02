// Visite d'une page publique : accueil, catalogue, catégories ou fiche.
import { Router } from 'express';
import validate from '../middlewares/validate.js';
import { createRecipeViewRules } from '../validators/recipeViewRules.js';
import { recordRecipeView } from '../controllers/recipeViewController.js';

const router = Router();

router.post('/', createRecipeViewRules, validate, recordRecipeView);

export default router;
