import { Router } from "express";
import { listMealType } from "../controllers/mealTypeController.js";

const router = Router();

router.get('/', listMealType)

export default router;