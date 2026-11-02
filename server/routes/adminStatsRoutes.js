// Statistiques admin : flux des pages, et ouvertures de fiches sur la période.
import { Router } from 'express';
import { requireAuth } from '../middlewares/accessControl.js';
import { getRecipeViewStats } from '../controllers/recipeViewController.js';

const router = Router();

router.get('/recipe-views', requireAuth, getRecipeViewStats);

export default router;
